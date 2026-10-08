import type { RequestHandler } from 'express';
import { jwtVerify } from 'jose';

import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const authenticate: RequestHandler = async (
  request,
  _response,
  next,
) => {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token)
    throw new AppError(401, 'Debe iniciar sesión.');

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (
      !payload.sub ||
      (payload.role !== 'ADMIN' && payload.role !== 'CASHIER')
    ) {
      throw new Error('Contenido inválido');
    }
    request.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'La sesión es inválida o expiró.');
  }
};

export const authorize =
  (...roles: Array<'ADMIN' | 'CASHIER'>): RequestHandler =>
  (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new AppError(403, 'No tiene permiso para realizar esta operación.');
    }
    next();
  };
