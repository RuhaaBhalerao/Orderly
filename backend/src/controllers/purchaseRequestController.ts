import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as prService from '../services/purchaseRequestService';

export async function createPurchaseRequestController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || !req.userDepartment) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const pr = await prService.createPurchaseRequest(req.body, req.userId, req.userDepartment);
    res.status(201).json(pr);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getPurchaseRequestsController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || !req.userRole || !req.userDepartment) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { search, status, priority, department } = req.query;

    const requests = await prService.getPurchaseRequests(
      req.userId,
      req.userRole,
      req.userDepartment,
      {
        search: search as string,
        status: status as string,
        priority: priority as string,
        department: department as string,
      }
    );

    res.status(200).json(requests);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getPurchaseRequestByIdController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const pr = await prService.getPurchaseRequestById(id);
    res.status(200).json(pr);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function approvePurchaseRequestController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { comment } = req.body;

    const pr = await prService.approvePurchaseRequest(id, req.userId, comment);
    res.status(200).json(pr);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function rejectPurchaseRequestController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { comment } = req.body;

    const pr = await prService.rejectPurchaseRequest(id, req.userId, comment);
    res.status(200).json(pr);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function compareSuppliersController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const comparison = await prService.compareSuppliersForRequest(id);
    res.status(200).json(comparison);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function selectSupplierController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { supplierId, reason } = req.body;

    if (!supplierId) {
      res.status(400).json({ message: 'supplierId is required' });
      return;
    }

    const pr = await prService.selectSupplierForRequest(id, supplierId, reason || 'Best match based on price and rating', req.userId);
    res.status(200).json(pr);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}
