import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as supplierService from '../services/supplierService';

export async function getSuppliersController(req: AuthRequest, res: Response) {
  try {
    const { search, category, status } = req.query;
    const suppliers = await supplierService.getSuppliers({
      search: search as string,
      category: category as string,
      status: status as string,
    });
    res.status(200).json(suppliers);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getSupplierByIdController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplierById(id);
    res.status(200).json(supplier);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function createSupplierController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const supplier = await supplierService.createSupplier(req.body, req.userId);
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function updateSupplierController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const supplier = await supplierService.updateSupplier(id, req.body, req.userId);
    res.status(200).json(supplier);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}
