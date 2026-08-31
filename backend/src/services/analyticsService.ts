import { prisma } from '../lib/prisma';

const demoAnalyticsData = {
  overview: {
    totalSpending: 2425000,
    totalRequests: 42,
    approvedRequests: 28,
    rejectedRequests: 3,
    approvalRate: 67,
    poCompletionRate: 76,
  },
  spendByCategory: [
    { category: 'IT Hardware', amount: 980000 },
    { category: 'Office Equipment', amount: 420000 },
    { category: 'Office Supplies', amount: 310000 },
    { category: 'Security & CCTV', amount: 760000 },
  ],
  spendBySupplier: [
    { supplier: 'XYZ Systems', amount: 640000 },
    { supplier: 'ABC Technologies', amount: 520000 },
    { supplier: 'Vertex Enterprises', amount: 470000 },
    { supplier: 'Nova Supplies', amount: 320000 },
  ],
  supplierPerformance: [
    { name: 'XYZ Systems', rating: 4.7, deliveryPerformance: 96 },
    { name: 'Vertex Enterprises', rating: 4.6, deliveryPerformance: 94 },
    { name: 'Nova Supplies', rating: 4.5, deliveryPerformance: 92 },
    { name: 'ABC Technologies', rating: 4.2, deliveryPerformance: 88 },
  ],
};

export async function getAnalyticsMetrics() {
  try {
    const totalRequests = await prisma.purchaseRequest.count();
    const approvedCount = await prisma.purchaseRequest.count({
      where: { status: { in: ['MANAGER_APPROVED', 'PROCUREMENT', 'ORDERED', 'DELIVERED', 'COMPLETED'] } },
    });
    const rejectedCount = await prisma.purchaseRequest.count({
      where: { status: 'MANAGER_REJECTED' },
    });

    const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0;

    // Total Spending
    const poTotal = await prisma.purchaseOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    });

    const totalSpending = poTotal._sum.totalAmount || 0;

    // Spend by Category
    const prs = await prisma.purchaseRequest.findMany({
      where: { status: { in: ['ORDERED', 'DELIVERED', 'COMPLETED', 'PROCUREMENT'] } },
      select: { category: true, estimatedBudget: true },
    });

    const categorySpendMap: Record<string, number> = {};
    prs.forEach((pr) => {
      categorySpendMap[pr.category] = (categorySpendMap[pr.category] || 0) + pr.estimatedBudget;
    });

    const spendByCategory = Object.keys(categorySpendMap).map((cat) => ({
      category: cat,
      amount: categorySpendMap[cat],
    }));

    // Spend by Supplier
    const pos = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { supplier: { select: { name: true } } },
    });

    const supplierSpendMap: Record<string, number> = {};
    pos.forEach((po) => {
      const sName = po.supplier.name;
      supplierSpendMap[sName] = (supplierSpendMap[sName] || 0) + po.totalAmount;
    });

    const spendBySupplier = Object.keys(supplierSpendMap).map((sName) => ({
      supplier: sName,
      amount: supplierSpendMap[sName],
    }));

    // PO Completion Rate
    const totalPOs = await prisma.purchaseOrder.count();
    const deliveredPOs = await prisma.purchaseOrder.count({ where: { status: 'DELIVERED' } });
    const poCompletionRate = totalPOs > 0 ? Math.round((deliveredPOs / totalPOs) * 100) : 0;

    // Supplier Ratings Overview
    const suppliers = await prisma.supplier.findMany({
      select: { name: true, rating: true, deliveryPerformance: true },
      orderBy: { rating: 'desc' },
    });

    return {
      overview: {
        totalSpending,
        totalRequests,
        approvedRequests: approvedCount,
        rejectedRequests: rejectedCount,
        approvalRate,
        poCompletionRate,
      },
      spendByCategory,
      spendBySupplier,
      supplierPerformance: suppliers,
    };
  } catch (error) {
    console.warn('Database unavailable, using demo analytics metrics');
    return demoAnalyticsData;
  }
}
