import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreatePurchaseInput,
  ListPurchasesInput,
} from './purchase.schemas.js';

const purchaseDetails = {
  supplier: { select: { id: true, nit: true, name: true } },
  items: {
    include: {
      medication: { select: { id: true, code: true, name: true } },
      batch: {
        select: {
          id: true,
          batchNumber: true,
          expirationDate: true,
          stock: true,
        },
      },
    },
  },
} satisfies Prisma.PurchaseInclude;

const toUtcDate = (date: string) => new Date(`${date}T00:00:00.000Z`);

export const purchaseService = {
  async create(input: CreatePurchaseInput) {
    return database.$transaction(
      async (transaction) => {
        const supplier = await transaction.supplier.findFirst({
          where: { id: input.supplierId, isActive: true },
        });
        if (!supplier)
          throw new AppError(404, 'El proveedor no existe o está inactivo.');

        const duplicate = await transaction.purchase.findUnique({
          where: {
            supplierId_invoiceNumber: {
              supplierId: input.supplierId,
              invoiceNumber: input.invoiceNumber,
            },
          },
        });
        if (duplicate) {
          throw new AppError(
            409,
            `La factura ${input.invoiceNumber} ya está registrada.`,
          );
        }

        const medicationIds = [
          ...new Set(input.items.map((item) => item.medicationId)),
        ];
        const medications = await transaction.medication.findMany({
          where: { id: { in: medicationIds }, isActive: true },
          select: { id: true },
        });
        if (medications.length !== medicationIds.length) {
          throw new AppError(
            404,
            'Uno o más medicamentos no existen o están inactivos.',
          );
        }

        // Sumar centavos enteros evita errores de punto flotante en el total.
        const totalCents = input.items.reduce(
          (total, item) =>
            total + Math.round(item.unitCost * 100) * item.quantity,
          0,
        );
        const purchase = await transaction.purchase.create({
          data: {
            supplierId: input.supplierId,
            invoiceNumber: input.invoiceNumber,
            purchaseDate: toUtcDate(input.purchaseDate),
            total: totalCents / 100,
          },
        });

        for (const item of input.items) {
          const expirationDate = toUtcDate(item.expirationDate);
          let batch = await transaction.inventoryBatch.findUnique({
            where: {
              medicationId_batchNumber: {
                medicationId: item.medicationId,
                batchNumber: item.batchNumber,
              },
            },
          });
          if (
            batch &&
            batch.expirationDate.getTime() !== expirationDate.getTime()
          ) {
            throw new AppError(
              409,
              `El lote ${item.batchNumber} ya tiene otra fecha de vencimiento.`,
            );
          }
          batch ??= await transaction.inventoryBatch.create({
            data: {
              medicationId: item.medicationId,
              batchNumber: item.batchNumber,
              expirationDate,
              stock: 0,
            },
          });

          const newStock = batch.stock + item.quantity;
          await transaction.inventoryBatch.update({
            where: { id: batch.id },
            data: { stock: newStock },
          });
          await transaction.inventoryMovement.create({
            data: {
              batchId: batch.id,
              type: 'ENTRY',
              quantity: item.quantity,
              previousStock: batch.stock,
              newStock,
              reason: `Compra ${input.invoiceNumber}`,
            },
          });
          await transaction.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              medicationId: item.medicationId,
              batchId: batch.id,
              quantity: item.quantity,
              unitCost: item.unitCost,
              subtotal: (Math.round(item.unitCost * 100) * item.quantity) / 100,
            },
          });
        }

        return transaction.purchase.findUniqueOrThrow({
          where: { id: purchase.id },
          include: purchaseDetails,
        });
      },
      { isolationLevel: 'Serializable' },
    );
  },

  async list(input: ListPurchasesInput) {
    const where: Prisma.PurchaseWhereInput = input.supplierId
      ? { supplierId: input.supplierId }
      : {};
    const skip = (input.page - 1) * input.limit;
    const [items, total] = await database.$transaction([
      database.purchase.findMany({
        where,
        include: purchaseDetails,
        orderBy: [{ purchaseDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: input.limit,
      }),
      database.purchase.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    const purchase = await database.purchase.findUnique({
      where: { id },
      include: purchaseDetails,
    });
    if (!purchase) throw new AppError(404, 'La compra solicitada no existe.');
    return purchase;
  },
};
