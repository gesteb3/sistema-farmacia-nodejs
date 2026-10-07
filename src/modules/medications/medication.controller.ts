import type { RequestHandler } from 'express';

import {
  createMedicationSchema,
  listMedicationsSchema,
  medicationIdSchema,
  updateMedicationSchema,
} from './medication.schemas.js';
import { medicationService } from './medication.service.js';

const serializeMedication = <
  T extends { purchasePrice: unknown; salePrice: unknown },
>(
  medication: T,
) => ({
  ...medication,
  purchasePrice: String(medication.purchasePrice),
  salePrice: String(medication.salePrice),
});

export const createMedication: RequestHandler = async (request, response) => {
  const input = createMedicationSchema.parse(request.body);
  const medication = await medicationService.create(input);

  response.status(201).json({ data: serializeMedication(medication) });
};

export const listMedications: RequestHandler = async (request, response) => {
  const input = listMedicationsSchema.parse(request.query);
  const result = await medicationService.list(input);

  response.status(200).json({
    data: result.items.map(serializeMedication),
    pagination: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / input.limit),
    },
  });
};

export const getMedication: RequestHandler = async (request, response) => {
  const id = medicationIdSchema.parse(request.params.id);
  const medication = await medicationService.findById(id);

  response.status(200).json({ data: serializeMedication(medication) });
};

export const updateMedication: RequestHandler = async (request, response) => {
  const id = medicationIdSchema.parse(request.params.id);
  const input = updateMedicationSchema.parse(request.body);
  const medication = await medicationService.update(id, input);

  response.status(200).json({ data: serializeMedication(medication) });
};

export const deleteMedication: RequestHandler = async (request, response) => {
  const id = medicationIdSchema.parse(request.params.id);
  await medicationService.deactivate(id);

  response.status(204).send();
};
