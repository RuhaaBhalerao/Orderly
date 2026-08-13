import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types/auth';
import * as contractService from '../services/contractService';

/**
 * GET /api/contracts
 * Get all contracts for the authenticated user
 */
export async function getContractsController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const contracts = await contractService.getContractsByUserId(req.userId);
    res.status(200).json(contracts);
  } catch (error: any) {
    console.error('Error getting contracts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/contracts/:id
 * Get a single contract
 */
export async function getContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const contract = await contractService.getContractById(id, req.userId);
    res.status(200).json(contract);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error getting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * POST /api/contracts
 * Create a new contract
 */
export async function createContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err: any) => {
          acc[err.param || 'unknown'] = err.msg;
          return acc;
        }, {} as Record<string, string>),
      });
      return;
    }

    const contract = await contractService.createContract(req.userId, req.body);
    res.status(201).json(contract);
  } catch (error: any) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/contracts/:id
 * Update a contract
 */
export async function updateContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err: any) => {
          acc[err.param || 'unknown'] = err.msg;
          return acc;
        }, {} as Record<string, string>),
      });
      return;
    }

    const { id } = req.params;
    const contract = await contractService.updateContract(id, req.userId, req.body);
    res.status(200).json(contract);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error updating contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * DELETE /api/contracts/:id
 * Delete a contract
 */
export async function deleteContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await contractService.deleteContract(id, req.userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error deleting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
