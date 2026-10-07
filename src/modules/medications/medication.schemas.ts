import { z } from 'zod';

const moneySchema = z.coerce
  .number()
  .positive('El precio debe ser mayor que cero.')
  .max(999_999_999.99)
  .multipleOf(0.01, 'El precio admite como máximo dos decimales.');

const medicationFields = {
  code: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  activeIngredient: z.string().trim().min(2).max(120),
  presentation: z.string().trim().min(2).max(80),
  concentration: z.string().trim().min(1).max(60).nullable().default(null),
  purchasePrice: moneySchema,
  salePrice: moneySchema,
  requiresPrescription: z.boolean().default(false),
};

export const createMedicationSchema = z
  .object(medicationFields)
  .strict()
  .refine((data) => data.salePrice >= data.purchasePrice, {
    message: 'El precio de venta no puede ser menor al precio de compra.',
    path: ['salePrice'],
  });

export const updateMedicationSchema = z
  .object({
    code: medicationFields.code.optional(),
    name: medicationFields.name.optional(),
    activeIngredient: medicationFields.activeIngredient.optional(),
    presentation: medicationFields.presentation.optional(),
    concentration: medicationFields.concentration.optional(),
    purchasePrice: medicationFields.purchasePrice.optional(),
    salePrice: medicationFields.salePrice.optional(),
    requiresPrescription: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.',
  });

export const medicationIdSchema = z.uuid('El identificador no es válido.');

export const listMedicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  includeInactive: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type ListMedicationsInput = z.infer<typeof listMedicationsSchema>;
