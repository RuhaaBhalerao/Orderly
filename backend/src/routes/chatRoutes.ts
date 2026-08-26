import { Router } from 'express';
import { body } from 'express-validator';
import {
  getChatHistoryController,
  generateChatResponseController,
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });

// Apply auth middleware to all chat routes
router.use(authMiddleware);

/**
 * GET /api/contracts/:contractId/chat
 * Get chat history for a contract
 */
router.get('/', getChatHistoryController);

/**
 * POST /api/contracts/:contractId/chat
 * Generate AI response to user question (Phase 5)
 * Request body: { userMessage: "What are the payment terms?" }
 */
router.post(
  '/',
  [
    body('userMessage')
      .trim()
      .notEmpty()
      .withMessage('User message is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters'),
  ],
  generateChatResponseController
);

export default router;
