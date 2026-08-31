import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Orderly database seeding...');

  // 1. Clear existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Seed Employee Registry (10 Demo Employees + 1 Admin)
  const employeeData = [
    { employeeId: 'EMP001', name: 'Rahul Sharma', email: 'rahul@example.com', department: 'IT', role: 'REQUESTER', isActive: true },
    { employeeId: 'EMP002', name: 'Ananya Patil', email: 'ananya@example.com', department: 'HR', role: 'REQUESTER', isActive: true },
    { employeeId: 'EMP003', name: 'Rohan Mehta', email: 'rohan@example.com', department: 'Finance', role: 'REQUESTER', isActive: true },
    { employeeId: 'EMP004', name: 'Priya Deshmukh', email: 'priya@example.com', department: 'IT', role: 'MANAGER', isActive: true },
    { employeeId: 'EMP005', name: 'Arjun Kulkarni', email: 'arjun@example.com', department: 'HR', role: 'MANAGER', isActive: true },
    { employeeId: 'EMP006', name: 'Sneha Joshi', email: 'sneha@example.com', department: 'Procurement', role: 'PROCUREMENT_OFFICER', isActive: true },
    { employeeId: 'EMP007', name: 'Aditya Shah', email: 'aditya@example.com', department: 'Procurement', role: 'PROCUREMENT_OFFICER', isActive: true },
    { employeeId: 'EMP008', name: 'Neha Verma', email: 'neha@example.com', department: 'Marketing', role: 'REQUESTER', isActive: true },
    { employeeId: 'EMP009', name: 'Karan Singh', email: 'karan@example.com', department: 'Operations', role: 'REQUESTER', isActive: true },
    { employeeId: 'EMP010', name: 'Isha Nair', email: 'isha@example.com', department: 'Finance', role: 'REQUESTER', isActive: true },
    { employeeId: 'ADMIN001', name: 'System Admin', email: 'admin@procureai.com', department: 'IT', role: 'ADMIN', isActive: true },
  ];

  for (const emp of employeeData) {
    await prisma.employee.create({ data: emp });
  }
  console.log(`✅ Seeded ${employeeData.length} Employee records.`);

  // 3. Seed Password Hashing
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 4. Seed Pre-registered Users for Quick Demo Testing
  const adminUser = await prisma.user.create({
    data: {
      employeeId: 'ADMIN001',
      name: 'System Admin',
      email: 'admin@procureai.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      department: 'IT',
    },
  });

  const requesterUser = await prisma.user.create({
    data: {
      employeeId: 'EMP001',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: defaultPasswordHash,
      role: 'REQUESTER',
      department: 'IT',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      employeeId: 'EMP004',
      name: 'Priya Deshmukh',
      email: 'priya@example.com',
      password: defaultPasswordHash,
      role: 'MANAGER',
      department: 'IT',
    },
  });

  const procurementUser = await prisma.user.create({
    data: {
      employeeId: 'EMP006',
      name: 'Sneha Joshi',
      email: 'sneha@example.com',
      password: defaultPasswordHash,
      role: 'PROCUREMENT_OFFICER',
      department: 'Procurement',
    },
  });

  console.log('✅ Seeded core demo users (Admin, Requester, Manager, Procurement Officer).');

  // 5. Seed 5 Realistic Suppliers
  const supplierData = [
    {
      name: 'ABC Technologies',
      contactPerson: 'Rajesh Gupta',
      email: 'sales@abctech.com',
      phone: '+91 98765 43210',
      address: 'Tech Park, Sector 62, Noida, UP',
      category: 'IT Hardware',
      rating: 4.2,
      deliveryPerformance: 88,
      paymentTerms: 'Net 30',
      status: 'ACTIVE',
      notes: 'Leading supplier of enterprise laptops and workstation accessories.',
    },
    {
      name: 'XYZ Systems',
      contactPerson: 'Sunita Rao',
      email: 'contracts@xyzsystems.io',
      phone: '+91 98123 45678',
      address: 'Electronic City Phase 1, Bengaluru, KA',
      category: 'IT Hardware',
      rating: 4.7,
      deliveryPerformance: 96,
      paymentTerms: 'Net 15',
      status: 'ACTIVE',
      notes: 'Premium high-speed server infrastructure and networking hardware provider.',
    },
    {
      name: 'PQR Solutions',
      contactPerson: 'Amit Joshi',
      email: 'contact@pqrsolutions.com',
      phone: '+91 97654 32109',
      address: 'MIDC Industrial Area, Pune, MH',
      category: 'Office Equipment',
      rating: 3.8,
      deliveryPerformance: 82,
      paymentTerms: 'Net 45',
      status: 'ACTIVE',
      notes: 'Bulk office furniture, ergonomic chairs, and desk organizers.',
    },
    {
      name: 'Nova Supplies',
      contactPerson: 'Meera Nair',
      email: 'orders@novasupplies.in',
      phone: '+91 99887 76655',
      address: 'Gachibowli Financial District, Hyderabad, TS',
      category: 'Office Supplies',
      rating: 4.5,
      deliveryPerformance: 92,
      paymentTerms: 'Net 30',
      status: 'ACTIVE',
      notes: 'Corporate stationery, printers, ink cartridges, and paper products.',
    },
    {
      name: 'Vertex Enterprises',
      contactPerson: 'Vikram Patel',
      email: 'info@vertexenterprise.com',
      phone: '+91 91234 56789',
      address: 'Andheri East Industrial Estate, Mumbai, MH',
      category: 'Security & CCTV',
      rating: 4.6,
      deliveryPerformance: 94,
      paymentTerms: 'Net 30',
      status: 'ACTIVE',
      notes: 'Enterprise CCTV surveillance systems, biometric access controllers, and alarms.',
    },
  ];

  const createdSuppliers = [];
  for (const supp of supplierData) {
    const s = await prisma.supplier.create({ data: supp });
    createdSuppliers.push(s);
  }
  console.log(`✅ Seeded ${createdSuppliers.length} Supplier records.`);

  // 6. Seed Demo Purchase Requests with Recent Dates (22 - 31 August 2026)
  const pr1 = await prisma.purchaseRequest.create({
    data: {
      requestNumber: 'PR-2026-001',
      title: 'High-Performance Laptops for Development Team',
      description: 'Requirement of 10 high-spec laptops (32GB RAM, 1TB SSD) for newly hired software engineers.',
      category: 'IT Hardware',
      quantity: 10,
      estimatedBudget: 850000,
      department: 'IT',
      priority: 'HIGH',
      createdAt: new Date('2026-08-22T10:30:00Z'),
      requiredByDate: new Date('2026-09-05T00:00:00Z'),
      status: 'PENDING',
      requesterId: requesterUser.id,
    },
  });

  const pr2 = await prisma.purchaseRequest.create({
    data: {
      requestNumber: 'PR-2026-002',
      title: 'Ergonomic Mesh Chairs & Standing Desks',
      description: 'Upgrade office furniture for HR department workspace to enhance employee ergonomics.',
      category: 'Office Equipment',
      quantity: 15,
      estimatedBudget: 350000,
      department: 'IT',
      priority: 'MEDIUM',
      createdAt: new Date('2026-08-25T14:15:00Z'),
      requiredByDate: new Date('2026-09-08T00:00:00Z'),
      status: 'MANAGER_APPROVED',
      requesterId: requesterUser.id,
    },
  });

  await prisma.approval.create({
    data: {
      purchaseRequestId: pr2.id,
      approverId: managerUser.id,
      decision: 'APPROVED',
      comment: 'Approved budget within IT Q3 allocation.',
      createdAt: new Date('2026-08-25T16:00:00Z'),
    },
  });

  const pr3 = await prisma.purchaseRequest.create({
    data: {
      requestNumber: 'PR-2026-003',
      title: 'Enterprise Server Rack Expansion Unit',
      description: 'Procurement of secondary server rack for expanded data storage and database backups.',
      category: 'IT Hardware',
      quantity: 2,
      estimatedBudget: 1200000,
      department: 'IT',
      priority: 'URGENT',
      createdAt: new Date('2026-08-26T09:00:00Z'),
      requiredByDate: new Date('2026-09-12T00:00:00Z'),
      status: 'ORDERED',
      requesterId: requesterUser.id,
      selectedSupplierId: createdSuppliers[1].id, // XYZ Systems
      selectionReason: 'XYZ Systems provided the best combination of 96% delivery speed and 4.7 rating.',
    },
  });

  await prisma.approval.create({
    data: {
      purchaseRequestId: pr3.id,
      approverId: managerUser.id,
      decision: 'APPROVED',
      comment: 'Critical infrastructure requirement. Approved.',
      createdAt: new Date('2026-08-26T11:30:00Z'),
    },
  });

  const pr4 = await prisma.purchaseRequest.create({
    data: {
      requestNumber: 'PR-2026-004',
      title: 'GPU Acceleration Workstations for ML Research',
      description: 'Requirement for 4 GPU workstation nodes to support deep learning model training.',
      category: 'IT Hardware',
      quantity: 4,
      estimatedBudget: 980000,
      department: 'IT',
      priority: 'URGENT',
      createdAt: new Date('2026-08-28T16:45:00Z'),
      requiredByDate: new Date('2026-09-15T00:00:00Z'),
      status: 'MANAGER_APPROVED',
      requesterId: requesterUser.id,
    },
  });

  await prisma.approval.create({
    data: {
      purchaseRequestId: pr4.id,
      approverId: managerUser.id,
      decision: 'APPROVED',
      comment: 'AI research capital expenditure approved.',
      createdAt: new Date('2026-08-29T10:00:00Z'),
    },
  });

  const pr5 = await prisma.purchaseRequest.create({
    data: {
      requestNumber: 'PR-2026-005',
      title: 'Biometric Access Control Controllers & CCTV Cameras',
      description: 'Upgrade perimeter security sensors and biometric door locks across Noida facility.',
      category: 'Security & CCTV',
      quantity: 8,
      estimatedBudget: 420000,
      department: 'IT',
      priority: 'HIGH',
      createdAt: new Date('2026-08-30T11:20:00Z'),
      requiredByDate: new Date('2026-09-20T00:00:00Z'),
      status: 'PENDING',
      requesterId: requesterUser.id,
    },
  });

  console.log('✅ Seeded demo Purchase Requests and Approvals with recent August 2026 dates.');

  // 7. Seed Demo Purchase Order
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-001',
      purchaseRequestId: pr3.id,
      supplierId: createdSuppliers[1].id,
      createdBy: procurementUser.id,
      totalAmount: 1180000,
      createdAt: new Date('2026-08-27T11:00:00Z'),
      expectedDeliveryDate: new Date('2026-09-08T00:00:00Z'),
      paymentTerms: 'Net 15',
      shippingInformation: 'Deliver to Building B, Server Room 3, IT Park, Noida',
      notes: 'Include installation support and 3-year enterprise warranty documentation.',
      status: 'IN_PROGRESS',
      items: {
        create: [
          {
            description: 'XYZ Enterprise Rack Server 4U Unit',
            quantity: 2,
            unitPrice: 590000,
            totalPrice: 1180000,
          },
        ],
      },
    },
  });

  console.log('✅ Seeded demo Purchase Order with recent August 2026 issuance date.');

  // 8. Seed Demo Contracts
  await prisma.contract.create({
    data: {
      contractName: 'Master Hardware Supply Agreement - XYZ Systems',
      supplierId: createdSuppliers[1].id,
      purchaseOrderId: po1.id,
      userId: procurementUser.id,
      contractValue: 1180000,
      createdAt: new Date('2026-08-27T12:00:00Z'),
      startDate: new Date('2026-08-01T00:00:00Z'),
      expiryDate: new Date('2026-09-20T00:00:00Z'), // Expiring soon in September 2026
      status: 'EXPIRING_SOON',
      fileName: 'XYZ_Master_Agreement_2026.pdf',
      fileUrl: '/uploads/contracts/XYZ_Master_Agreement_2026.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      notes: 'Master SLA for server infrastructure maintenance and emergency warranty replacement.',
    },
  });

  await prisma.contract.create({
    data: {
      contractName: 'Annual Office Furniture Maintenance Contract - PQR',
      supplierId: createdSuppliers[2].id,
      userId: procurementUser.id,
      contractValue: 350000,
      createdAt: new Date('2026-08-15T00:00:00Z'),
      startDate: new Date('2026-08-15T00:00:00Z'),
      expiryDate: new Date('2027-08-15T00:00:00Z'),
      status: 'ACTIVE',
      fileName: 'PQR_Furniture_SLA.pdf',
      fileUrl: '/uploads/contracts/PQR_Furniture_SLA.pdf',
      fileType: 'application/pdf',
      fileSize: 524288,
      notes: 'Covers routine repair and ergonomic adjustments for all desk units.',
    },
  });

  console.log('✅ Seeded demo Contracts.');

  // 9. Seed Initial Notifications with Recent August 2026 Timestamps
  await prisma.notification.create({
    data: {
      userId: requesterUser.id,
      title: 'Purchase Request Approved',
      message: 'Your purchase request PR-2026-002 has been approved by Priya Deshmukh.',
      type: 'SUCCESS',
      link: '/requests',
      createdAt: new Date('2026-08-25T16:05:00Z'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: managerUser.id,
      title: 'New Pending Approval',
      message: 'New purchase request PR-2026-005 is awaiting your approval.',
      type: 'INFO',
      link: '/approvals',
      createdAt: new Date('2026-08-30T11:25:00Z'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: procurementUser.id,
      title: 'Contract Expiring Soon',
      message: 'Master Hardware Supply Agreement - XYZ Systems will expire in 20 days.',
      type: 'WARNING',
      link: '/contracts',
      createdAt: new Date('2026-08-31T08:00:00Z'),
    },
  });

  console.log('✅ Seeded initial notifications with recent August 2026 dates.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
