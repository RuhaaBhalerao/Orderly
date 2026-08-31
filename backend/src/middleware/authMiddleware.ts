import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        message: 'Invalid or expired token',
      });
      return;
    }

    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    req.userDepartment = payload.department;
    req.employeeId = payload.employeeId;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed',
    });
  }
}
