import { Router } from 'express';

import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  listSuppliers,
  updateSupplier,
} from './supplier.controller.js';

export const supplierRouter = Router();

supplierRouter.route('/').post(createSupplier).get(listSuppliers);
supplierRouter
  .route('/:id')
  .get(getSupplier)
  .patch(updateSupplier)
  .delete(deleteSupplier);
