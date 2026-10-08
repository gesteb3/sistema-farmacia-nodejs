import { z } from 'zod';

const saleItemSchema = z.object({
  medicationId: z.uuid('El identificador del medicamento no es válido.'),
  quantity: z.coerce.number().int().positive().max(100_000),
});

export const createSaleSchema = z
  .object({
    customerId: z
      .uuid('El identificador del cliente no es válido.')
      .nullable()
      .default(null),
    invoiceNumber: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((value) => value.toUpperCase()),
    items: z.array(saleItemSchema).min(1).max(100),
  })
  .strict()
  .superRefine((sale, context) => {
    const medicationIds = new Set<string>();
    sale.items.forEach((item, index) => {
      if (medicationIds.has(item.medicationId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index],
          message: 'Cada medicamento debe aparecer una sola vez en la venta.',
        });
      }
      medicationIds.add(item.medicationId);
    });
  });

export const listSalesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  customerId: z.uuid().optional(),
});

export const saleIdSchema = z.uuid(
  'El identificador de la venta no es válido.',
);

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type ListSalesInput = z.infer<typeof listSalesSchema>;
