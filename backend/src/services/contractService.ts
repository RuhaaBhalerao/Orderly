import { prisma } from '../lib/prisma';
import { AiAnalysisResponse } from '../types/aiAnalysis';

export interface CreateContractPayload {
  title: string;
  vendor: string;
  status: string;
  riskLevel: string;
  summary?: string;
  contractType: string;
  effectiveDate: string;
  expiryDate: string;
  pdfPath?: string;
}

export interface UpdateContractPayload extends CreateContractPayload {}

/**
 * Get all contracts for a user
 */
export async function getContractsByUserId(userId: string) {
  const contracts = await prisma.contract.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return contracts;
}

/**
 * Get a single contract by ID (with user ownership verification)
 */
export async function getContractById(contractId: string, userId: string) {
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

  return contract;
}

/**
 * Create a new contract
 */
export async function createContract(
  userId: string,
  payload: CreateContractPayload
) {
  const contract = await prisma.contract.create({
    data: {
      userId,
      title: payload.title,
      vendor: payload.vendor,
      status: payload.status,
      riskLevel: payload.riskLevel,
      summary: payload.summary || null,
      contractType: payload.contractType,
      effectiveDate: new Date(payload.effectiveDate),
      expiryDate: new Date(payload.expiryDate),
      pdfPath: payload.pdfPath || null,
    },
  });

  return contract;
}

/**
 * Update a contract (with user ownership verification)
 */
export async function updateContract(
  contractId: string,
  userId: string,
  payload: UpdateContractPayload
) {
  // Verify ownership
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

  // Update contract
  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      title: payload.title,
      vendor: payload.vendor,
      status: payload.status,
      riskLevel: payload.riskLevel,
      summary: payload.summary || null,
      contractType: payload.contractType,
      effectiveDate: new Date(payload.effectiveDate),
      expiryDate: new Date(payload.expiryDate),
      pdfPath: payload.pdfPath || null,
    },
  });

  return updated;
}

/**
 * Save contract analysis results
 * Updates contract with AI-extracted data
 */
export async function saveContractAnalysis(
  contractId: string,
  analysis: AiAnalysisResponse
) {
  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      aiSummary: analysis.summary,
      aiContractType: analysis.contractType,
      aiVendor: analysis.vendor,
      aiEffectiveDate: analysis.effectiveDate ? new Date(analysis.effectiveDate) : null,
      aiExpiryDate: analysis.expiryDate ? new Date(analysis.expiryDate) : null,
      aiRiskLevel: analysis.riskLevel,
      aiKeyTerms: analysis.keyTerms,
      aiRisks: analysis.risks,
      aiRecommendations: analysis.recommendations,
      analysisStatus: 'COMPLETED',
      analysisError: null,
    },
  });

  return updated;
}

/**
 * Update contract analysis status
 */
export async function updateContractAnalysisStatus(
  contractId: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED',
  error: string | null = null
) {
  return await prisma.contract.update({
    where: { id: contractId },
    data: {
      analysisStatus: status,
      analysisError: error,
    },
  });
}

/**
 * Delete a contract (with user ownership verification)
 */
export async function deleteContract(contractId: string, userId: string) {
  // Verify ownership
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

  // Delete contract (chat history will cascade delete)
  await prisma.contract.delete({
    where: { id: contractId },
  });

  // Delete associated PDF file if it exists
  if (contract.pdfPath) {
    try {
      // Extract filename from pdfPath (e.g., /uploads/contracts/uuid.pdf -> uuid.pdf)
      const filename = contract.pdfPath.split('/').pop();
      if (filename) {
        const { deleteUploadedFile } = await import('../middleware/uploadMiddleware');
        await deleteUploadedFile(filename);
      }
    } catch (error) {
      console.error('Error deleting PDF file:', error);
      // Don't throw - contract was already deleted from DB
    }
  }
}
