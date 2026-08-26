import { prisma } from '../lib/prisma';
import * as aiService from './aiService';

/**
 * Get chat history for a contract
 * Verifies user ownership of the contract
 */
export async function getChatHistory(contractId: string, userId: string) {
  // Verify contract exists and belongs to user
  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      userId,
    },
  });

  if (!contract) {
    throw {
      status: 404,
      message: 'Contract not found or does not belong to user',
    };
  }

  // Get chat history
  const chatHistory = await prisma.chatHistory.findMany({
    where: { contractId },
    orderBy: { timestamp: 'asc' },
  });

  return chatHistory;
}

/**
 * Save a chat message (INTERNAL)
 * Used after AI generates a response
 */
async function saveChatMessage(
  contractId: string,
  userMessage: string,
  aiResponse: string
) {
  // Create chat message
  const chatMessage = await prisma.chatHistory.create({
    data: {
      contractId,
      userMessage,
      aiResponse,
    },
  });

  return chatMessage;
}

/**
 * Generate AI response to a user question about a contract
 * This is the NEW Phase 5 functionality
 */
export async function generateChatResponse(
  contractId: string,
  userId: string,
  userMessage: string
): Promise<{
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!userMessage || userMessage.trim().length === 0) {
      return {
        userMessage,
        aiResponse: '',
        timestamp: new Date(),
        success: false,
        error: 'Question cannot be empty',
      };
    }

    // Get contract and verify ownership
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId,
      },
    });

    if (!contract) {
      return {
        userMessage,
        aiResponse: '',
        timestamp: new Date(),
        success: false,
        error: 'Contract not found or does not belong to user',
      };
    }

    // Check if contract has extracted text
    if (!contract.extractedText) {
      return {
        userMessage,
        aiResponse: '',
        timestamp: new Date(),
        success: false,
        error: 'Contract does not have extracted text. Please upload a PDF first.',
      };
    }

    console.log(`[Chat] Generating response for contract ${contractId}, user question: "${userMessage.substring(0, 50)}..."`);

    // Get AI response using aiService
    // Include the AI summary if available for better context
    const aiResult = await aiService.generateChatResponse(
      userMessage,
      contract.extractedText,
      contract.aiSummary || undefined
    );

    if (!aiResult.success) {
      console.error(`[Chat] AI service error: ${aiResult.error}`);
      return {
        userMessage,
        aiResponse: '',
        timestamp: new Date(),
        success: false,
        error: aiResult.error,
      };
    }

    // Save the message and response to database
    const savedMessage = await saveChatMessage(contractId, userMessage, aiResult.response || '');

    console.log(`[Chat] Chat message saved for contract ${contractId}`);

    return {
      userMessage: savedMessage.userMessage,
      aiResponse: savedMessage.aiResponse,
      timestamp: savedMessage.timestamp,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chat] Unexpected error:', errorMessage);
    return {
      userMessage,
      aiResponse: '',
      timestamp: new Date(),
      success: false,
      error: `Unexpected error: ${errorMessage}`,
    };
  }
}
