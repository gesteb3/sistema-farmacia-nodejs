import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { authService } from './auth.service.js';
import { createUserSchema, loginSchema } from './auth.schemas.js';

export const login: RequestHandler = async (request, response) => {
  const input = loginSchema.parse(request.body);
  response
    .status(200)
    .json({ data: await authService.login(input.email, input.password) });
};
export const me: RequestHandler = async (request, response) => {
  const user = await authService.findPublicUser(request.user?.id ?? '');
  if (!user || !user.isActive)
    throw new AppError(401, 'El usuario ya no está disponible.');
  response.status(200).json({ data: user });
};
export const createUser: RequestHandler = async (request, response) => {
  response.status(201).json({
    data: await authService.createUser(createUserSchema.parse(request.body)),
  });
};
export const listUsers: RequestHandler = async (_request, response) => {
  response.status(200).json({ data: await authService.listUsers() });
};
