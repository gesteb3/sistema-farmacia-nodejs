import { Router } from 'express';

import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from './medication.controller.js';

export const medicationRouter = Router();

medicationRouter.route('/').post(createMedication).get(listMedications);
medicationRouter
  .route('/:id')
  .get(getMedication)
  .patch(updateMedication)
  .delete(deleteMedication);
