import { Router } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';
import { gmailLimiter } from '@/middleware/rateLimitMiddleware';
import {
  getAuthUrlController,
  handleOAuthCallbackController,
  getStatusController,
  syncInboxController,
  disconnectController,
} from '@/controllers/gmailController';

const router = Router();

/**
 * GET /api/gmail/auth
 * Generate OAuth authorization URL
 * Protected: Yes (requires JWT)
 */
router.get('/auth', authMiddleware, gmailLimiter, getAuthUrlController);

/**
 * GET /api/gmail/callback
 * Handle OAuth callback from Google
 * Protected: No (called by Google redirect)
 */
router.get('/callback', handleOAuthCallbackController);

/**
 * GET /api/gmail/status
 * Get Gmail connection status
 * Protected: Yes (requires JWT)
 */
router.get('/status', authMiddleware, gmailLimiter, getStatusController);

/**
 * POST /api/gmail/sync
 * Trigger inbox sync
 * Protected: Yes (requires JWT)
 * Rate limited: 10 attempts per hour
 */
router.post('/sync', authMiddleware, gmailLimiter, syncInboxController);

/**
 * POST /api/gmail/disconnect
 * Disconnect Gmail account
 * Protected: Yes (requires JWT)
 */
router.post('/disconnect', authMiddleware, gmailLimiter, disconnectController);

export default router;
