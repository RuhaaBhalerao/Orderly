import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest, RegisterPayload, LoginPayload } from '../types/auth';
import * as authService from '../services/authService';

/**
 * POST /api/auth/register
 */
export async function registerController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
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

    const payload: RegisterPayload = req.body;
    const result = await authService.registerUser(payload);

    res.status(201).json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * POST /api/auth/login
 */
export async function loginController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
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

    const payload: LoginPayload = req.body;
    const result = await authService.loginUser(payload);

    res.status(200).json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * GET /api/auth/me (Protected)
 */
export async function meController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await authService.getUserById(req.userId);
    res.status(200).json(user);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
