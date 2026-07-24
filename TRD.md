# Technical Requirements Document (TRD)
## Procure AI: System Architecture & Implementation Guide

**Version:** 1.0  
**Date:** July 2026  
**Status:** MVP Technical Specification  

---

## 1. System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
│  Next.js Frontend (TypeScript, React, Tailwind CSS, shadcn/ui)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY / BACKEND                          │
│         Spring Boot (Java, REST API, Authentication)            │
│  ├─ Authentication Service                                      │
│  ├─ Gmail Integration Service                                   │
│  ├─ Contract Management Service                                 │
│  └─ Orchestration & Data Routing                                │
└──────────────────────┬──────────────────────────────────────────┘
         │                              │
         │                              │
    ┌────▼──────┐              ┌───────▼────────┐
    │   Gmail   │              │  FastAPI      │
    │   API     │              │  AI Service   │
    │           │              │               │
    └────┬──────┘              │  • PDF Text   │
         │                     │  • Summarize  │
         └────────┐            │  • Extract    │
                  │            │  • Risk Flag  │
                  ▼            │  • Q&A        │
         ┌────────────────┐    └───────┬────────┘
         │   PostgreSQL   │            │
         │   Database     │            │
         │                │            │
         │ ├─ Users       │            │
         │ ├─ Contracts   │            │
         │ ├─ ChatHistory │◄───────────┘
         │ └─ Metadata    │
         └────────────────┘
```

### Component Interactions

1. **Frontend (Next.js)** → User interface for login, dashboard, contract review
2. **Backend (Spring Boot)** → Core business logic, orchestration, API gateway
3. **Gmail API** → Email integration, contract retrieval
4. **AI Service (FastAPI)** → Document processing and intelligence
5. **Database (PostgreSQL)** → Persistent data storage

---

## 2. Technology Stack

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 14.x | React framework with SSR |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Components | shadcn/ui | Latest | Pre-built accessible components |
| State Management | React Query (TanStack Query) | 5.x | Server state management |
| Charts | Recharts | 2.x | Data visualization |
| HTTP Client | fetch API / Axios | - | API communication |
| Authentication | JWT | - | Token-based auth |

### Backend (Spring Boot)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Spring Boot | 3.x | Java application framework |
| Java Version | OpenJDK | 17+ | Programming language |
| Web | Spring Web MVC | 3.x | REST API framework |
| Security | Spring Security | 6.x | Authentication & authorization |
| Database | Spring Data JPA | 3.x | ORM and data access |
| Validation | Hibernate Validator | 8.x | Input validation |
| Logging | SLF4J / Logback | Latest | Application logging |
| Build Tool | Maven / Gradle | Latest | Project build management |
| HTTP Client | RestTemplate / WebClient | - | External API calls |

### AI Service (Python FastAPI)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.104+ | Python async web framework |
| Language | Python | 3.10+ | Programming language |
| PDF Processing | PyPDF2 / pdfplumber | Latest | PDF text extraction |
| LLM Integration | OpenAI API / LangChain | Latest | AI model access |
| Data Validation | Pydantic | 2.x | Request/response validation |
| Async | asyncio | Built-in | Async task handling |
| CORS | fastapi-cors | Latest | Cross-origin support |
| Logging | Python logging | Built-in | Application logging |
| Task Queue | Celery (optional) | 5.x | Background processing |

### Database

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Database | PostgreSQL | 14+ | Relational database |
| Migrations | Flyway / Liquibase | Latest | Schema versioning |
| Connection Pooling | HikariCP | Latest | Database connection management |

### Infrastructure & Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Container images for services |
| Orchestration | Docker Compose (Dev) / Kubernetes (Prod) | Service orchestration |
| API Documentation | Swagger/OpenAPI 3.0 | API specification |
| Version Control | Git | Code repository |
| CI/CD | GitHub Actions / GitLab CI | Automated testing & deployment |

---

## 3. Project Folder Structure

### Repository Layout

```
procure-ai/
├── frontend/                      # Next.js React application
│   ├── app/                       # App router (Next.js 13+)
│   │   ├── (auth)/               # Auth pages group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Dashboard pages group
│   │   │   ├── dashboard/
│   │   │   ├── contracts/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/               # Reusable components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── contracts/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── shared/
│   ├── lib/                      # Utility functions
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth utilities
│   │   ├── hooks.ts              # Custom hooks
│   │   └── utils.ts              # General utilities
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useContracts.ts
│   │   └── useChat.ts
│   ├── types/                    # TypeScript types
│   │   ├── api.ts
│   │   ├── contracts.ts
│   │   └── user.ts
│   ├── styles/                   # Global styles
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                      # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/procureai/
│   │   │   │       ├── config/             # Configuration classes
│   │   │   │       │   ├── JwtConfig.java
│   │   │   │       │   ├── SecurityConfig.java
│   │   │   │       │   └── CorsConfig.java
│   │   │   │       ├── controller/        # REST controllers
│   │   │   │       │   ├── AuthController.java
│   │   │   │       │   ├── ContractController.java
│   │   │   │       │   ├── GmailController.java
│   │   │   │       │   └── ChatController.java
│   │   │   │       ├── service/           # Business logic
│   │   │   │       │   ├── AuthService.java
│   │   │   │       │   ├── ContractService.java
│   │   │   │       │   ├── GmailService.java
│   │   │   │       │   ├── ChatService.java
│   │   │   │       │   └── AiIntegrationService.java
│   │   │   │       ├── repository/        # Data access
│   │   │   │       │   ├── UserRepository.java
│   │   │   │       │   ├── ContractRepository.java
│   │   │   │       │   └── ChatHistoryRepository.java
│   │   │   │       ├── entity/            # JPA entities
│   │   │   │       │   ├── User.java
│   │   │   │       │   ├── Contract.java
│   │   │   │       │   └── ChatHistory.java
│   │   │   │       ├── dto/               # Data transfer objects
│   │   │   │       │   ├── UserDTO.java
│   │   │   │       │   ├── ContractDTO.java
│   │   │   │       │   └── ChatDTO.java
│   │   │   │       ├── exception/         # Custom exceptions
│   │   │   │       ├── security/          # Security utilities
│   │   │   │       ├── util/              # Utility classes
│   │   │   │       └── ProcureAiApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml        # Main config
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/migration/          # Flyway migrations
│   │   │           ├── V1__Initial_schema.sql
│   │   │           └── V2__Add_constraints.sql
│   │   └── test/                # Test files
│   │       └── java/...
│   ├── pom.xml                  # Maven configuration
│   └── Dockerfile
│
├── ai-service/                  # FastAPI AI service
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # Health check endpoint
│   │   │   ├── contracts.py     # Contract processing routes
│   │   │   └── chat.py          # Q&A routes
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── pdf_extractor.py # PDF text extraction
│   │   │   ├── summarizer.py    # Contract summarization
│   │   │   ├── extractor.py     # Field extraction
│   │   │   ├── risk_analyzer.py # Risk detection
│   │   │   └── qa_engine.py     # Q&A processing
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── request.py       # Request models
│   │   │   └── response.py      # Response models
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── logger.py
│   │   │   └── openai_client.py # LLM integration
│   │   └── schemas/
│   │       └── __init__.py
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml           # Local development
├── docker-compose.prod.yml      # Production
├── .gitignore
├── README.md
└── docs/                        # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## 4. API Design & Specifications

### Authentication Endpoints

#### POST /api/auth/register
Register new user account

```json
Request:
{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "token": "jwt_token"
}
```

#### POST /api/auth/login
User login

```json
Request:
{
  "email": "user@example.com",
  "password": "password"
}

Response (200):
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

### Gmail Integration Endpoints

#### POST /api/gmail/authorize
Initiate OAuth flow

```json
Response (200):
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/auth?..."
}
```

#### POST /api/gmail/callback
Handle OAuth callback

```json
Request:
{
  "code": "auth_code_from_google"
}

Response (200):
{
  "status": "connected",
  "email": "user@gmail.com"
}
```

#### GET /api/gmail/status
Get Gmail connection status

```json
Response (200):
{
  "connected": true,
  "email": "user@gmail.com",
  "connectedAt": "2026-07-15T10:30:00Z",
  "lastSyncAt": "2026-07-21T14:22:00Z"
}
```

#### POST /api/gmail/sync
Trigger inbox synchronization

```json
Request: {}

Response (202):
{
  "status": "syncing",
  "taskId": "sync_task_uuid"
}
```

#### GET /api/gmail/sync/{taskId}
Check sync status

```json
Response (200):
{
  "status": "completed",
  "contractsImported": 5,
  "contractsProcessing": 2,
  "failedContracts": 0
}
```

#### POST /api/gmail/disconnect
Disconnect Gmail account

```json
Response (200):
{
  "status": "disconnected"
}
```

### Contract Management Endpoints

#### GET /api/contracts
List user's contracts (paginated)

```json
Request:
GET /api/contracts?page=1&limit=20&status=pending_review

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "vendorName": "Acme Corp",
      "contractType": "Service Agreement",
      "startDate": "2026-01-01",
      "endDate": "2027-01-01",
      "status": "pending_review",
      "riskLevel": "HIGH",
      "importedAt": "2026-07-21T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### GET /api/contracts/{contractId}
Get contract details

```json
Response (200):
{
  "id": "uuid",
  "vendorName": "Acme Corp",
  "contractType": "Service Agreement",
  "startDate": "2026-01-01",
  "endDate": "2027-01-01",
  "paymentTerms": "Net 30",
  "keyObligations": ["Maintain uptime 99.5%", "..."],
  "summary": "This is a 1-year service agreement...",
  "risks": [
    {
      "id": "risk_1",
      "description": "Auto-renewal clause without notice",
      "severity": "HIGH",
      "location": "Section 4.2"
    }
  ],
  "extractedFields": {...},
  "pdfUrl": "/api/contracts/{contractId}/pdf",
  "status": "pending_review",
  "reviewedAt": null
}
```

#### GET /api/contracts/{contractId}/pdf
Download contract PDF

```json
Response (200):
[Binary PDF file]
```

#### PATCH /api/contracts/{contractId}
Update contract status

```json
Request:
{
  "status": "reviewed"
}

Response (200):
{
  "id": "uuid",
  "status": "reviewed",
  "reviewedAt": "2026-07-21T14:30:00Z"
}
```

#### DELETE /api/contracts/{contractId}
Delete contract

```json
Response (204): [No content]
```

### Dashboard Endpoints

#### GET /api/dashboard/summary
Get dashboard KPIs

```json
Response (200):
{
  "totalContracts": 45,
  "pendingReview": 12,
  "highRisk": 3,
  "expiringWithin30Days": 5,
  "lastSyncAt": "2026-07-21T14:22:00Z"
}
```

### Chat Endpoints

#### POST /api/contracts/{contractId}/chat
Send chat message

```json
Request:
{
  "message": "What are the payment terms?"
}

Response (200):
{
  "id": "msg_uuid",
  "userMessage": "What are the payment terms?",
  "aiResponse": "According to Section 5.1, payment terms are Net 30...",
  "timestamp": "2026-07-21T14:35:00Z"
}
```

#### GET /api/contracts/{contractId}/chat
Get chat history

```json
Response (200):
{
  "messages": [
    {
      "id": "msg_1",
      "userMessage": "What are the payment terms?",
      "aiResponse": "According to Section 5.1...",
      "timestamp": "2026-07-21T14:35:00Z"
    }
  ]
}
```

#### DELETE /api/contracts/{contractId}/chat
Clear chat history

```json
Response (204): [No content]
```

---

## 5. Database Schema


### PostgreSQL Tables

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gmail_account_email VARCHAR(255),
  gmail_token_encrypted TEXT,
  gmail_token_refresh_encrypted TEXT,
  gmail_connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_gmail_connected (gmail_connected_at)
);
```

#### Contracts Table

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  payment_terms VARCHAR(255),
  summary TEXT,
  extracted_fields JSONB,
  risks JSONB,
  raw_text TEXT,
  email_from VARCHAR(255),
  email_subject VARCHAR(500),
  received_date TIMESTAMP,
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  pdf_storage_path VARCHAR(500),
  pdf_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date),
  INDEX idx_created_at (created_at)
);
```

#### Chat History Table

```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contract_id (contract_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

#### Audit Log Table (Optional)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## 6. Authentication & Security Flow

### JWT Authentication Flow

```
1. User Registration/Login
   └─ Credentials → Spring Boot AuthController
   └─ Password verified against bcrypt hash
   └─ JWT token generated with user ID + email
   └─ Token returned to frontend
   └─ Frontend stores token in secure HTTP-only cookie

2. Authenticated Requests
   └─ Frontend includes JWT in Authorization header
   └─ Spring Security intercepts request
   └─ JWT validated (signature, expiration, user)
   └─ User context set in SecurityContextHolder
   └─ Request proceeds to controller

3. Token Refresh (if needed)
   └─ Frontend detects 401 response
   └─ Refresh endpoint called with refresh token
   └─ New access token issued
   └─ Request retried with new token
```

### OAuth 2.0 Gmail Integration Flow

```
1. User Initiates Connection
   └─ Clicks "Connect Gmail" button
   └─ Frontend redirects to /api/gmail/authorize

2. Authorization Request
   └─ Spring Boot constructs OAuth URL
   └─ Frontend redirected to Google OAuth consent screen
   └─ User grants permission to read emails

3. OAuth Callback
   └─ Google redirects to /api/gmail/callback with authorization code
   └─ Spring Boot exchanges code for access token
   └─ Access token + refresh token encrypted and stored
   └─ Frontend redirected to dashboard

4. Token Management
   └─ Access token cached in memory with expiration
   └─ When token expires, refresh token used to obtain new access token
   └─ Failed refresh prompts user to reconnect Gmail

5. Gmail API Calls
   └─ Spring Boot calls Gmail API using stored access token
   └─ Retrieves message list, attachments, etc.
   └─ Processes attachments asynchronously
```

### Password Security

- Passwords hashed with bcrypt (Spring Security default)
- Minimum 12 characters recommended
- Salted and iterated for security

### Token Encryption

- OAuth tokens encrypted at rest using AES-256
- Encryption key stored in environment variables
- Decrypted only when needed for API calls

---

## 7. Gmail Integration Flow

### Email Sync Process

```
Trigger (Manual Sync Button)
        ↓
Spring Boot GmailController receives sync request
        ↓
GmailService retrieves stored OAuth token
        ↓
Gmail API called: List unread emails from primary inbox
        ↓
Filter emails with PDF attachments
        ↓
For each attachment:
  ├─ Download PDF file
  ├─ Store PDF temporarily
  ├─ Send to FastAPI for processing
  └─ Delete temporary file
        ↓
FastAPI processes all PDFs:
  ├─ Extract text from PDF
  ├─ Generate summary
  ├─ Extract key fields
  ├─ Analyze risks
  └─ Return structured data
        ↓
Spring Boot stores processed contracts in PostgreSQL
        ↓
Mark emails as read in Gmail
        ↓
Dashboard refreshes with new contracts
        ↓
Sync complete
```

### Error Handling in Sync

```
If Gmail API fails:
  └─ Retry up to 3 times with exponential backoff
  └─ Log error and notify user

If PDF extraction fails:
  └─ Store raw PDF text
  └─ Mark contract with "raw_text_only" flag
  └─ Continue processing next contract

If AI processing fails:
  └─ Retry with shorter timeout
  └─ Store partial results if available
  └─ Flag for manual review
```

---

## 8. AI Service Communication

### Contract Processing Flow

```
Spring Boot → FastAPI:

POST /api/process-contract
{
  "contractId": "uuid",
  "pdfText": "full contract text from PDF...",
  "vendorEmail": "supplier@company.com",
  "emailSubject": "Service Agreement Proposal"
}

FastAPI Processing:
├─ Summarize contract (ChatGPT)
├─ Extract fields (structured extraction)
├─ Analyze risks (pattern matching + LLM)
└─ Return structured response

FastAPI → Spring Boot Response:
{
  "summary": "This is a 1-year service agreement...",
  "extractedFields": {
    "vendorName": "Acme Corp",
    "contractType": "Service Agreement",
    "startDate": "2026-01-01",
    "endDate": "2027-01-01",
    "paymentTerms": "Net 30",
    "keyObligations": [...],
    "notableRestrictions": [...]
  },
  "risks": [
    {
      "description": "Auto-renewal without notice",
      "severity": "HIGH",
      "location": "Section 4.2",
      "recommendation": "Negotiate 90-day notice period"
    }
  ],
  "processingTime": 25.3
}

Spring Boot stores response in PostgreSQL
```

### Chat Q&A Flow

```
Frontend → Spring Boot:

POST /api/contracts/{contractId}/chat
{
  "message": "What are the payment terms?"
}

Spring Boot:
├─ Retrieve contract data
├─ Prepare context with contract text + metadata
└─ Call FastAPI

Spring Boot → FastAPI:

POST /api/answer-question
{
  "question": "What are the payment terms?",
  "contractText": "full contract text...",
  "contractMetadata": {...}
}

FastAPI:
├─ Use LLM to answer question based on context
├─ Ensure answer references contract sections
└─ Return answer with confidence level

FastAPI → Spring Boot Response:
{
  "answer": "According to Section 5.1, payment terms are Net 30...",
  "confidence": 0.95,
  "sourceSection": "Section 5.1"
}

Spring Boot:
├─ Store chat message in database
└─ Return response to frontend
```

---

## 9. Sequence Diagrams

### Login Sequence

```
User           Frontend           Spring Boot        Database
 │              │                    │                 │
 ├─Email/Pwd───>│                    │                 │
 │              ├──POST /auth/login─>│                 │
 │              │                    ├─Query User─────>│
 │              │                    │<─User found────│
 │              │                    ├─Verify Password│
 │              │                    ├─Generate JWT──>│
 │              │<──200 + JWT Token──│                 │
 │              ├─Store JWT (cookie) │                 │
 │<─Dashboard──┤                    │                 │
```

### Contract Sync Sequence

```
User           Frontend        Spring Boot      Gmail API       FastAPI       Database
 │              │                │                 │               │            │
 ├─Sync Inbox──>│                │                 │               │            │
 │              ├──POST /sync───>│                 │               │            │
 │              │                ├─Get Token──────>│               │            │
 │              │                │<─Emails────────│               │            │
 │              │                ├─Extract PDFs──>│               │            │
 │              │                ├─Download PDFs──>│               │            │
 │              │                │<─PDF Content───│               │            │
 │              │                ├─Process Contracts──────────────>│            │
 │              │                │                 │               ├─Extract──>│
 │              │                │                 │               ├─Summarize│
 │              │                │                 │               ├─Analyze──>│
 │              │                │<─Structured Data──────────────│            │
 │              │                ├─Store Results─────────────────────────────>│
 │              │<─202 Accepted──│                 │               │            │
 │              │                │                 │               │            │
 │<─Dashboard ──┤                │                 │               │            │
 │   (refresh)  │                │                 │               │            │
```

### Contract Review Sequence

```
User           Frontend        Spring Boot       Database
 │              │                │                │
 ├─Open────────>│                │                │
 │ Contract     │                │                │
 │              ├──GET /contracts/{id}──────────>│
 │              │                │<─Contract────│
 │              │<─Contract Details─────────────│
 │              ├─Display Summary, Fields, PDF  │
 │              │                │                │
 │ ├─Ask────────>│                │                │
 │ │ Question   ├──POST /chat───>│                │
 │ │            │                ├─Get Contract─>│
 │ │            │                │<─Contract────│
 │ │            │                ├─Call FastAPI │
 │ │            │                ├─Store Chat──>│
 │ │            │<─AI Response───│                │
 │ │<─Answer────┤                │                │
 │ │            │                │                │
```

---

## 10. Security Considerations

### Authentication & Authorization

- JWT tokens expire after 1 hour (configurable)
- Refresh tokens expire after 7 days
- Tokens stored in HTTP-only secure cookies
- CSRF tokens required for state-changing operations
- Rate limiting: 100 requests/minute per user

### Data Protection

- OAuth tokens encrypted at rest using AES-256
- Database connections use SSL/TLS
- All API communication over HTTPS
- Passwords hashed with bcrypt (10+ rounds)
- Personal data isolated per user (no cross-user access)

### API Security

- All endpoints require authentication (except /auth/login, /auth/register)
- SQL injection prevented via parameterized queries (JPA)
- XSS prevented via React escaping + CSP headers
- CORS configured to allow only specified origins
- API versioning for backward compatibility

### Gmail Integration Security

- OAuth scopes limited to read-only (readonly.mail)
- Tokens refreshed automatically before expiration
- Failed token refresh prompts user to reconnect
- Token revocation supported for disconnect
- No email address stored in logs or analytics

### Audit & Monitoring

- All contract access logged with user ID, timestamp, action
- Failed login attempts logged (IP, email)
- Failed API calls logged with error details
- PDF downloads tracked for compliance
- Logs retained for 90 days (configurable)

---

## 11. Deployment Architecture

### Development Environment (Local)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: procure_ai_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/procure_ai_dev
      GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID}
      GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET}
      JWT_SECRET: dev_secret
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  ai-service:
    build: ./ai-service
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      BACKEND_URL: http://backend:8080
    ports:
      - "8000:8000"

  frontend:
    image: node:18
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: npm run dev
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Production Environment (Cloud)

```
Architecture: Kubernetes (EKS / GKE / AKS)

┌─────────────────────────────────┐
│     Application Load Balancer   │
│      (SSL/TLS Termination)      │
└──────────────┬──────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Frontend│ │Backend │ │Backend │  (Scaled Replicas)
│   Pod  │ │  Pod 1 │ │  Pod 2 │
└────────┘ └────────┘ └────────┘
    │          │          │
    └──────────┼──────────┘
               │
        ┌──────┴───────┐
        │              │
    ┌───▼──┐     ┌────▼────┐
    │ AI   │     │PostgreSQL│
    │Service│     │ (RDS)   │
    └──────┘     └─────────┘
```

### Deployment Pipeline

```
Code Push → GitHub
     ↓
GitHub Actions CI/CD Pipeline
     ├─ Lint & Format Check
     ├─ Unit Tests
     ├─ Integration Tests
     ├─ Build Docker Images
     ├─ Push to Container Registry
     └─ Deploy to Kubernetes
            ↓
      Rolling Update (Zero Downtime)
```

### Environment Variables

```bash
# .env (Backend)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/procure_ai
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false

GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback

JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRATION_HOURS=1
JWT_REFRESH_EXPIRATION_DAYS=7

AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=ai_service_key

ENCRYPTION_KEY=your_encryption_key_32_chars

# .env (AI Service)
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:8080
LOG_LEVEL=INFO

# .env (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Procure AI
```

---

## 12. Future Scalability

### Phase 2: Multi-Tenancy

```
├─ Tenant Isolation: Logical or physical
├─ Tenant-specific databases or schemas
├─ Billing & metering per tenant
└─ Customizable dashboards & workflows
```

### Phase 3: Microservices Evolution

```
Current Monolith (Spring Boot)
     ↓
Microservices:
├─ Auth Service (Spring Boot)
├─ Contract Service (Spring Boot)
├─ Gmail Service (Spring Boot)
├─ Chat Service (Spring Boot)
├─ AI Service (FastAPI)
└─ Notification Service (Python/Node)

Message Queue: RabbitMQ / Apache Kafka
Service Discovery: Consul / Kubernetes DNS
API Gateway: Kong / Spring Cloud Gateway
```

### Phase 4: Analytics & Advanced Features

```
├─ Data Warehouse (BigQuery / Redshift)
├─ Analytics Platform (Tableau / Looker)
├─ Machine Learning Pipeline
│  ├─ Risk scoring model
│  ├─ Vendor reputation scoring
│  └─ Anomaly detection
└─ Real-time Dashboards
```

---

## 13. Monitoring & Observability

### Metrics

- Application: Prometheus + Grafana
- Logs: ELK Stack / CloudWatch
- Traces: Jaeger / DataDog APM
- Uptime: Status page with Pingdom

### Key Metrics to Track

- API response time (p50, p95, p99)
- Error rate by endpoint
- Gmail API rate limit usage
- AI processing time distribution
- Database query performance
- Cache hit rates

---

**Document Version Control:**
- Version 1.0 - Initial TRD for MVP
- Created: July 2026
