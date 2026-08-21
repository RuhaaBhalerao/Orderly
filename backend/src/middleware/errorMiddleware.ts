import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Central error response handler
 * Ensures all errors return consistent JSON structure
 */
export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  console.error('[Error Handler]', {
    message: err.message,
    status: err.statusCode || 500,
    path: req.path,
    method: req.method,
  });

  // If response already sent, skip
  if (res.headersSent) {
    return next(err);
  }

  // Handle ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Handle custom error objects (existing pattern)
  if (err.status && err.message) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
    return;
  }

  // Handle generic errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

/**
 * Handles Prisma-specific database errors
 */
function handlePrismaError(err: PrismaClientKnownRequestError, res: Response): void {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.[0] || 'field';
      res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `A record with this ${field} already exists` },
      });
      break;

    case 'P2025':
      // Record not found
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      break;

    case 'P2003':
      // Foreign key constraint violation
      res.status(400).json({
        success: false,
        message: 'Invalid reference to related record',
      });
      break;

    case 'P2014':
      // Relation violation
      res.status(400).json({
        success: false,
        message: 'Related records exist, cannot delete',
      });
      break;

    default:
      console.error('[Prisma Error]', err.code, err.message);
      res.status(500).json({
        success: false,
        message: 'Database error occurred',
      });
  }
}

/**
 * Wraps async route handlers to catch errors
 * Use: router.get('/', asyncHandler(controller))
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
}
