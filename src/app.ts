import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './config/openapi.js';
import { healthRouter } from './modules/health/health.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { medicationRouter } from './modules/medications/medication.routes.js';
import { errorHandler } from './shared/http/error-handler.js';
import { notFound } from './shared/http/not-found.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_request, response) => response.redirect('/api-docs'));
  app.get('/openapi.json', (_request, response) =>
    response.status(200).json(openApiDocument),
  );
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Sistema de Farmacia - API',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/medications', medicationRouter);
  app.use('/api/v1/inventory', inventoryRouter);

  // Los manejadores de cierre deben registrarse después de todas las rutas.
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
