import { Router } from 'express';

import {
  createBatch,
  listBatches,
  listMovements,
  registerEntry,
  registerExit,
} from './inventory.controller.js';

export const inventoryRouter = Router();

inventoryRouter.route('/batches').post(createBatch).get(listBatches);
inventoryRouter.post('/batches/:id/entries', registerEntry);
inventoryRouter.post('/batches/:id/exits', registerExit);
inventoryRouter.get('/batches/:id/movements', listMovements);
