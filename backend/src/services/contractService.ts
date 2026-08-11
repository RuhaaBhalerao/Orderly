import { prisma } from '../lib/prisma';

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
}
