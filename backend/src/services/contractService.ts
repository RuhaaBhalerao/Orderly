import { prisma } from '../lib/prisma.js';

export interface CreateContractPayload {
  contractName: string;
  supplierId?: string;
  purchaseOrderId?: string;
  contractValue: number;
  startDate: string;
  expiryDate: string;
  renewalDate?: string;
  notes?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

function calculateContractStatus(expiryDateStr: string): string {
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);

  if (daysUntilExpiry < 0) {
    return 'EXPIRED';
  } else if (daysUntilExpiry <= 30) {
    return 'EXPIRING_SOON';
  }
  return 'ACTIVE';
}

export async function getContracts(userId: string, userRole: string) {
  const where: any = {};
  if (userRole === 'REQUESTER') {
    where.userId = userId;
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true, contactPerson: true } },
      purchaseOrder: { select: { id: true, poNumber: true, totalAmount: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Re-calculate dynamic status based on current date
  return contracts.map((c) => {
    const dynamicStatus = calculateContractStatus(c.expiryDate.toISOString());
    return { ...c, status: dynamicStatus };
  });
}

export async function getContractById(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      supplier: true,
      purchaseOrder: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!contract) {
    throw { status: 404, message: 'Contract not found' };
  }

  const dynamicStatus = calculateContractStatus(contract.expiryDate.toISOString());
  return { ...contract, status: dynamicStatus };
}

export async function createContract(userId: string, payload: CreateContractPayload) {
  const status = calculateContractStatus(payload.expiryDate);

  const contract = await prisma.contract.create({
    data: {
      userId,
      contractName: payload.contractName,
      supplierId: payload.supplierId || null,
      purchaseOrderId: payload.purchaseOrderId || null,
      contractValue: Number(payload.contractValue) || 0,
      startDate: new Date(payload.startDate),
      expiryDate: new Date(payload.expiryDate),
      renewalDate: payload.renewalDate ? new Date(payload.renewalDate) : null,
      status,
      fileName: payload.fileName,
      fileUrl: payload.fileUrl,
      fileType: payload.fileType,
      fileSize: payload.fileSize ? Number(payload.fileSize) : null,
      notes: payload.notes,
    },
    include: {
      supplier: true,
      purchaseOrder: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CONTRACT_CREATED',
      entityType: 'Contract',
      entityId: contract.id,
      metadata: { contractName: contract.contractName, contractValue: contract.contractValue },
    },
  });

  return contract;
}

export async function deleteContract(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) {
    throw { status: 404, message: 'Contract not found' };
  }

  await prisma.contract.delete({ where: { id: contractId } });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CONTRACT_DELETED',
      entityType: 'Contract',
      entityId: contractId,
      metadata: { contractName: contract.contractName },
    },
  });

  if (contract.fileName) {
    try {
      const { deleteUploadedFile } = await import('../middleware/uploadMiddleware.js');
      await deleteUploadedFile(contract.fileName);
    } catch (err) {
      console.error('Error removing file:', err);
    }
  }

  return { message: 'Contract deleted successfully' };
}
