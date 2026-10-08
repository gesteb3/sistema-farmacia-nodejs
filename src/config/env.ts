import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  JWT_SECRET: z.string().min(32),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Configuracion invalida: ${z.prettifyError(result.error)}`);
}

// Centralizar la configuración evita leer process.env en todos los módulos.
export const env = result.data;
