import { z } from 'zod';

const purchaseItemSchema = z.object({
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
  quantity: z.coerce.number().int().positive().max(1_000_000),
  unitCost: z.coerce.number().positive().max(999_999_999.99).multipleOf(0.01),
});

export const createPurchaseSchema = z
  .object({
    supplierId: z.uuid('El identificador del proveedor no es válido.'),
    invoiceNumber: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((value) => value.toUpperCase()),
    purchaseDate: z.iso.date(
      'La fecha de compra debe usar el formato AAAA-MM-DD.',
    ),
    items: z.array(purchaseItemSchema).min(1).max(100),
  })
  .strict()
  .superRefine((purchase, context) => {
    const keys = new Set<string>();
    purchase.items.forEach((item, index) => {
      const key = `${item.medicationId}:${item.batchNumber}`;
      if (keys.has(key)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index],
          message:
            'El mismo medicamento y lote no puede repetirse en la compra.',
        });
      }
      keys.add(key);
    });
  });

export const listPurchasesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  supplierId: z.uuid().optional(),
});

export const purchaseIdSchema = z.uuid(
  'El identificador de la compra no es válido.',
);

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type ListPurchasesInput = z.infer<typeof listPurchasesSchema>;
