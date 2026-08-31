import { prisma } from '../lib/prisma.js';

export interface CreateSupplierPayload {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating?: number;
  deliveryPerformance?: number;
  paymentTerms?: string;
  notes?: string;
}

export async function getSuppliers(query: { search?: string; category?: string; status?: string }) {
  const where: any = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { contactPerson: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return prisma.supplier.findMany({
    where,
    orderBy: { rating: 'desc' },
  });
}

export async function getSupplierById(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      contracts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!supplier) {
    throw { status: 404, message: 'Supplier not found' };
  }

  return supplier;
}

export async function createSupplier(payload: CreateSupplierPayload, userId: string) {
  const supplier = await prisma.supplier.create({
    data: {
      name: payload.name,
      contactPerson: payload.contactPerson,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      category: payload.category,
      rating: payload.rating || 4.0,
      deliveryPerformance: payload.deliveryPerformance || 90,
      paymentTerms: payload.paymentTerms || 'Net 30',
      status: 'ACTIVE',
      notes: payload.notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'SUPPLIER_CREATED',
      entityType: 'Supplier',
      entityId: supplier.id,
      metadata: { name: supplier.name, category: supplier.category },
    },
  });

  return supplier;
}

export async function updateSupplier(id: string, payload: Partial<CreateSupplierPayload> & { status?: string }, userId: string) {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: payload,
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'SUPPLIER_UPDATED',
      entityType: 'Supplier',
      entityId: supplier.id,
      metadata: { updates: payload },
    },
  });

  return supplier;
}
