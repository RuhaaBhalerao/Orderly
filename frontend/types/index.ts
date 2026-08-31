export type UserRole = 'REQUESTER' | 'MANAGER' | 'PROCUREMENT_OFFICER' | 'ADMIN';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  isActive: boolean;
}

export type PRStatus =
  | 'PENDING'
  | 'MANAGER_APPROVED'
  | 'MANAGER_REJECTED'
  | 'PROCUREMENT'
  | 'ORDERED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PRPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  estimatedBudget: number;
  department: string;
  priority: PRPriority;
  requiredByDate: string;
  status: PRStatus;
  requesterId: string;
  requester?: User;
  selectedSupplierId?: string;
  selectedSupplier?: Supplier;
  selectionReason?: string;
  approvals?: Approval[];
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  purchaseRequestId: string;
  approverId: string;
  approver?: User;
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  deliveryPerformance: number;
  paymentTerms: string;
  status: SupplierStatus;
  notes?: string;
  createdAt: string;
}

export type POStatus = 'DRAFT' | 'ISSUED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId: string;
  purchaseRequest?: PurchaseRequest;
  supplierId: string;
  supplier?: Supplier;
  createdBy: string;
  creator?: User;
  totalAmount: number;
  expectedDeliveryDate: string;
  paymentTerms: string;
  shippingInformation?: string;
  notes?: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  id: string;
  contractName: string;
  supplierId?: string;
  supplier?: Supplier;
  purchaseOrderId?: string;
  purchaseOrder?: PurchaseOrder;
  userId: string;
  user?: User;
  contractValue: number;
  startDate: string;
  expiryDate: string;
  renewalDate?: string;
  status: ContractStatus;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}
