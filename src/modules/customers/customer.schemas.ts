import { z } from 'zod';

const optionalText = (maximum: number) =>
  z.string().trim().min(1).max(maximum).nullable().default(null);

const fields = {
  nit: optionalText(20).transform((value) => value?.toUpperCase() ?? null),
  name: z.string().trim().min(2).max(120),
  phone: optionalText(25),
  email: z
    .email('El correo electrónico no es válido.')
    .max(150)
    .nullable()
    .default(null),
  address: optionalText(250),
};

export const createCustomerSchema = z.object(fields).strict();
export const updateCustomerSchema = z
  .object({
    nit: fields.nit.optional(),
    name: fields.name.optional(),
    phone: fields.phone.optional(),
    email: fields.email.optional(),
    address: fields.address.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.',
  });
export const customerIdSchema = z.uuid('El identificador no es válido.');
export const listCustomersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(120).optional(),
  includeInactive: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
