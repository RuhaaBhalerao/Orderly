import { prisma } from '../lib/prisma';

export async function getDashboardMetrics(userId: string, userRole: string, userDepartment: string) {
  // 1. Total Procurement Spend (Sum of non-cancelled POs)
  const spendAgg = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: 'CANCELLED' } },
  });

  const totalProcurementSpend = spendAgg._sum.totalAmount || 0;

  // 2. Pending Requests
  const prWhere: any = {};
  if (userRole === 'REQUESTER') prWhere.requesterId = userId;
  if (userRole === 'MANAGER') prWhere.department = userDepartment;

  const pendingRequests = await prisma.purchaseRequest.count({
    where: { ...prWhere, status: 'PENDING' },
  });

  // 3. Approved Requests
  const approvedRequests = await prisma.purchaseRequest.count({
    where: { ...prWhere, status: { in: ['MANAGER_APPROVED', 'PROCUREMENT', 'ORDERED', 'COMPLETED'] } },
  });

  // 4. Pending Approvals for Manager
  const pendingApprovals = await prisma.purchaseRequest.count({
    where: { department: userDepartment, status: 'PENDING' },
  });

  // 5. Active Suppliers
  const activeSuppliers = await prisma.supplier.count({
    where: { status: 'ACTIVE' },
  });

  // 6. Contracts metrics
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const activeContracts = await prisma.contract.count({
    where: { expiryDate: { gt: thirtyDaysLater } },
  });

  const contractsExpiringSoon = await prisma.contract.count({
    where: {
      expiryDate: {
        gte: now,
        lte: thirtyDaysLater,
      },
    },
  });

  // 7. Open Purchase Orders
  const openPurchaseOrders = await prisma.purchaseOrder.count({
    where: { status: { in: ['DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'IN_PROGRESS'] } },
  });

  // 8. Recent Requests (latest 5)
  const recentRequests = await prisma.purchaseRequest.findMany({
    where: prWhere,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { requester: { select: { name: true, department: true } }, selectedSupplier: { select: { name: true } } },
  });

  // 9. Contract Alerts
  const expiringContractsList = await prisma.contract.findMany({
    where: {
      expiryDate: { lte: thirtyDaysLater },
    },
    take: 5,
    orderBy: { expiryDate: 'asc' },
    include: { supplier: { select: { name: true } } },
  });

  // 10. Recent POs
  const recentPOs = await prisma.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { supplier: { select: { name: true } }, purchaseRequest: { select: { requestNumber: true } } },
  });

  return {
    kpis: {
      totalProcurementSpend,
      pendingRequests,
      approvedRequests,
      pendingApprovals,
      activeSuppliers,
      activeContracts,
      contractsExpiringSoon,
      openPurchaseOrders,
    },
    recentRequests,
    expiringContractsList,
    recentPOs,
  };
}
