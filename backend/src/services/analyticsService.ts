import { prisma } from '../lib/prisma';

export async function getAnalyticsMetrics() {
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
}
