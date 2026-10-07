import type { RequestHandler } from 'express';
import {
  createPurchaseSchema,
  listPurchasesSchema,
  purchaseIdSchema,
} from './purchase.schemas.js';
import { purchaseService } from './purchase.service.js';

const serializePurchase = <
  T extends {
    total: unknown;
    items: Array<{ unitCost: unknown; subtotal: unknown }>;
  },
>(
  purchase: T,
) => ({
  ...purchase,
  total: String(purchase.total),
  items: purchase.items.map((item) => ({
    ...item,
    unitCost: String(item.unitCost),
    subtotal: String(item.subtotal),
  })),
});

export const createPurchase: RequestHandler = async (request, response) => {
  const purchase = await purchaseService.create(
    createPurchaseSchema.parse(request.body),
  );
  response.status(201).json({ data: serializePurchase(purchase) });
};

export const listPurchases: RequestHandler = async (request, response) => {
  const input = listPurchasesSchema.parse(request.query);
  const result = await purchaseService.list(input);
  response.status(200).json({
    data: result.items.map(serializePurchase),
    pagination: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / input.limit),
    },
  });
};

export const getPurchase: RequestHandler = async (request, response) => {
  const purchase = await purchaseService.findById(
    purchaseIdSchema.parse(request.params.id),
  );
  response.status(200).json({ data: serializePurchase(purchase) });
};
