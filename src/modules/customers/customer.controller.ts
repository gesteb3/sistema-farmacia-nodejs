import type { RequestHandler } from 'express';
import {
  createCustomerSchema,
  customerIdSchema,
  listCustomersSchema,
  updateCustomerSchema,
} from './customer.schemas.js';
import { customerService } from './customer.service.js';

export const createCustomer: RequestHandler = async (request, response) => {
  const customer = await customerService.create(
    createCustomerSchema.parse(request.body),
  );
  response.status(201).json({ data: customer });
};
export const listCustomers: RequestHandler = async (request, response) => {
  const input = listCustomersSchema.parse(request.query);
  const result = await customerService.list(input);
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
export const getCustomer: RequestHandler = async (request, response) => {
  response.status(200).json({
    data: await customerService.findById(
      customerIdSchema.parse(request.params.id),
    ),
  });
};
export const updateCustomer: RequestHandler = async (request, response) => {
  const id = customerIdSchema.parse(request.params.id);
  const customer = await customerService.update(
    id,
    updateCustomerSchema.parse(request.body),
  );
  response.status(200).json({ data: customer });
};
export const deleteCustomer: RequestHandler = async (request, response) => {
  await customerService.deactivate(customerIdSchema.parse(request.params.id));
  response.status(204).send();
};
