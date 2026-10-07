import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import type {
  CreateSupplierInput,
  ListSuppliersInput,
  UpdateSupplierInput,
} from './supplier.schemas.js';

export const supplierRepository = {
  findById: (id: string) => database.supplier.findUnique({ where: { id } }),
  findByNit: (nit: string) => database.supplier.findUnique({ where: { nit } }),
  create: (data: CreateSupplierInput) => database.supplier.create({ data }),

  update(id: string, data: UpdateSupplierInput) {
    const updateData: Prisma.SupplierUpdateInput = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        Object.assign(updateData, { [key]: value });
      }
    }

    return database.supplier.update({ where: { id }, data: updateData });
  },

  async findMany(input: ListSuppliersInput) {
    const where: Prisma.SupplierWhereInput = {
      ...(input.includeInactive ? {} : { isActive: true }),
      ...(input.search
        ? {
            OR: [
              { nit: { contains: input.search, mode: 'insensitive' } },
              { name: { contains: input.search, mode: 'insensitive' } },
              { contactName: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await database.$transaction([
      database.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: input.limit,
      }),
      database.supplier.count({ where }),
    ]);

    return { items, total };
  },
};
