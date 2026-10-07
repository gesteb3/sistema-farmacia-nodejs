import type { RequestHandler } from 'express';

import {
  createSupplierSchema,
  listSuppliersSchema,
  supplierIdSchema,
  updateSupplierSchema,
} from './supplier.schemas.js';
import { supplierService } from './supplier.service.js';

export const createSupplier: RequestHandler = async (request, response) => {
  const input = createSupplierSchema.parse(request.body);
  const supplier = await supplierService.create(input);

  response.status(201).json({ data: supplier });
};

export const listSuppliers: RequestHandler = async (request, response) => {
  const input = listSuppliersSchema.parse(request.query);
  const result = await supplierService.list(input);

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

export const getSupplier: RequestHandler = async (request, response) => {
  const id = supplierIdSchema.parse(request.params.id);
  const supplier = await supplierService.findById(id);

  response.status(200).json({ data: supplier });
};

export const updateSupplier: RequestHandler = async (request, response) => {
  const id = supplierIdSchema.parse(request.params.id);
  const input = updateSupplierSchema.parse(request.body);
  const supplier = await supplierService.update(id, input);

  response.status(200).json({ data: supplier });
};

export const deleteSupplier: RequestHandler = async (request, response) => {
  const id = supplierIdSchema.parse(request.params.id);
  await supplierService.deactivate(id);

  response.status(204).send();
};
