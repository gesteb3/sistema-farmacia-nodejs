import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateBatchInput,
  ListBatchesInput,
  StockMovementInput,
} from './inventory.schemas.js';

type MovementType = 'ENTRY' | 'EXIT';

const toUtcDate = (date: string) => new Date(`${date}T00:00:00.000Z`);

const findActiveMedication = async (
  transaction: Prisma.TransactionClient,
  medicationId: string,
) => {
  const medication = await transaction.medication.findFirst({
    where: { id: medicationId, isActive: true },
  });

  if (!medication) {
    throw new AppError(404, 'El medicamento no existe o está inactivo.');
  }

  return medication;
};

export const inventoryService = {
  async createBatch(input: CreateBatchInput) {
    return database.$transaction(async (transaction) => {
      await findActiveMedication(transaction, input.medicationId);

      const duplicate = await transaction.inventoryBatch.findUnique({
        where: {
          medicationId_batchNumber: {
            medicationId: input.medicationId,
            batchNumber: input.batchNumber,
          },
        },
      });

      if (duplicate) {
        throw new AppError(
          409,
          `El lote ${input.batchNumber} ya está registrado para este medicamento.`,
        );
      }

      const batch = await transaction.inventoryBatch.create({
        data: {
          medicationId: input.medicationId,
          batchNumber: input.batchNumber,
          expirationDate: toUtcDate(input.expirationDate),
          stock: input.initialStock,
        },
        include: {
          medication: { select: { id: true, code: true, name: true } },
        },
      });

      await transaction.inventoryMovement.create({
        data: {
          batchId: batch.id,
          type: 'ENTRY',
          quantity: input.initialStock,
          previousStock: 0,
          newStock: input.initialStock,
          reason: input.reason,
        },
      });

      return batch;
    });
  },

  async listBatches(input: ListBatchesInput) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const where: Prisma.InventoryBatchWhereInput = {
      ...(input.medicationId ? { medicationId: input.medicationId } : {}),
      ...(input.status === 'available'
        ? { stock: { gt: 0 }, expirationDate: { gte: today } }
        : {}),
      ...(input.status === 'expired' ? { expirationDate: { lt: today } } : {}),
    };
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await database.$transaction([
      database.inventoryBatch.findMany({
        where,
        include: {
          medication: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ expirationDate: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: input.limit,
      }),
      database.inventoryBatch.count({ where }),
    ]);

    return { items, total };
  },

  async moveStock(
    batchId: string,
    input: StockMovementInput,
    type: MovementType,
  ) {
    return database.$transaction(
      async (transaction) => {
        const batch = await transaction.inventoryBatch.findUnique({
          where: { id: batchId },
        });

        if (!batch) {
          throw new AppError(404, 'El lote solicitado no existe.');
        }

        if (type === 'EXIT' && batch.stock < input.quantity) {
          throw new AppError(
            409,
            'No hay existencias suficientes en este lote.',
            {
              availableStock: batch.stock,
            },
          );
        }

        const newStock =
          type === 'ENTRY'
            ? batch.stock + input.quantity
            : batch.stock - input.quantity;

        const updatedBatch = await transaction.inventoryBatch.update({
          where: { id: batchId },
          data: { stock: newStock },
        });

        const movement = await transaction.inventoryMovement.create({
          data: {
            batchId,
            type,
            quantity: input.quantity,
            previousStock: batch.stock,
            newStock,
            reason: input.reason,
          },
        });

        return { batch: updatedBatch, movement };
      },
      { isolationLevel: 'Serializable' },
    );
  },

  async listMovements(batchId: string) {
    const batch = await database.inventoryBatch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });

    if (!batch) {
      throw new AppError(404, 'El lote solicitado no existe.');
    }

    return database.inventoryMovement.findMany({
      where: { batchId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
