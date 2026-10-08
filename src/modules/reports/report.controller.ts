import type { RequestHandler } from 'express';
import { reportService } from './report.service.js';

export const getDashboard: RequestHandler = async (_request, response) => {
  response.status(200).json({ data: await reportService.dashboard() });
};
