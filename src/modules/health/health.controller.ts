import type { RequestHandler } from 'express';

export const getHealth: RequestHandler = (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'sistema-farmacia-api',
    timestamp: new Date().toISOString(),
  });
};
