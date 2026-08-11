import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware to verify JWT token and attach user info to request
 * Required for all protected endpoints
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed',
    });
  }
}
