import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types/auth';
import * as chatService from '../services/chatService';

/**
 * GET /api/contracts/:contractId/chat
 * Get chat history for a contract
 */
export async function getChatHistoryController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { contractId } = req.params;
    const chatHistory = await chatService.getChatHistory(contractId, req.userId);
    res.status(200).json(chatHistory);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error getting chat history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * POST /api/contracts/:contractId/chat
 * Save a chat message
 */
export async function saveChatMessageController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err: any) => {
          acc[err.param || 'unknown'] = err.msg;
          return acc;
        }, {} as Record<string, string>),
      });
      return;
    }

    const { contractId } = req.params;
    const { userMessage, aiResponse } = req.body;

    const chatMessage = await chatService.saveChatMessage(
      contractId,
      req.userId,
      userMessage,
      aiResponse
    );

    res.status(201).json(chatMessage);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error saving chat message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
