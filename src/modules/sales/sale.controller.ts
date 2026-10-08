import type { RequestHandler } from 'express';
import {
  createSaleSchema,
  listSalesSchema,
  saleIdSchema,
} from './sale.schemas.js';
import { saleService } from './sale.service.js';

const serialize = <
  T extends {
    total: unknown;
    items: Array<{ unitPrice: unknown; subtotal: unknown }>;
  },
>(
  sale: T,
) => ({
  ...sale,
  total: String(sale.total),
  items: sale.items.map((item) => ({
    ...item,
    unitPrice: String(item.unitPrice),
    subtotal: String(item.subtotal),
  })),
});

export const createSale: RequestHandler = async (request, response) => {
  const sale = await saleService.create(createSaleSchema.parse(request.body));
  response.status(201).json({ data: serialize(sale) });
};
export const listSales: RequestHandler = async (request, response) => {
  const input = listSalesSchema.parse(request.query);
  const result = await saleService.list(input);
  response.status(200).json({
    data: result.items.map(serialize),
    pagination: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / input.limit),
    },
  });
};
export const getSale: RequestHandler = async (request, response) => {
  response.status(200).json({
    data: serialize(
      await saleService.findById(saleIdSchema.parse(request.params.id)),
    ),
  });
};
