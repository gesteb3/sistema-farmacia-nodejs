import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('El correo electrónico no es válido.')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  role: z.enum(['ADMIN', 'CASHIER']).default('CASHIER'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
