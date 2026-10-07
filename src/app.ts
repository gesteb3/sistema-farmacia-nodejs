import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { healthRouter } from './modules/health/health.routes.js';
import { medicationRouter } from './modules/medications/medication.routes.js';
import { errorHandler } from './shared/http/error-handler.js';
import { notFound } from './shared/http/not-found.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/medications', medicationRouter);

  // Los manejadores de cierre deben registrarse después de todas las rutas.
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
