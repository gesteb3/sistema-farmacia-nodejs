import type { RequestHandler } from 'express';

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    status: 'error',
    message: `La ruta ${request.method} ${request.path} no existe.`,
  });
};
