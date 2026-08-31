# Orderly

## Procurement Operations Platform

Orderly is a procurement workflow system for employee-driven purchasing, supplier management, approval tracking, and spend visibility. The app supports the full lifecycle from purchase request creation to manager approval, supplier comparison, purchase order issuance, and operational monitoring.

**Status:** Active MVP  
**Last Updated:** August 2026

---

## What the app does today

Orderly is not a contract AI or Gmail inbox tool. The current product is a procurement platform with these workflows:

1. Employee login and role-based access
2. Purchase request creation by requesters
3. Manager approval and rejection actions
4. Supplier comparison with weighted scoring
5. Procurement officer supplier selection and purchase order generation
6. Contract record tracking tied to suppliers and purchase orders
7. Dashboard metrics, analytics, audit logs, and notifications

This means the system matches a real internal purchasing process instead of the earlier document-intelligence concept.

---

## Core features

### Authentication and roles

- Email/password login with JWT authentication
- Role-based access for REQUESTER, MANAGER, PROCUREMENT_OFFICER, and ADMIN
- Employee ID validation during registration
- Demo accounts for quick testing

### Purchase request workflow

- Create purchase requests with category, quantity, budget, and due date
- Track status through pending, approved, rejected, and ordered states
- Manager dashboard for approval and rejection decisions
- Department-based visibility rules

### Supplier management

- Supplier directory with category, rating, payment terms, and status
- Search and filtering by category or availability
- Supplier comparison based on price, rating, delivery performance, and risk

### Purchase order creation

- Selected supplier becomes the basis for a purchase order
- PO generation with totals, line items, payment terms, and expected delivery
- Order lifecycle tracking and audit events

### Contracts and records

- Contract records linked to suppliers and purchase orders
- Contract value, start date, expiry date, renewal date, and file metadata
- Document storage and tracking within procurement workflows

### Analytics and operations

- Dashboard KPIs for requests, orders, approvals, and supplier health
- Analytics for supplier spend and department activity
- Notification feed and audit log history

---

## Tech stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- React hooks and context-based session state

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT and bcrypt

### Infrastructure

- Local PostgreSQL database
- Environment-based configuration
- REST API architecture

---

## Project structure

```bash
Orderly/
├── frontend/                  # Next.js UI
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── backend/                  # Express + Prisma API
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   ├── uploads/
│   └── package.json
├── README.md                 # Project overview
├── PRD.md                    # Product requirements
├── TRD.md                    # Technical requirements
├── Orderly_Backend.postman_collection.json
└── .gitignore
```

---

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Default app URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## Environment variables

### Backend

```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/orderly"
JWT_SECRET="your_super_secret_key"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
OPENROUTER_API_KEY="optional"
GEMINI_API_KEY="optional"
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Orderly
```

---

## User journey

### Requester flow

- Sign in as a requester
- Create a purchase request
- Submit it for manager approval

### Manager flow

- Review pending requests
- Approve or reject with comments
- Send approved requests to procurement

### Procurement officer flow

- Compare suppliers for approved requests
- Select a supplier
- Create purchase orders

### Admin flow

- Manage users, audit logs, and operational oversight

---

## Current product scope

### Included in current MVP

- Employee registration and login
- Role-based authorization
- Purchase request management
- Supplier catalog and comparison
- Purchase order creation
- Contract tracking
- Dashboard and analytics
- Notifications and audit logs

### Not the current scope

- Gmail integration
- PDF contract intelligence
- AI summarization of legal documents
- Auto-importing email attachments

---

## Useful links

- [PRD.md](PRD.md)
- [TRD.md](TRD.md)

---

## Notes

Orderly is the current product identity of this codebase. Older documentation and branding references to ProcureAI were kept only as historical notes and should be treated as legacy naming.
