import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as analyticsService from '../services/analyticsService';

export async function getAnalyticsController(req: AuthRequest, res: Response) {
  try {
    const data = await analyticsService.getAnalyticsMetrics();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}
