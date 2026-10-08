import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './config/openapi.js';
import { authRouter, userRouter } from './modules/auth/auth.routes.js';
import { authenticate, authorize } from './modules/auth/auth.middleware.js';
import { customerRouter } from './modules/customers/customer.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { medicationRouter } from './modules/medications/medication.routes.js';
import { purchaseRouter } from './modules/purchases/purchase.routes.js';
import { saleRouter } from './modules/sales/sale.routes.js';
import { reportRouter } from './modules/reports/report.routes.js';
import { supplierRouter } from './modules/suppliers/supplier.routes.js';
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
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/medications', authenticate, medicationRouter);
  app.use('/api/v1/inventory', authenticate, inventoryRouter);
  app.use(
    '/api/v1/suppliers',
    authenticate,
    authorize('ADMIN'),
    supplierRouter,
  );
  app.use(
    '/api/v1/purchases',
    authenticate,
    authorize('ADMIN'),
    purchaseRouter,
  );
  app.use('/api/v1/customers', authenticate, customerRouter);
  app.use('/api/v1/sales', authenticate, saleRouter);
  app.use('/api/v1/reports', reportRouter);

  // Los manejadores de cierre deben registrarse después de todas las rutas.
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
