import { prisma } from '../lib/prisma';

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
 * Save a chat message
 * Verifies user ownership of the contract
 */
export async function saveChatMessage(
  contractId: string,
  userId: string,
  userMessage: string,
  aiResponse: string
) {
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
