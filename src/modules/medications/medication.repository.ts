import type { Prisma } from '../../generated/prisma/client.js';
import { database } from '../../config/database.js';
import type {
  CreateMedicationInput,
  ListMedicationsInput,
  UpdateMedicationInput,
} from './medication.schemas.js';

export const medicationRepository = {
  findById: (id: string) => database.medication.findUnique({ where: { id } }),

  findByCode: (code: string) =>
    database.medication.findUnique({ where: { code } }),

  create: (data: CreateMedicationInput) => database.medication.create({ data }),

  update: (id: string, data: UpdateMedicationInput) => {
    const updateData: Prisma.MedicationUpdateInput = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        Object.assign(updateData, { [key]: value });
      }
    }

    return database.medication.update({ where: { id }, data: updateData });
  },

  async findMany(input: ListMedicationsInput) {
    const where: Prisma.MedicationWhereInput = {
      ...(input.includeInactive ? {} : { isActive: true }),
      ...(input.search
        ? {
            OR: [
              { code: { contains: input.search, mode: 'insensitive' } },
              { name: { contains: input.search, mode: 'insensitive' } },
              {
                activeIngredient: {
                  contains: input.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await database.$transaction([
      database.medication.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: input.limit,
      }),
      database.medication.count({ where }),
    ]);

    return { items, total };
  },
};
