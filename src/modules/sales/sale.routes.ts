import { Router } from 'express';
import { createSale, getSale, listSales } from './sale.controller.js';

export const saleRouter = Router();
saleRouter.route('/').post(createSale).get(listSales);
saleRouter.get('/:id', getSale);
