import { Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as poService from '../services/purchaseOrderService.js';

export async function createPurchaseOrderController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const po = await poService.createPurchaseOrder(req.body, req.userId);
    res.status(201).json(po);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getPurchaseOrdersController(req: AuthRequest, res: Response) {
  try {
    const { search, status, supplierId } = req.query;
    const pos = await poService.getPurchaseOrders({
      search: search as string,
      status: status as string,
      supplierId: supplierId as string,
    });
    res.status(200).json(pos);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getPurchaseOrderByIdController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const po = await poService.getPurchaseOrderById(id);
    res.status(200).json(po);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function updatePOStatusController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const po = await poService.updatePOStatus(id, status, req.userId);
    res.status(200).json(po);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}
