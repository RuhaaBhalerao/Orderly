# Product Requirements Document (PRD)
## Orderly: Procurement Operations Platform

**Version:** 2.0  
**Date:** August 2026  
**Status:** Active product definition  

---

## 1. Executive summary

Orderly is a procurement operations platform built to manage the lifecycle of internal purchasing work. The product helps employees request items, managers review requests, procurement teams compare suppliers, and operations teams issue purchase orders with clear audit trails and reporting.

The current implementation focuses on a practical approval workflow rather than document extraction or email ingestion. It provides a consistent, low-friction procurement process that is easier to track than spreadsheets or disconnected tools.

---

## 2. Problem statement

Organizations often manage purchasing through fragmented communication:

- Requesters send purchase needs by email or chat
- Managers approve manually without visibility into budget or history
- Procurement teams evaluate suppliers inconsistently
- Purchase orders are created outside a central system
- No single dashboard exists for spend, approvals, or supplier tracking

This creates delays, duplicate purchasing, inconsistent supplier selection, and weak audit coverage.

### Pain points

- Manual request collection is slow and error-prone
- Approvals are hard to track across departments
- Supplier comparison is inconsistent and subjective
- Purchase order creation lacks centralized control
- Teams cannot easily see spend patterns and approval status

---

## 3. Product goals

### Primary goals

1. Create a single place for employee purchase requests
2. Standardize approval workflow across departments
3. Support supplier comparison using clear weighted criteria
4. Turn approved requests into purchase orders efficiently
5. Give managers and procurement teams operational visibility

### Secondary goals

1. Improve accountability through audit logs
2. Improve supplier visibility and spend tracking
3. Support future analytics and notification workflows

---

## 4. User personas

### Persona 1: Rahul — Requester

- Raises purchase requests for tools, equipment, or services
- Needs a quick and simple request form
- Wants to know whether a request is approved or rejected

### Persona 2: Priya — Manager

- Reviews department requests
- Approves or rejects based on need, budget, and timing
- Requires structured workflow and comments on decisions

### Persona 3: Sneha — Procurement Officer

- Evaluates supplier options
- Selects the best vendor for approved requests
- Issues purchase orders and tracks execution

### Persona 4: System Admin

- Oversees employee onboarding and platform operations
- Monitors system activity and audit history

---

## 5. Functional requirements

### 5.1 Authentication and access

- Users must sign in with employee email and password
- Users must be assigned an employee ID and role
- Registration must validate employee ID and role assignment
- The system must enforce role-based access control
- Admin accounts cannot be publicly registered

### 5.2 Purchase request management

- Requesters can create purchase requests with title, description, category, and budget
- Requests include quantity, priority, and required-by date
- Requests are visible based on the user’s role and department
- Managers can approve or reject requests with comments
- Requests must retain status and approval history

### 5.3 Supplier management

- Procurement users can view supplier records
- Supplier records include category, rating, contact data, and payment terms
- Suppliers can be searched and filtered by category or status
- Suppliers can be managed through the product catalog

### 5.4 Supplier comparison

- Approved requests can be compared against eligible suppliers
- Comparison must include price estimation, delivery performance, and rating
- A weighted score helps select the most suitable supplier

### 5.5 Purchase orders

- Procurement users can create a purchase order from a selected supplier
- Purchase orders include total value, items, expected delivery, and payment terms
- PO status must be tracked throughout the lifecycle

### 5.6 Contracts and records

- Contracts can be attached to suppliers or purchase orders
- Contract metadata includes value, start date, expiry date, and renewal date
- Contract status can be tracked as active, expiring soon, or expired

### 5.7 Dashboard and analytics

- Dashboards show key operational metrics for each user role
- Analytics summarize supplier spend and request activity
- Recent activity and notifications help users stay informed

### 5.8 Audit and notifications

- Major actions must create audit log entries
- Users receive notifications for approvals, rejections, and PO creation

---

## 6. Non-functional requirements

### Performance

- Dashboard and listing screens should load quickly for regular internal use
- API requests should remain responsive under standard procurement volume
- Role-based filtering should be efficient and predictable

### Security

- Passwords must be hashed
- JWT tokens must be validated for protected routes
- Role checks must be enforced before sensitive actions
- Audit logs should capture operational changes

### Reliability

- Failed flows should return clear user-friendly messages
- App startup must fail gracefully when required environment values are missing
- Database access should use safe Prisma queries and validation

### Usability

- Interface must be easy for employees with moderate technical comfort
- Core workflows should be straightforward: request, review, compare, order
- The platform should feel like a professional internal operations tool

---

## 7. Current product flow

### Requester workflow

1. Log in
2. Create a purchase request
3. Submit for manager review

### Manager workflow

1. View pending approvals
2. Approve or reject each request
3. Add any comments for the requester

### Procurement officer workflow

1. View approved requests
2. Compare supplier options
3. Select supplier
4. Generate purchase order

### Admin workflow

1. Review employee and platform activity
2. Monitor audit logs and notifications

---

## 8. MVP scope

### Included

- Employee login and registration
- Role-based access
- Purchase request lifecycle
- Manager approvals and rejections
- Supplier catalog
- Supplier comparison scoring
- Purchase order creation
- Dashboard metrics and analytics
- Notifications and audit logs

### Excluded from current MVP

- Gmail integration
- AI-based contract extraction
- Document summarization
- PDF processing and Q&A
- Email scraping workflows

---

## 9. Success metrics

- Number of purchase requests created per month
- Approval cycle time per request
- Procurement team time saved per order
- Supplier comparison adoption rate
- Number of purchase orders issued
- Audit log completeness

---

## 10. Constraints and assumptions

- The app is intended for internal procurement workflows
- Employee records and roles are pre-defined in the system
- Procurement actions are tied to a PostgreSQL database
- The current UI is web-based and designed for internal team use

---

## 11. Acceptance criteria

- [ ] Users can register and log in
- [ ] Requesters can create purchase requests
- [ ] Managers can approve or reject requests
- [ ] Procurement users can compare suppliers
- [ ] Approved requests can be issued as purchase orders
- [ ] Dashboard metrics reflect real activity
- [ ] Audit logs are created for key events
- [ ] Notifications are available for important workflow steps

---

**Document version control:**
- Version 2.0 - Updated to reflect the current Orderly procurement platform
- Updated: August 2026
