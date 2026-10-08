import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { CreateSaleInput, ListSalesInput } from './sale.schemas.js';

const saleDetails = {
  customer: { select: { id: true, nit: true, name: true } },
  items: {
    include: {
      medication: { select: { id: true, code: true, name: true } },
      batch: { select: { id: true, batchNumber: true, expirationDate: true } },
    },
  },
} satisfies Prisma.SaleInclude;

export const saleService = {
  async create(input: CreateSaleInput) {
    return database.$transaction(
      async (transaction) => {
        if (input.customerId) {
          const customer = await transaction.customer.findFirst({
            where: { id: input.customerId, isActive: true },
          });
          if (!customer)
            throw new AppError(404, 'El cliente no existe o está inactivo.');
        }

        const duplicate = await transaction.sale.findUnique({
          where: { invoiceNumber: input.invoiceNumber },
        });
        if (duplicate)
          throw new AppError(
            409,
            `La factura ${input.invoiceNumber} ya existe.`,
          );

        const medicationIds = input.items.map((item) => item.medicationId);
        const medications = await transaction.medication.findMany({
          where: { id: { in: medicationIds }, isActive: true },
        });
        if (medications.length !== medicationIds.length) {
          throw new AppError(
            404,
            'Uno o más medicamentos no existen o están inactivos.',
          );
        }

        const medicationById = new Map(
          medications.map((medication) => [medication.id, medication]),
        );
        const totalCents = input.items.reduce((total, item) => {
          const medication = medicationById.get(item.medicationId);
          if (!medication) return total;
          return (
            total +
            Math.round(medication.salePrice.toNumber() * 100) * item.quantity
          );
        }, 0);
        const sale = await transaction.sale.create({
          data: {
            customerId: input.customerId,
            invoiceNumber: input.invoiceNumber,
            total: totalCents / 100,
          },
        });
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        for (const requestedItem of input.items) {
          const medication = medicationById.get(requestedItem.medicationId);
          if (!medication)
            throw new AppError(404, 'El medicamento solicitado no existe.');
          const batches = await transaction.inventoryBatch.findMany({
            where: {
              medicationId: requestedItem.medicationId,
              stock: { gt: 0 },
              expirationDate: { gte: today },
            },
            orderBy: [{ expirationDate: 'asc' }, { createdAt: 'asc' }],
          });
          const available = batches.reduce(
            (sum, batch) => sum + batch.stock,
            0,
          );
          if (available < requestedItem.quantity) {
            throw new AppError(
              409,
              `Stock insuficiente para ${medication.name}.`,
              {
                requested: requestedItem.quantity,
                available,
              },
            );
          }

          let remaining = requestedItem.quantity;
          for (const batch of batches) {
            if (remaining === 0) break;
            const quantity = Math.min(batch.stock, remaining);
            const newStock = batch.stock - quantity;
            await transaction.inventoryBatch.update({
              where: { id: batch.id },
              data: { stock: newStock },
            });
            await transaction.inventoryMovement.create({
              data: {
                batchId: batch.id,
                type: 'EXIT',
                quantity,
                previousStock: batch.stock,
                newStock,
                reason: `Venta ${input.invoiceNumber}`,
              },
            });
            const unitPrice = medication.salePrice.toNumber();
            await transaction.saleItem.create({
              data: {
                saleId: sale.id,
                medicationId: medication.id,
                batchId: batch.id,
                quantity,
                unitPrice,
                subtotal: (Math.round(unitPrice * 100) * quantity) / 100,
              },
            });
            remaining -= quantity;
          }
        }

        return transaction.sale.findUniqueOrThrow({
          where: { id: sale.id },
          include: saleDetails,
        });
      },
      { isolationLevel: 'Serializable' },
    );
  },

  async list(input: ListSalesInput) {
    const where: Prisma.SaleWhereInput = input.customerId
      ? { customerId: input.customerId }
      : {};
    const [items, total] = await database.$transaction([
      database.sale.findMany({
        where,
        include: saleDetails,
        orderBy: { soldAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      database.sale.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    const sale = await database.sale.findUnique({
      where: { id },
      include: saleDetails,
    });
    if (!sale) throw new AppError(404, 'La venta solicitada no existe.');
    return sale;
  },
};
