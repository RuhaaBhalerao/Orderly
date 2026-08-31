import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.js';

/**
 * Middleware factory to authorize specific roles
 * Example: requireRoles('MANAGER', 'ADMIN')
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ message: 'Unauthorized: No user role context' });
      return;
    }

    if (allowedRoles.includes(req.userRole) || req.userRole === 'ADMIN') {
      next();
      return;
    }

    res.status(403).json({
      message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`,
    });
  };
}
