import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerController,
  loginController,
  meController,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Rate limited: 5 attempts per 15 minutes
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  registerController
);

/**
 * POST /api/auth/login
 * Login user
 * Rate limited: 5 attempts per 15 minutes
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
 * Get current authenticated user
 */
router.get('/me', authMiddleware, meController);

export default router;
