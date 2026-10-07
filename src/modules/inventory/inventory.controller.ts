import type { RequestHandler } from 'express';

import {
  batchIdSchema,
  createBatchSchema,
  listBatchesSchema,
  stockMovementSchema,
} from './inventory.schemas.js';
import { inventoryService } from './inventory.service.js';

export const createBatch: RequestHandler = async (request, response) => {
  const input = createBatchSchema.parse(request.body);
  const batch = await inventoryService.createBatch(input);

  response.status(201).json({ data: batch });
};

export const listBatches: RequestHandler = async (request, response) => {
  const input = listBatchesSchema.parse(request.query);
  const result = await inventoryService.listBatches(input);

  response.status(200).json({
    data: result.items,
    pagination: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / input.limit),
    },
  });
};

const moveStock =
  (type: 'ENTRY' | 'EXIT'): RequestHandler =>
  async (request, response) => {
    const batchId = batchIdSchema.parse(request.params.id);
    const input = stockMovementSchema.parse(request.body);
    const result = await inventoryService.moveStock(batchId, input, type);

    response.status(201).json({ data: result });
  };

export const registerEntry = moveStock('ENTRY');
export const registerExit = moveStock('EXIT');

export const listMovements: RequestHandler = async (request, response) => {
  const batchId = batchIdSchema.parse(request.params.id);
  const movements = await inventoryService.listMovements(batchId);

  response.status(200).json({ data: movements });
};
