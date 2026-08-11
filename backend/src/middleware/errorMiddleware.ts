import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Centralized error handling middleware
 */
export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().reduce((acc, err) => {
        acc[err.param] = err.msg;
        return acc;
      }, {} as Record<string, string>),
    });
    return;
  }

  // Handle custom error types
  if (err.status) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    res.status(400).json({
      message: 'Email already exists',
    });
    return;
  }

  if (err.code === 'P2025') {
    // Record not found
    res.status(404).json({
      message: 'Record not found',
    });
    return;
  }

  // Handle generic errors
  res.status(500).json({
    message: 'Internal server error',
  });
}

/**
 * Wrapper for async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
