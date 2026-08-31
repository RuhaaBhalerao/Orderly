# Technical Requirements Document (TRD)
## Orderly: Procurement Platform Architecture

**Version:** 2.0  
**Date:** August 2026  
**Status:** Current implementation guide  

---

## 1. System overview

Orderly is a web-based procurement workflow system with an employee-driven approval lifecycle. It includes authentication, purchasing, supplier management, purchase-order generation, analytics, notifications, and audit tracking.

### High-level architecture

```text
Client (Next.js frontend)
        │
        ▼
Node.js + Express API
        │
        ├── Auth & authorization
        ├── Purchase request workflow
        ├── Supplier catalog and comparison
        ├── Purchase order management
        ├── Dashboard and analytics
        ├── Notifications
        └── Audit logs
        │
        ▼
PostgreSQL database via Prisma
```

### Core interaction model

1. User signs in with role-based access
2. Requester creates a purchase request
3. Manager approves or rejects the request
4. Procurement user compares suppliers
5. Purchase order is created for selected supplier
6. Dashboard and analytics update from live records

---

## 2. Technology stack

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js | UI and routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | UI styling |
| State | React hooks/context | Session and UI state |

### Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js | Application runtime |
| Framework | Express.js | REST API layer |
| Language | TypeScript | Type-safe backend logic |
| ORM | Prisma | Database access and schema management |
| Database | PostgreSQL | Persistence layer |
| Security | JWT + bcrypt | Auth and password protection |

### Supporting tools

- Prisma Studio for DB inspection
- Jest for backend testing
- dotenv for configuration

---

## 3. Project structure

```bash
Orderly/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── types/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── lib/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── uploads/
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
├── PRD.md
├── TRD.md
└── Orderly_Backend.postman_collection.json
```

---

## 4. API design

### Authentication endpoints

#### POST /api/auth/register

Request body:

```json
{
  "name": "Rahul Sharma",
  "employeeId": "EMP001",
  "email": "rahul@example.com",
  "password": "Password@123",
  "role": "REQUESTER"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "employeeId": "EMP001",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "REQUESTER",
    "department": "IT"
  }
}
```

#### POST /api/auth/login

Request body:

```json
{
  "email": "rahul@example.com",
  "password": "Password@123"
}
```

#### GET /api/auth/me

Returns current authenticated user profile.

---

### Purchase request endpoints

#### GET /api/purchase-requests
Returns filtered purchase requests based on user role and department.

#### POST /api/purchase-requests
Creates a new purchase request.

#### GET /api/purchase-requests/:id
Returns the request with approvals and selected supplier details.

#### POST /api/purchase-requests/:id/approve
Approves a request as a manager.

#### POST /api/purchase-requests/:id/reject
Rejects a request with an optional comment.

#### POST /api/purchase-requests/:id/compare-suppliers
Runs weighted supplier comparison.

#### POST /api/purchase-requests/:id/select-supplier
Selects a supplier for the request.

---

### Supplier endpoints

#### GET /api/suppliers
List suppliers with search and category filters.

#### GET /api/suppliers/:id
Returns supplier details.

#### POST /api/suppliers
Creates a supplier record.

---

### Purchase order endpoints

#### GET /api/purchase-orders
Lists purchase orders, optionally filtered.

#### POST /api/purchase-orders
Creates a purchase order from a selected supplier.

#### PATCH /api/purchase-orders/:id/status
Updates PO lifecycle status.

---

### Contract endpoints

#### GET /api/contracts
Lists contract records.

#### POST /api/contracts
Creates a contract record tied to a supplier or order.

---

### Dashboard and analytics endpoints

#### GET /api/dashboard
Returns summary metrics for the user context.

#### GET /api/analytics
Returns analytics metrics for spend and supplier trends.

#### GET /api/notifications
Returns notification feed.

#### GET /api/audit-logs
Returns user and system audit events.

---

## 5. Database schema

### Employees

```prisma
model Employee {
  id          String   @id @default(cuid())
  employeeId  String   @unique
  name        String
  email       String   @unique
  department  String
  role        String
  isActive    Boolean  @default(true)
  users       User[]
}
```

### Users

```prisma
model User {
  id             String            @id @default(cuid())
  employeeId     String            @unique
  name           String
  email          String            @unique
  password       String
  role           String
  department     String
  requests       PurchaseRequest[]
  purchaseOrders PurchaseOrder[]
  contracts      Contract[]
}
```

### Purchase request

```prisma
model PurchaseRequest {
  id              String          @id @default(cuid())
  requestNumber   String          @unique
  title           String
  description     String
  category        String
  quantity        Int
  estimatedBudget Float
  department      String
  priority        String
  requiredByDate  DateTime
  status          String
  requesterId     String
  selectedSupplierId String?
}
```

### Supplier

```prisma
model Supplier {
  id                  String @id @default(cuid())
  name                String
  contactPerson       String
  email               String
  phone               String
  address             String
  category            String
  rating              Float
  deliveryPerformance Int
  paymentTerms        String
  status              String
}
```

### Purchase order

```prisma
model PurchaseOrder {
  id                   String @id @default(cuid())
  poNumber             String @unique
  purchaseRequestId    String
  supplierId           String
  createdBy            String
  totalAmount          Float
  expectedDeliveryDate DateTime
  paymentTerms         String
  status               String
}
```

### Contracts and audit log

```prisma
model Contract {
  id           String @id @default(cuid())
  contractName String
  supplierId   String?
  purchaseOrderId String?
  userId       String
  contractValue Float
  startDate    DateTime
  expiryDate   DateTime
  status       String
}

model AuditLog {
  id         String @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

---

## 6. Authentication and authorization

### Authentication flow

1. User submits login credentials
2. Backend validates the email and password
3. JWT is generated with user role and department
4. Frontend stores the token and uses it on protected requests

### Authorization rules

- REQUESTER can create and view their own request history
- MANAGER can review requests within their department
- PROCUREMENT_OFFICER can compare suppliers and issue purchase orders
- ADMIN has complete operational visibility

---

## 7. Data flow

### Purchase request lifecycle

```text
Requester -> Create request -> Save to DB -> Manager review -> Approve or reject -> Procurement comparison -> Purchase order -> Contract tracking
```

### Supplier selection flow

```text
Approved request -> Supplier comparison -> Weighted scoring -> Supplier selected -> PO creation -> Status tracking
```

---

## 8. Security requirements

- Passwords must be hashed using bcrypt
- JWT must be required for authenticated endpoints
- Sensitive actions must validate user role before execution
- Database actions must use Prisma with parameterized queries
- Audit logs must capture core business events

---

## 9. Deployment model

### Local

- PostgreSQL database on localhost
- Next.js frontend on port 3000
- Express backend on port 5000

### Production

- Containerized base deployment is supported
- Database remains PostgreSQL
- Frontend and backend can be deployed independently behind a reverse proxy or load balancer

---

## 10. Validation and testing

The backend uses Jest and Prisma-backed route tests. The project includes API test scripts for key flows such as authentication, purchase requests, supplier workflow, and order lifecycle checks.

The main validation goals are:

- login and registration correctness
- request approval flow
- supplier comparison logic
- order creation and status transitions
- audit log capture

---

**Document version control:**
- Version 2.0 - Updated for the current Orderly procurement system
- Updated: August 2026
