import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as dashboardService from '../services/dashboardService';

export async function getDashboardController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || !req.userRole || !req.userDepartment) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = await dashboardService.getDashboardMetrics(req.userId, req.userRole, req.userDepartment);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}
