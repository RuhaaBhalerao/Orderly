# Product Requirements Document (PRD)
## Procure AI: AI-Powered Contract Intelligence Platform

**Version:** 1.0  
**Date:** July 2026  
**Status:** MVP Definition  

---

## 1. Executive Summary

Procure AI is an enterprise application that automates the contract intake and review process for procurement teams. By connecting directly to Gmail, automatically importing contracts, and leveraging AI to extract critical information, Procure AI transforms how organizations manage supplier agreements.

Instead of manually downloading PDFs, organizing files, and searching through lengthy documents, procurement managers access a centralized, intelligent contract dashboard where AI-generated summaries, extracted key fields, and risk indicators are instantly available.

The MVP targets procurement managers, contract managers, and legal teams in small to medium enterprises, focusing on a single core workflow: **Connect Email → Import Contracts → AI Processing → Review & Analyze**.

---

## 2. Problem Statement

### Current State

Procurement teams receive supplier contracts via email daily. The typical workflow is manual and repetitive:

1. Supplier sends contract via email
2. Manager downloads PDF to local storage
3. File is manually organized in folder structure
4. PDF is uploaded into a separate contract management system
5. Manager reads through dozens of pages looking for critical information
6. Key contract details (renewal dates, payment terms, risks) are extracted manually
7. Information is recorded in spreadsheets or notes
8. Procurement decisions are made based on incomplete or delayed information

### Pain Points

- **Time Consuming:** Procurement managers spend hours per week on manual contract processing instead of strategic analysis
- **Error Prone:** Manual extraction leads to missed renewal dates, overlooked risk clauses, and inconsistent data capture
- **Fragmented Systems:** Contracts exist in email, local folders, and third-party systems—no single source of truth
- **Poor Visibility:** Leadership lacks real-time visibility into contract portfolio status, pending reviews, and expiring agreements
- **Compliance Risk:** Critical contract dates and obligations can be overlooked, creating legal and financial exposure
- **Scalability Issues:** As contract volume grows, manual processes become unsustainable

### Target Organizations

- Procurement departments in mid-market enterprises (50-500 employees)
- Legal departments managing supplier agreements
- Vendor management offices
- Organizations with 10-50 incoming contracts per month

---

## 3. Goals

### Primary Goals

1. **Reduce Manual Work:** Eliminate manual PDF downloads, uploads, and file organization by 90%
2. **Accelerate Contract Review:** Reduce time-to-contract-review from hours to minutes using AI summaries and extracted data
3. **Improve Accuracy:** Ensure consistent, error-free extraction of critical contract information
4. **Centralize Intelligence:** Create a single source of truth for all contract data and metadata
5. **Enable Data-Driven Decisions:** Provide procurement teams with actionable insights and risk indicators

### Secondary Goals

1. **Demonstrate Enterprise Architecture:** Build a production-grade microservice application
2. **Showcase AI Integration:** Implement practical AI for document intelligence
3. **Establish Scalable Patterns:** Create a foundation for future enterprise features (approvals, analytics, notifications)

---

## 4. User Personas

### Persona 1: Sarah – Senior Procurement Manager

**Background:** 8 years in procurement, manages supplier relationships, responsible for 15-20 active contracts

**Goals:**
- Review incoming contracts quickly without reading entire documents
- Track contract renewal dates and obligations
- Identify high-risk clauses before legal review
- Make faster procurement decisions

**Pain Points:**
- Spends 3-4 hours per week on contract intake
- Often misses renewal date emails
- Struggles to find specific clauses in long documents
- Needs data for quarterly business reviews

**Tech Comfort:** Moderate—comfortable with business software, not tech-savvy

---

### Persona 2: James – Legal/Contract Manager

**Background:** 5 years in legal, reviews all supplier contracts before execution

**Goals:**
- Quickly identify contracts requiring legal attention
- Flag high-risk clauses and non-standard terms
- Ask specific questions about contract language
- Maintain audit trail of reviewed contracts

**Pain Points:**
- Receives contracts from multiple sources
- Manual review is time-consuming and repetitive
- Needs consistent contract metadata
- Wants searchability across contract database

**Tech Comfort:** Moderate to High—comfortable with specialized legal software

---

### Persona 3: Mike – CFO/Finance Lead

**Background:** 10 years in finance, needs visibility into contract obligations and spend

**Goals:**
- Track payment terms and financial obligations
- Identify contracts expiring soon
- Monitor contract portfolio health
- Access key financial data without reading full contracts

**Pain Points:**
- Doesn't have visibility into contract status
- Can't quickly identify high-value contracts
- Needs reporting on contract portfolio metrics

**Tech Comfort:** Moderate—comfortable with dashboards and analytics

---

## 5. Functional Requirements

### 5.1 Authentication & Access

- **FR-1:** Users must authenticate via email/password (future: SSO support)
- **FR-2:** Application must support account creation with email verification
- **FR-3:** Users must manage their own Gmail connection via OAuth
- **FR-4:** Application must securely store OAuth tokens with encryption
- **FR-5:** Users must be able to disconnect and reconnect Gmail at any time

### 5.2 Email & Contract Intake

- **FR-6:** Application must connect to user's Gmail account via OAuth 2.0
- **FR-7:** Application must retrieve unread emails from the primary inbox
- **FR-8:** Application must identify and extract PDF attachments from emails
- **FR-9:** Application must display connection status on the dashboard
- **FR-10:** Users must be able to manually trigger "Sync Inbox" action
- **FR-11:** Application must prevent duplicate contract imports
- **FR-12:** Application must store sender email, subject, and receive date with each contract

### 5.3 AI Processing & Contract Intelligence

- **FR-13:** Application must extract contract text from PDF documents
- **FR-14:** Application must generate AI-powered contract summaries (200-300 words)
- **FR-15:** Application must extract key contract fields:
  - Vendor/Supplier Name
  - Contract Type
  - Start Date
  - End Date / Renewal Date
  - Payment Terms
  - Key Obligations
  - Notable Restrictions
- **FR-16:** Application must identify and flag high-risk clauses
- **FR-17:** Application must provide risk severity levels (Low, Medium, High)
- **FR-18:** Application must answer natural language questions about specific contracts (AI chat)

### 5.4 Contract Management & Dashboard

- **FR-19:** Dashboard must display welcome section with user name
- **FR-20:** Dashboard must show Gmail connection status and connection date
- **FR-21:** Dashboard must display KPI cards:
  - Total Contracts Imported
  - Contracts Pending Review
  - High-Risk Contracts
  - Contracts Expiring Within 30 Days
- **FR-22:** Dashboard must display recent contracts in a sortable, filterable table
- **FR-23:** Dashboard must provide one-click access to contract details for each contract
- **FR-24:** Dashboard must show contract metadata (vendor, type, dates)
- **FR-25:** Users must be able to mark contracts as reviewed
- **FR-26:** Users must be able to delete contracts from the system

### 5.5 Contract Details & Review

- **FR-27:** Contract details page must display:
  - Contract overview with metadata
  - AI-generated summary
  - Extracted key fields in structured format
  - Risk indicators with descriptions
  - Embedded PDF viewer
  - AI chat interface
- **FR-28:** Contract details page must show extraction timestamp
- **FR-29:** Users must be able to print contract summary
- **FR-30:** Users must be able to download contract metadata as structured data

### 5.6 AI Chat & Q&A

- **FR-31:** Users must be able to ask questions about a specific contract
- **FR-32:** AI must provide contextual answers based on contract content
- **FR-33:** Chat history must be stored and retrievable for auditing
- **FR-34:** Users must be able to clear chat history for a contract
- **FR-35:** Chat interface must display conversation history with timestamps

### 5.7 Settings

- **FR-36:** Settings page must allow users to manage Gmail connection
- **FR-37:** Users must be able to disconnect their Gmail account
- **FR-38:** Users must be able to reconnect their Gmail account without losing existing contracts
- **FR-39:** Settings must display connection status and last sync date

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-1:** Dashboard must load in under 2 seconds
- **NFR-2:** Contract details page must load in under 3 seconds
- **NFR-3:** AI summary generation must complete within 30 seconds of contract import
- **NFR-4:** Chat responses must be delivered within 10 seconds
- **NFR-5:** Inbox sync must process 50 contracts without timeout
- **NFR-6:** API response times must be under 500ms for 95th percentile

### 6.2 Scalability

- **NFR-7:** System must support up to 10,000 contracts per user
- **NFR-8:** System must handle concurrent requests from 100+ users
- **NFR-9:** Database queries must complete within 1 second for typical contract operations
- **NFR-10:** API must be horizontally scalable via containerization

### 6.3 Security

- **NFR-11:** All API endpoints must require authentication via JWT tokens
- **NFR-12:** Passwords must be hashed using bcrypt or equivalent
- **NFR-13:** OAuth tokens must be encrypted at rest
- **NFR-14:** HTTPS/TLS must be enforced on all connections
- **NFR-15:** API rate limiting must be implemented (100 requests/minute per user)
- **NFR-16:** SQL injection, XSS, and CSRF vulnerabilities must be prevented
- **NFR-17:** Personal data access must be restricted to authenticated users' own data
- **NFR-18:** Audit logs must track all contract access and modifications

### 6.4 Reliability & Availability

- **NFR-19:** System uptime target of 99.5%
- **NFR-20:** Failed contract imports must not crash the application
- **NFR-21:** Failed AI processing must result in graceful degradation (display raw text)
- **NFR-22:** Database connection failures must be handled with retry logic
- **NFR-23:** Error handling must provide meaningful error messages to users

### 6.5 Usability

- **NFR-24:** UI must be responsive and work on mobile, tablet, and desktop
- **NFR-25:** User onboarding must be completable in under 3 minutes
- **NFR-26:** All features must be discoverable without training
- **NFR-27:** Error messages must be clear and actionable

### 6.6 Compliance & Data Privacy

- **NFR-28:** Application must comply with GDPR data handling requirements
- **NFR-29:** Users must be able to request data export
- **NFR-30:** Users must be able to request account deletion
- **NFR-31:** Data retention policies must be documented and configurable

---

## 7. User Flow

### Primary User Journey

```
1. Login
   └─ User provides email and password
   └─ Authentication token issued
   └─ Redirect to Dashboard

2. Dashboard (First Time)
   └─ Welcome message
   └─ Gmail connection status: "Not Connected"
   └─ "Connect Gmail" button visible
   └─ KPI cards show 0 contracts

3. Connect Gmail
   └─ User clicks "Connect Gmail"
   └─ OAuth flow begins
   └─ User authorizes app access
   └─ Dashboard updates: "Gmail Connected"
   └─ "Sync Inbox" button enabled

4. Sync Inbox
   └─ User clicks "Sync Inbox"
   └─ Spring Boot calls Gmail API
   └─ Retrieves unread emails with PDF attachments
   └─ Sends PDFs to FastAPI
   └─ FastAPI processes contracts (summarization, extraction)
   └─ Data stored in PostgreSQL
   └─ Dashboard refreshes with new contracts

5. Dashboard (After Sync)
   └─ KPI cards updated with contract counts
   └─ Recent Contracts table populated
   └─ User reviews contract list
   └─ User clicks "Review" on a contract

6. Contract Details
   └─ Contract overview displayed
   └─ AI summary shown
   └─ Extracted fields visible
   └─ PDF viewer displays document
   └─ User reads information

7. AI Chat
   └─ User types question about contract
   └─ AI responds with answer based on contract content
   └─ Chat history maintained

8. Return to Dashboard
   └─ User reviews other contracts
   └─ User marks contracts as reviewed
   └─ User tracks pending items

```

---

## 8. MVP Scope

### Included in MVP

✅ User authentication (email/password)  
✅ Gmail OAuth integration  
✅ Contract email inbox synchronization  
✅ PDF attachment extraction  
✅ AI contract summarization  
✅ Key field extraction  
✅ Risk analysis and flagging  
✅ Centralized contract dashboard  
✅ Contract details view with PDF viewer  
✅ AI chat for contract Q&A  
✅ Basic settings management  
✅ Chat history storage  

### Explicitly Excluded from MVP

❌ Multi-user team collaboration  
❌ Role-based access control (RBAC)  
❌ Contract approval workflows  
❌ Notifications and alerts  
❌ Advanced analytics and reporting  
❌ Contract comparison tools  
❌ Outlook integration  
❌ Automatic inbox monitoring (user-triggered sync only)  
❌ AI email reply suggestions  
❌ Vendor management system  
❌ Advanced search and filtering  
❌ Bulk operations  
❌ Contract tagging and categorization  

---

## 9. Future Scope

### Phase 2: Collaboration & Workflows

- **Team Management:** Support multiple users per organization
- **Role-Based Access:** Differentiate permissions (viewer, reviewer, admin)
- **Approval Workflows:** Define approval chains for contract review
- **Comments & Annotations:** Add collaborative review capabilities
- **Assignments:** Assign contracts to team members

### Phase 3: Intelligence & Analytics

- **Advanced Analytics:** Dashboard with contract portfolio insights
- **Predictive Analytics:** Identify upcoming renewals and risks
- **Contract Comparison:** Compare terms across similar contracts
- **Spend Analysis:** Financial metrics and vendor spend tracking
- **Compliance Reporting:** Automated compliance checks

### Phase 4: Enterprise Features

- **Notifications:** Email alerts for renewals, high-risk contracts, pending actions
- **Outlook Integration:** Support for Microsoft Exchange/Outlook
- **Automatic Monitoring:** Background inbox monitoring without manual sync
- **Advanced Search:** Full-text search across all contracts
- **Contract Templates:** Standardized templates for common contract types
- **Vendor Management:** Vendor profile and performance tracking
- **Integration Marketplace:** Connect with Salesforce, Ariba, etc.

---

## 10. Success Metrics

### User Engagement

- **Metric:** Monthly Active Users (MAU)
- **Target:** 80% of registered users active per month (MVP)

- **Metric:** Contracts Processed
- **Target:** Average 25 contracts/user/month

- **Metric:** Feature Adoption
- **Target:** 90% of users use AI chat feature

### Business Impact

- **Metric:** Time Saved Per Contract
- **Target:** Reduce contract review time from 45 minutes to 10 minutes (78% reduction)

- **Metric:** Contract Accuracy
- **Target:** 95% accuracy in AI-extracted key fields (vs. manual extraction)

- **Metric:** Missed Renewal Rate
- **Target:** Reduce missed renewal deadlines by 95%

### Technical Metrics

- **Metric:** System Availability
- **Target:** 99.5% uptime

- **Metric:** API Response Time
- **Target:** 95th percentile under 500ms

- **Metric:** AI Processing Time
- **Target:** Summary generation within 30 seconds

- **Metric:** User Satisfaction
- **Target:** NPS score of 50+

---

## 11. Risks & Assumptions

### Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Gmail API rate limiting | Sync failures for large contracts | Medium | Implement queueing, batch processing |
| AI accuracy issues | Low-quality summaries mislead users | Medium | Human review, feedback loop, logging |
| PDF parsing failures | Contracts cannot be processed | Medium | Fallback to raw text, manual upload option |
| Data privacy concerns | Regulatory compliance issues | Low | Encrypt tokens, GDPR compliance, data isolation |
| Competitor offerings | Market saturation | Low | Differentiate with speed, UX, integration depth |
| Token refresh failures | Users become disconnected | Low | Robust token management, automatic refresh |

### Assumptions

- Users have active Gmail accounts and permission to authorize third-party access
- Gmail's API remains available and rate limits allow for MVP volume
- PDFs contain extractable text (not scanned images without OCR)
- Users are willing to connect personal email accounts
- Contract format is relatively standardized (text-based PDFs)
- Users have modern browsers with JavaScript support
- Organization has PostgreSQL database available for deployment

---

## 12. Acceptance Criteria

### Authentication Module

- [ ] Users can register with email and password
- [ ] Users can log in and receive valid JWT token
- [ ] Invalid credentials are rejected
- [ ] Passwords are securely hashed

### Gmail Integration

- [ ] Users can connect Gmail via OAuth without sharing password
- [ ] Application retrieves email list from Gmail API
- [ ] Application identifies and downloads PDF attachments
- [ ] Gmail connection status displays correctly
- [ ] Users can disconnect and reconnect Gmail

### Contract Processing

- [ ] PDFs are extracted and converted to text
- [ ] AI generates summaries within 30 seconds
- [ ] Key fields are extracted correctly
- [ ] Risk analysis identifies high-risk clauses
- [ ] Processed contracts display on dashboard

### Dashboard

- [ ] KPI cards display correct contract counts
- [ ] Recent contracts table is sortable and filterable
- [ ] Connection status displays accurately
- [ ] Sync Inbox button triggers contract processing

### Contract Details

- [ ] All extracted fields display correctly
- [ ] AI summary is readable and accurate
- [ ] PDF viewer displays contract
- [ ] Risk indicators are visible and clear

### AI Chat

- [ ] Users can ask questions about contracts
- [ ] AI provides relevant answers
- [ ] Chat history is saved and retrievable
- [ ] Conversation is contextual to selected contract

---

## Appendix: Data Dictionary

### Contract Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique contract identifier |
| userId | UUID | Foreign key to User |
| vendorName | String | Supplier/vendor name |
| contractType | String | Type of contract (e.g., Service Agreement, NDA) |
| startDate | Date | Contract effective date |
| endDate | Date | Contract expiration date |
| paymentTerms | String | Payment terms (Net 30, etc.) |
| summary | Text | AI-generated summary |
| risks | JSON Array | Identified risks with severity |
| extractedFields | JSON Object | All extracted key fields |
| rawText | Text | Full PDF text content |
| emailFrom | String | Sender's email address |
| emailSubject | String | Original email subject |
| receivedDate | DateTime | Date contract was received |
| importedDate | DateTime | Date contract was imported |
| reviewedDate | DateTime | Date contract was marked reviewed |
| pdfUrl | String | URL to stored PDF file |
| status | Enum | pending_review, reviewed, archived |
| createdAt | DateTime | Record creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Chat History Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique message identifier |
| contractId | UUID | Foreign key to Contract |
| userId | UUID | Foreign key to User |
| userMessage | Text | User's question |
| aiResponse | Text | AI's answer |
| timestamp | DateTime | When message was sent |

---

**Document Version Control:**
- Version 1.0 - Initial PRD for MVP Definition
- Created: July 2026
