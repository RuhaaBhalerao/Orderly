import { prisma } from '../lib/prisma';

export interface CreatePurchaseRequestPayload {
  title: string;
  description: string;
  category: string;
  quantity: number;
  estimatedBudget: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requiredByDate: string;
}

/**
 * Generate unique Request Number (PR-2026-001 format)
 */
async function generateRequestNumber(): Promise<string> {
  const count = await prisma.purchaseRequest.count();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(3, '0');
  return `PR-${year}-${sequence}`;
}

/**
 * Create Purchase Request
 */
export async function createPurchaseRequest(
  payload: CreatePurchaseRequestPayload,
  requesterId: string,
  department: string
) {
  const requestNumber = await generateRequestNumber();

  const pr = await prisma.purchaseRequest.create({
    data: {
      requestNumber,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quantity: Number(payload.quantity) || 1,
      estimatedBudget: Number(payload.estimatedBudget),
      department,
      priority: payload.priority || 'MEDIUM',
      requiredByDate: new Date(payload.requiredByDate),
      status: 'PENDING',
      requesterId,
    },
    include: {
      requester: {
        select: { id: true, name: true, email: true, department: true },
      },
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: requesterId,
      action: 'PURCHASE_REQUEST_CREATED',
      entityType: 'PurchaseRequest',
      entityId: pr.id,
      metadata: { requestNumber: pr.requestNumber, budget: pr.estimatedBudget },
    },
  });

  // Notify Department Managers
  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER', department },
  });

  for (const mgr of managers) {
    await prisma.notification.create({
      data: {
        userId: mgr.id,
        title: 'New Pending Approval',
        message: `New purchase request ${pr.requestNumber} (${pr.title}) requires your review.`,
        type: 'INFO',
        link: `/approvals`,
      },
    });
  }

  return pr;
}

/**
 * Get Purchase Requests based on role & filters
 */
export async function getPurchaseRequests(
  userId: string,
  userRole: string,
  userDepartment: string,
  query: { search?: string; status?: string; priority?: string; department?: string }
) {
  const where: any = {};

  // Role scoping
  if (userRole === 'REQUESTER') {
    where.requesterId = userId;
  } else if (userRole === 'MANAGER') {
    where.department = userDepartment;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.department && userRole !== 'REQUESTER') {
    where.department = query.department;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { requestNumber: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return prisma.purchaseRequest.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, email: true, department: true } },
      selectedSupplier: { select: { id: true, name: true, rating: true } },
      approvals: {
        include: { approver: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get single Purchase Request with details
 */
export async function getPurchaseRequestById(id: string) {
  const pr = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true, department: true, employeeId: true } },
      selectedSupplier: true,
      approvals: {
        include: { approver: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
      purchaseOrders: {
        include: { supplier: true },
      },
    },
  });

  if (!pr) {
    throw { status: 404, message: 'Purchase request not found' };
  }

  return pr;
}

/**
 * Manager Approve Request
 */
export async function approvePurchaseRequest(
  id: string,
  approverId: string,
  comment?: string
) {
  const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
  if (!pr) throw { status: 404, message: 'Purchase request not found' };

  if (pr.status !== 'PENDING') {
    throw { status: 400, message: `Request cannot be approved in its current status: ${pr.status}` };
  }

  // Record approval
  await prisma.approval.create({
    data: {
      purchaseRequestId: id,
      approverId,
      decision: 'APPROVED',
      comment,
    },
  });

  // Update status to MANAGER_APPROVED / PROCUREMENT
  const updatedPr = await prisma.purchaseRequest.update({
    where: { id },
    data: { status: 'MANAGER_APPROVED' },
    include: { requester: true },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: approverId,
      action: 'PURCHASE_REQUEST_APPROVED',
      entityType: 'PurchaseRequest',
      entityId: id,
      metadata: { requestNumber: pr.requestNumber, comment },
    },
  });

  // Notify Requester
  await prisma.notification.create({
    data: {
      userId: pr.requesterId,
      title: 'Purchase Request Approved',
      message: `Your purchase request ${pr.requestNumber} has been approved by your department manager.`,
      type: 'SUCCESS',
      link: `/requests`,
    },
  });

  // Notify Procurement Officers
  const procurementOfficers = await prisma.user.findMany({
    where: { role: 'PROCUREMENT_OFFICER' },
  });

  for (const po of procurementOfficers) {
    await prisma.notification.create({
      data: {
        userId: po.id,
        title: 'New Approved Request Ready for Supplier Selection',
        message: `Request ${pr.requestNumber} (${pr.title}) was approved and is ready for supplier comparison.`,
        type: 'INFO',
        link: `/suppliers/compare?requestId=${pr.id}`,
      },
    });
  }

  return updatedPr;
}

/**
 * Manager Reject Request
 */
export async function rejectPurchaseRequest(
  id: string,
  approverId: string,
  comment?: string
) {
  const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
  if (!pr) throw { status: 404, message: 'Purchase request not found' };

  if (pr.status !== 'PENDING') {
    throw { status: 400, message: `Request cannot be rejected in its current status: ${pr.status}` };
  }

  await prisma.approval.create({
    data: {
      purchaseRequestId: id,
      approverId,
      decision: 'REJECTED',
      comment,
    },
  });

  const updatedPr = await prisma.purchaseRequest.update({
    where: { id },
    data: { status: 'MANAGER_REJECTED' },
  });

  await prisma.auditLog.create({
    data: {
      userId: approverId,
      action: 'PURCHASE_REQUEST_REJECTED',
      entityType: 'PurchaseRequest',
      entityId: id,
      metadata: { requestNumber: pr.requestNumber, comment },
    },
  });

  await prisma.notification.create({
    data: {
      userId: pr.requesterId,
      title: 'Purchase Request Rejected',
      message: `Your purchase request ${pr.requestNumber} was rejected. Comment: ${comment || 'No comment provided.'}`,
      type: 'ERROR',
      link: `/requests`,
    },
  });

  return updatedPr;
}

/**
 * Compare Suppliers for Purchase Request using Deterministic Weighted Scoring
 */
export async function compareSuppliersForRequest(requestId: string) {
  const pr = await prisma.purchaseRequest.findUnique({ where: { id: requestId } });
  if (!pr) throw { status: 404, message: 'Purchase request not found' };

  // Fetch all active suppliers in category or all active
  let suppliers = await prisma.supplier.findMany({
    where: { status: 'ACTIVE', category: pr.category },
  });

  if (suppliers.length === 0) {
    suppliers = await prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
    });
  }

  if (suppliers.length === 0) {
    throw { status: 400, message: 'No active suppliers found for comparison.' };
  }

  // Calculate Deterministic Score
  // Price: 40%, Delivery: 25%, Rating: 20%, Performance: 15%
  const budget = pr.estimatedBudget;

  const comparison = suppliers.map((supplier) => {
    // Price estimation simulation per supplier
    // Price variance based on rating & delivery
    const priceMultiplier = 0.9 + (supplier.rating / 5) * 0.2; // 0.9x to 1.1x of budget
    const estimatedPrice = Math.round((budget / pr.quantity) * priceMultiplier);
    const totalPrice = estimatedPrice * pr.quantity;

    // Price Score (lower total price relative to budget gets higher score)
    const priceRatio = totalPrice / budget;
    const priceScore = Math.min(100, Math.max(20, Math.round((1.2 - priceRatio) * 100)));

    // Delivery Score based on deliveryPerformance
    const deliveryDays = Math.max(3, Math.round(25 - (supplier.deliveryPerformance / 100) * 15));
    const deliveryScore = supplier.deliveryPerformance;

    // Rating Score (out of 100)
    const ratingScore = Math.round((supplier.rating / 5) * 100);

    // Performance Score
    const performanceScore = supplier.deliveryPerformance;

    // Weighted Overall Score
    const overallScore = Math.round(
      priceScore * 0.4 + deliveryScore * 0.25 + ratingScore * 0.2 + performanceScore * 0.15
    );

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      contactPerson: supplier.contactPerson,
      category: supplier.category,
      unitPrice: estimatedPrice,
      totalPrice,
      deliveryDays,
      rating: supplier.rating,
      deliveryPerformance: supplier.deliveryPerformance,
      paymentTerms: supplier.paymentTerms,
      scoreBreakdown: {
        priceScore,
        deliveryScore,
        ratingScore,
        performanceScore,
        overallScore,
      },
    };
  });

  // Sort by overall score descending
  comparison.sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore);

  const topSupplier = comparison[0];

  const recommendationSummary = `Recommended ${topSupplier.supplierName} with an overall score of ${topSupplier.scoreBreakdown.overallScore}/100 based on price competitive rating (${topSupplier.totalPrice.toLocaleString('en-IN')}) and high delivery performance (${topSupplier.deliveryPerformance}%).`;

  return {
    purchaseRequest: pr,
    recommendedSupplierId: topSupplier.supplierId,
    recommendationSummary,
    suppliers: comparison,
  };
}

/**
 * Select Supplier for Request
 */
export async function selectSupplierForRequest(
  requestId: string,
  supplierId: string,
  reason: string,
  userId: string
) {
  const pr = await prisma.purchaseRequest.findUnique({ where: { id: requestId } });
  if (!pr) throw { status: 404, message: 'Purchase request not found' };

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) throw { status: 404, message: 'Supplier not found' };

  const updatedPr = await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      selectedSupplierId: supplierId,
      selectionReason: reason,
      status: 'PROCUREMENT',
    },
    include: { selectedSupplier: true },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'SUPPLIER_SELECTED',
      entityType: 'PurchaseRequest',
      entityId: requestId,
      metadata: { supplierId, supplierName: supplier.name, reason },
    },
  });

  return updatedPr;
}
