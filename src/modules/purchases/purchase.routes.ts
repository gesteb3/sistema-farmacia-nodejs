import { Router } from 'express';
import {
  createPurchase,
  getPurchase,
  listPurchases,
} from './purchase.controller.js';

export const purchaseRouter = Router();
purchaseRouter.route('/').post(createPurchase).get(listPurchases);
purchaseRouter.get('/:id', getPurchase);
