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
 * Generate AI response to user question (PHASE 5)
 * Request body: { userMessage: "What are the payment terms?" }
 * Response: { userMessage, aiResponse, timestamp }
 */
export async function generateChatResponseController(
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
    const { userMessage } = req.body;

    console.log(`[Controller] Chat request for contract ${contractId}: "${userMessage.substring(0, 50)}..."`);

    // Generate AI response
    const result = await chatService.generateChatResponse(contractId, req.userId, userMessage);

    if (!result.success) {
      // Determine appropriate HTTP status
      let statusCode = 500;
      if (result.error?.includes('not found')) {
        statusCode = 404;
      } else if (result.error?.includes('empty')) {
        statusCode = 400;
      } else if (result.error?.includes('rate-limited')) {
        statusCode = 429;
      } else if (result.error?.includes('authentication failed')) {
        statusCode = 500; // Server-side config issue
      }

      res.status(statusCode).json({
        message: 'Failed to generate response',
        error: result.error,
      });
      return;
    }

    // Return the saved message with AI response
    res.status(201).json({
      userMessage: result.userMessage,
      aiResponse: result.aiResponse,
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
