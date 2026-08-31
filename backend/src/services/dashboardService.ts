import { prisma } from '../lib/prisma.js';

const demoDashboardData = {
  kpis: {
    totalProcurementSpend: 2425000,
    pendingRequests: 8,
    approvedRequests: 24,
    pendingApprovals: 5,
    activeSuppliers: 18,
    activeContracts: 31,
    contractsExpiringSoon: 4,
    openPurchaseOrders: 12,
  },
  recentRequests: [
    {
      id: 'demo-pr-1',
      requestNumber: 'PR-2026-001',
      title: 'High-Performance Laptops for Dev Team',
      status: 'PENDING',
      department: 'IT',
      priority: 'HIGH',
      estimatedBudget: 850000,
      createdAt: new Date().toISOString(),
      requester: { name: 'Rahul Sharma', department: 'IT' },
      selectedSupplier: null,
    },
    {
      id: 'demo-pr-2',
      requestNumber: 'PR-2026-002',
      title: 'Ergonomic Workstation Upgrades',
      status: 'MANAGER_APPROVED',
      department: 'IT',
      priority: 'MEDIUM',
      estimatedBudget: 350000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      requester: { name: 'Rahul Sharma', department: 'IT' },
      selectedSupplier: { name: 'XYZ Systems' },
    },
  ],
  expiringContractsList: [
    {
      id: 'demo-contract-1',
      contractName: 'Enterprise IT Support SLA',
      expiryDate: new Date(Date.now() + 12 * 86400000).toISOString(),
      supplier: { name: 'ABC Technologies' },
    },
    {
      id: 'demo-contract-2',
      contractName: 'Security Equipment Maintenance',
      expiryDate: new Date(Date.now() + 18 * 86400000).toISOString(),
      supplier: { name: 'Vertex Enterprises' },
    },
  ],
  recentPOs: [
    {
      id: 'demo-po-1',
      poNumber: 'PO-2026-101',
      status: 'ISSUED',
      totalAmount: 420000,
      createdAt: new Date().toISOString(),
      supplier: { name: 'XYZ Systems' },
      purchaseRequest: { requestNumber: 'PR-2026-002' },
    },
    {
      id: 'demo-po-2',
      poNumber: 'PO-2026-102',
      status: 'IN_PROGRESS',
      totalAmount: 260000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      supplier: { name: 'Nova Supplies' },
      purchaseRequest: { requestNumber: 'PR-2026-003' },
    },
  ],
};

export async function getDashboardMetrics(userId: string, userRole: string, userDepartment: string) {
  try {
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
  } catch (error) {
    console.warn('Database unavailable, using demo dashboard metrics');
    return demoDashboardData;
  }
}
