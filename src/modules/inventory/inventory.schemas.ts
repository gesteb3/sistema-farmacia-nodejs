import { z } from 'zod';

export const createBatchSchema = z.object({
  medicationId: z.uuid('El identificador del medicamento no es válido.'),
  batchNumber: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((value) => value.toUpperCase()),
  expirationDate: z.iso.date(
    'La fecha de vencimiento debe usar el formato AAAA-MM-DD.',
  ),
  initialStock: z.coerce.number().int().positive().max(1_000_000),
  reason: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .default('Registro inicial del lote'),
});

export const stockMovementSchema = z.object({
  quantity: z.coerce.number().int().positive().max(1_000_000),
  reason: z.string().trim().min(3).max(200),
});

export const batchIdSchema = z.uuid('El identificador del lote no es válido.');

export const listBatchesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  medicationId: z.uuid().optional(),
  status: z.enum(['all', 'available', 'expired']).default('all'),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type ListBatchesInput = z.infer<typeof listBatchesSchema>;
