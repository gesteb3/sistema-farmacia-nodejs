import { AppError } from '../../shared/errors/app-error.js';
import { medicationRepository } from './medication.repository.js';
import type {
  CreateMedicationInput,
  ListMedicationsInput,
  UpdateMedicationInput,
} from './medication.schemas.js';

const ensureUniqueCode = async (code: string, currentId?: string) => {
  const medication = await medicationRepository.findByCode(code);

  if (medication && medication.id !== currentId) {
    throw new AppError(409, `Ya existe un medicamento con el código ${code}.`);
  }
};

const findMedication = async (id: string) => {
  const medication = await medicationRepository.findById(id);

  if (!medication) {
    throw new AppError(404, 'El medicamento solicitado no existe.');
  }

  return medication;
};

export const medicationService = {
  async create(data: CreateMedicationInput) {
    await ensureUniqueCode(data.code);
    return medicationRepository.create(data);
  },

  list: (input: ListMedicationsInput) => medicationRepository.findMany(input),

  findById: (id: string) => findMedication(id),

  async update(id: string, data: UpdateMedicationInput) {
    const current = await findMedication(id);

    if (data.code) {
      await ensureUniqueCode(data.code, id);
    }

    const purchasePrice =
      data.purchasePrice ?? current.purchasePrice.toNumber();
    const salePrice = data.salePrice ?? current.salePrice.toNumber();

    if (salePrice < purchasePrice) {
      throw new AppError(
        400,
        'El precio de venta no puede ser menor al precio de compra.',
      );
    }

    return medicationRepository.update(id, data);
  },

  async deactivate(id: string) {
    await findMedication(id);
    await medicationRepository.update(id, { isActive: false });
  },
};
