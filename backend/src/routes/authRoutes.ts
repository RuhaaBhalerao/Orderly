import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerController,
  loginController,
  meController,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['REQUESTER', 'MANAGER', 'PROCUREMENT_OFFICER'])
      .withMessage('Role must be one of REQUESTER, MANAGER, or PROCUREMENT_OFFICER'),
  ],
  registerController
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginController
);

/**
 * GET /api/auth/me
 */
router.get('/me', authMiddleware, meController);

export default router;
