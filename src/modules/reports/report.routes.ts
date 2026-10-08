import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { getDashboard } from './report.controller.js';

export const reportRouter = Router();
reportRouter.get('/dashboard', authenticate, authorize('ADMIN'), getDashboard);
