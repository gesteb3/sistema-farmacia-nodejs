import { Router } from 'express';
import { authorize } from '../auth/auth.middleware.js';

import {
  createBatch,
  listBatches,
  listMovements,
  registerEntry,
  registerExit,
} from './inventory.controller.js';

export const inventoryRouter = Router();

inventoryRouter
  .route('/batches')
  .post(authorize('ADMIN'), createBatch)
  .get(listBatches);
inventoryRouter.post('/batches/:id/entries', authorize('ADMIN'), registerEntry);
inventoryRouter.post(
  '/batches/:id/exits',
  authorize('ADMIN', 'CASHIER'),
  registerExit,
);
inventoryRouter.get('/batches/:id/movements', listMovements);
