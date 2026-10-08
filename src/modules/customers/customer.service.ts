import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from './customer.schemas.js';

const findCustomer = async (id: string) => {
  const customer = await database.customer.findUnique({ where: { id } });
  if (!customer) throw new AppError(404, 'El cliente solicitado no existe.');
  return customer;
};

const ensureUniqueNit = async (
  nit: string | null | undefined,
  currentId?: string,
) => {
  if (!nit) return;
  const customer = await database.customer.findUnique({ where: { nit } });
  if (customer && customer.id !== currentId) {
    throw new AppError(409, `Ya existe un cliente con el NIT ${nit}.`);
  }
};

export const customerService = {
  async create(data: CreateCustomerInput) {
    await ensureUniqueNit(data.nit);
    return database.customer.create({ data });
  },

  async list(input: ListCustomersInput) {
    const where: Prisma.CustomerWhereInput = {
      ...(input.includeInactive ? {} : { isActive: true }),
      ...(input.search
        ? {
            OR: [
              { nit: { contains: input.search, mode: 'insensitive' } },
              { name: { contains: input.search, mode: 'insensitive' } },
              { phone: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await database.$transaction([
      database.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      database.customer.count({ where }),
    ]);
    return { items, total };
  },

  findById: (id: string) => findCustomer(id),

  async update(id: string, data: UpdateCustomerInput) {
    await findCustomer(id);
    await ensureUniqueNit(data.nit, id);
    const updateData: Prisma.CustomerUpdateInput = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) Object.assign(updateData, { [key]: value });
    }
    return database.customer.update({ where: { id }, data: updateData });
  },

  async deactivate(id: string) {
    await findCustomer(id);
    await database.customer.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
