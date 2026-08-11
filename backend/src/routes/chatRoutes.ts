import { Router } from 'express';
import { body } from 'express-validator';
import {
  getChatHistoryController,
  saveChatMessageController,
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
 * Save a chat message
 */
router.post(
  '/',
  [
    body('userMessage')
      .trim()
      .notEmpty()
      .withMessage('User message is required'),
    body('aiResponse')
      .trim()
      .notEmpty()
      .withMessage('AI response is required'),
  ],
  saveChatMessageController
);

export default router;
