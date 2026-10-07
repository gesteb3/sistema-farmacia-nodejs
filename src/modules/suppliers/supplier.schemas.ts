import { z } from 'zod';

const nullableText = (maximum: number) =>
  z.string().trim().min(1).max(maximum).nullable().default(null);

const supplierFields = {
  nit: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  contactName: nullableText(120),
  phone: nullableText(25),
  email: z
    .email('El correo electrónico no es válido.')
    .max(150)
    .nullable()
    .default(null),
  address: nullableText(250),
};

export const createSupplierSchema = z.object(supplierFields).strict();

export const updateSupplierSchema = z
  .object({
    nit: supplierFields.nit.optional(),
    name: supplierFields.name.optional(),
    contactName: supplierFields.contactName.optional(),
    phone: supplierFields.phone.optional(),
    email: supplierFields.email.optional(),
    address: supplierFields.address.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.',
  });

export const supplierIdSchema = z.uuid('El identificador no es válido.');

export const listSuppliersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  includeInactive: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type ListSuppliersInput = z.infer<typeof listSuppliersSchema>;
