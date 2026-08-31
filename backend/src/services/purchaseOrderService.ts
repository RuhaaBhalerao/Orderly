import { prisma } from '../lib/prisma.js';

export interface CreatePurchaseOrderItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderPayload {
  purchaseRequestId: string;
  supplierId: string;
  expectedDeliveryDate: string;
  paymentTerms?: string;
  shippingInformation?: string;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

async function generatePONumber(): Promise<string> {
  const count = await prisma.purchaseOrder.count();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(3, '0');
  return `PO-${year}-${sequence}`;
}

export async function createPurchaseOrder(payload: CreatePurchaseOrderPayload, createdBy: string) {
  const pr = await prisma.purchaseRequest.findUnique({ where: { id: payload.purchaseRequestId } });
  if (!pr) throw { status: 404, message: 'Purchase request not found' };

  const supplier = await prisma.supplier.findUnique({ where: { id: payload.supplierId } });
  if (!supplier) throw { status: 404, message: 'Supplier not found' };

  if (!payload.items || payload.items.length === 0) {
    throw { status: 400, message: 'At least one line item is required for purchase order.' };
  }

  // Calculate total strictly on backend
  const calculatedItems = payload.items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    return {
      description: item.description,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price,
    };
  });

  const totalAmount = calculatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const poNumber = await generatePONumber();

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      purchaseRequestId: pr.id,
      supplierId: supplier.id,
      createdBy,
      totalAmount,
      expectedDeliveryDate: new Date(payload.expectedDeliveryDate),
      paymentTerms: payload.paymentTerms || supplier.paymentTerms || 'Net 30',
      shippingInformation: payload.shippingInformation,
      notes: payload.notes,
      status: 'ISSUED',
      items: {
        create: calculatedItems,
      },
    },
    include: {
      supplier: true,
      purchaseRequest: true,
      items: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  // Update PR status to ORDERED
  await prisma.purchaseRequest.update({
    where: { id: pr.id },
    data: { status: 'ORDERED', selectedSupplierId: supplier.id },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: createdBy,
      action: 'PURCHASE_ORDER_CREATED',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      metadata: { poNumber: po.poNumber, totalAmount, supplierName: supplier.name },
    },
  });

  // Notify Requester
  await prisma.notification.create({
    data: {
      userId: pr.requesterId,
      title: 'Purchase Order Issued',
      message: `Purchase Order ${po.poNumber} has been issued to ${supplier.name} for your request ${pr.requestNumber}.`,
      type: 'SUCCESS',
      link: `/purchase-orders`,
    },
  });

  return po;
}

export async function getPurchaseOrders(query: { search?: string; status?: string; supplierId?: string }) {
  const where: any = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.search) {
    where.OR = [
      { poNumber: { contains: query.search, mode: 'insensitive' } },
      { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
      { purchaseRequest: { requestNumber: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  return prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true, contactPerson: true, phone: true } },
      purchaseRequest: { select: { id: true, requestNumber: true, title: true, requester: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPurchaseOrderById(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      purchaseRequest: {
        include: { requester: { select: { id: true, name: true, email: true, department: true } } },
      },
      creator: { select: { id: true, name: true, email: true } },
      items: true,
      contracts: true,
    },
  });

  if (!po) {
    throw { status: 404, message: 'Purchase order not found' };
  }

  return po;
}

export async function updatePOStatus(id: string, status: string, userId: string) {
  const validStatuses = ['DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw { status: 400, message: `Invalid status: ${status}` };
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { purchaseRequest: true, supplier: true },
  });

  if (!po) throw { status: 404, message: 'Purchase order not found' };

  const updatedPo = await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
    include: { supplier: true, purchaseRequest: true, items: true },
  });

  // If status marked as DELIVERED, update PurchaseRequest status to COMPLETED / DELIVERED
  if (status === 'DELIVERED') {
    await prisma.purchaseRequest.update({
      where: { id: po.purchaseRequestId },
      data: { status: 'DELIVERED' },
    });

    await prisma.notification.create({
      data: {
        userId: po.purchaseRequest.requesterId,
        title: 'Order Delivered!',
        message: `Items for purchase request ${po.purchaseRequest.requestNumber} have been delivered by ${po.supplier.name}.`,
        type: 'SUCCESS',
        link: `/purchase-orders`,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PURCHASE_ORDER_STATUS_UPDATED',
      entityType: 'PurchaseOrder',
      entityId: id,
      metadata: { poNumber: po.poNumber, oldStatus: po.status, newStatus: status },
    },
  });

  return updatedPo;
}
