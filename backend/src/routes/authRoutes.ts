import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerController,
  loginController,
  meController,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
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
 */
router.post(
  '/login',
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
