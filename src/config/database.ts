import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// Una sola instancia evita crear un grupo de conexiones por cada módulo.
export const database = new PrismaClient({ adapter });
