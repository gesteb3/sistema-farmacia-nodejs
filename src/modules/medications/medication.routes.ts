import { Router } from 'express';
import { authorize } from '../auth/auth.middleware.js';

import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from './medication.controller.js';

export const medicationRouter = Router();

medicationRouter
  .route('/')
  .post(authorize('ADMIN'), createMedication)
  .get(listMedications);
medicationRouter
  .route('/:id')
  .get(getMedication)
  .patch(authorize('ADMIN'), updateMedication)
  .delete(authorize('ADMIN'), deleteMedication);
