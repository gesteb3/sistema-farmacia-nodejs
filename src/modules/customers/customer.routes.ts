import { Router } from 'express';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from './customer.controller.js';

export const customerRouter = Router();
customerRouter.route('/').post(createCustomer).get(listCustomers);
customerRouter
  .route('/:id')
  .get(getCustomer)
  .patch(updateCustomer)
  .delete(deleteCustomer);
