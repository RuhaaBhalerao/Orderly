# Procure AI

## AI-Powered Contract Intelligence Platform

An enterprise application that automates the contract intake and review process by connecting directly to Gmail, importing supplier contracts, extracting critical information using AI, and presenting everything in a centralized, intelligent dashboard.

**Status:** MVP (Minimum Viable Product)  
**Last Updated:** July 2026

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Procurement teams receive supplier contracts via email daily but the current workflow is manual and repetitive:

1. Supplier sends contract via email
2. Manager downloads PDF to local storage
3. File is manually organized
4. PDF is uploaded into separate system
5. Manager reads dozens of pages searching for critical info
6. Key details extracted manually and recorded
7. Decisions made with incomplete or delayed information

**Result:** Missed renewal dates, overlooked risks, time wasted on manual work, and poor visibility into contract portfolio.

**Procure AI solves this** by automatically processing incoming contracts and presenting actionable intelligence instantly.

---

## Solution

Instead of acting as another document upload tool, Procure AI acts as an **intelligent contract inbox**.

### User Workflow

```
1. Connect Gmail
   ↓
2. Click Sync Inbox
   ↓
3. Spring Boot retrieves contract emails
   ↓
4. AI extracts intelligence from PDFs
   ↓
5. Data stored in PostgreSQL
   ↓
6. Dashboard updates automatically
   ↓
7. Review contracts and ask AI questions
```

**Key Benefit:** No manual downloads. No manual uploads. No reading entire documents. Just intelligent, actionable contract data.

---

## Features

### ✅ Implemented (MVP)

- **User Authentication**
  - Email/password registration and login
  - Secure JWT token management
  - Password hashing with bcrypt

- **Gmail Integration**
  - OAuth 2.0 connection (read-only scope)
  - Automatic contract email detection
  - PDF attachment extraction
  - One-click inbox sync

- **AI-Powered Contract Intelligence**
  - PDF text extraction
  - AI-generated summaries (200-300 words)
  - Key field extraction:
    - Vendor name, contract type
    - Dates (start, end, renewal)
    - Payment terms
    - Key obligations
    - Restrictions
  - Risk identification and flagging
  - Risk severity levels (Low, Medium, High)

- **Centralized Dashboard**
  - Gmail connection status
  - KPI cards:
    - Total contracts imported
    - Pending review count
    - High-risk contracts
    - Contracts expiring soon (30 days)
  - Recent contracts table
  - One-click contract access

- **Contract Details Page**
  - Contract overview with metadata
  - AI-generated summary
  - Extracted fields in structured format
  - Risk indicators with descriptions
  - Embedded PDF viewer
  - Contract metadata download

- **AI Chat for Q&A**
  - Ask questions about specific contracts
  - AI provides contextual answers
  - Chat history with timestamps
  - Clear chat history option

- **Settings**
  - Manage Gmail connection
  - Connect/disconnect Gmail
  - Connection status display

### 📋 Future Scope (Not in MVP)

- Team collaboration and multi-user management
- Role-based access control (RBAC)
- Contract approval workflows
- Notifications and alerts
- Advanced analytics and reporting
- Contract comparison tools
- Outlook integration
- Automatic background monitoring
- Vendor management system
- Advanced search and filtering
- API integrations (Salesforce, Ariba, etc.)

---

## Tech Stack

### Frontend

- **Framework:** Next.js 14+ (React, TypeScript)
- **Styling:** Tailwind CSS 3+
- **Components:** shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Charts:** Recharts
- **HTTP:** Fetch API / Axios
- **Authentication:** JWT (HTTP-only cookies)

### Backend

- **Framework:** Spring Boot 3.x (Java)
- **Language:** OpenJDK 17+
- **Web:** Spring Web MVC (REST APIs)
- **Security:** Spring Security 6.x
- **ORM:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL 14+
- **Build:** Maven or Gradle
- **Deployment:** Docker / Kubernetes

### AI Service

- **Framework:** FastAPI (Python)
- **Language:** Python 3.10+
- **PDF Processing:** PyPDF2 / pdfplumber
- **LLM Integration:** OpenAI API / LangChain
- **Async:** asyncio
- **Validation:** Pydantic 2.x

### Database

- **Primary:** PostgreSQL 14+
- **Schema Versioning:** Flyway / Liquibase
- **Connection Pooling:** HikariCP

### Infrastructure

- **Containerization:** Docker
- **Local Orchestration:** Docker Compose
- **Production:** Kubernetes (EKS/GKE/AKS)
- **CI/CD:** GitHub Actions / GitLab CI
- **API Docs:** Swagger/OpenAPI 3.0

---

## Architecture

### System Architecture

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

### Component Responsibilities

- **Next.js Frontend:** User interface, authentication, real-time dashboard
- **Spring Boot Backend:** Business logic, API orchestration, Gmail integration, security
- **FastAPI AI Service:** Document intelligence, PDF processing, LLM integration
- **PostgreSQL:** Persistent storage of users, contracts, chat history

---

## Installation

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Java 17+
- Python 3.10+
- PostgreSQL 14+ (if running locally without Docker)
- Gmail OAuth credentials (Google Cloud Console)
- OpenAI API key (for AI processing)

### Quick Start (Docker Compose)

```bash
# Clone repository
git clone https://github.com/yourusername/procure-ai.git
cd procure-ai

# Copy environment files
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
cp frontend/.env.local.example frontend/.env.local

# Update .env files with your credentials
# Edit backend/.env, ai-service/.env, frontend/.env.local

# Start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# AI Service: http://localhost:8000
# Database: localhost:5432
```

### Manual Installation

#### Backend (Spring Boot)

```bash
cd backend

# Build
./mvnw clean package

# Or with Gradle
./gradlew build

# Run
java -jar target/procure-ai-backend-1.0.0.jar

# Or using IDE
# Open in IntelliJ IDEA and Run → Run Application
```

#### AI Service (FastAPI)

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/procure_ai
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_db_password
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# Gmail OAuth
GMAIL_CLIENT_ID=your_gmail_client_id_from_google_console
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters_long
JWT_EXPIRATION_HOURS=1
JWT_REFRESH_EXPIRATION_DAYS=7

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_ai_service_key

# Encryption
ENCRYPTION_KEY=your_encryption_key_32_chars
```

### AI Service (.env)

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo

# Backend
BACKEND_URL=http://localhost:8080

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Procure AI

# Optional
NEXT_PUBLIC_GA_ID=google_analytics_id  # If using analytics
```

---

## Running the Project

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

### Option 2: Individual Services

```bash
# Terminal 1: Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: AI Service
cd ai-service
python -m uvicorn app.main:app --reload

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Verify Installation

```bash
# Backend health check
curl http://localhost:8080/api/health

# AI Service health check
curl http://localhost:8000/health

# Frontend
open http://localhost:3000
```

---

## Project Structure

```
procure-ai/
├── frontend/                      # Next.js React application
│   ├── app/                      # App router
│   │   ├── (auth)/               # Auth pages
│   │   └── (dashboard)/          # Dashboard pages
│   ├── components/               # Reusable components
│   ├── lib/                      # Utilities & hooks
│   ├── types/                    # TypeScript types
│   └── styles/                   # Global styles
│
├── backend/                      # Spring Boot application
│   ├── src/main/
│   │   ├── java/com/procureai/
│   │   │   ├── controller/       # REST endpoints
│   │   │   ├── service/          # Business logic
│   │   │   ├── repository/       # Data access
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── config/           # Configuration
│   │   │   └── security/         # Security utilities
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/     # Database migrations
│   └── pom.xml
│
├── ai-service/                   # FastAPI application
│   ├── app/
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── models/               # Pydantic models
│   │   └── main.py               # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # Local development
├── README.md                      # This file
├── PRD.md                         # Product requirements
├── TRD.md                         # Technical requirements
└── docs/                          # Additional documentation
```

---

## API Documentation

### Base URL

```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Gmail Endpoints

#### Connect Gmail

```bash
GET /gmail/authorize
```

#### Sync Inbox

```bash
POST /gmail/sync
Authorization: Bearer {jwt_token}
```

#### Gmail Status

```bash
GET /gmail/status
Authorization: Bearer {jwt_token}
```

### Contract Endpoints

#### List Contracts

```bash
GET /contracts?page=1&limit=20&status=pending_review
Authorization: Bearer {jwt_token}
```

#### Get Contract Details

```bash
GET /contracts/{contractId}
Authorization: Bearer {jwt_token}
```

#### Mark Contract as Reviewed

```bash
PATCH /contracts/{contractId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "reviewed"
}
```

### Chat Endpoints

#### Send Message

```bash
POST /contracts/{contractId}/chat
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "message": "What are the payment terms?"
}
```

#### Get Chat History

```bash
GET /contracts/{contractId}/chat
Authorization: Bearer {jwt_token}
```

### Dashboard Endpoints

#### Get Summary

```bash
GET /dashboard/summary
Authorization: Bearer {jwt_token}
```

**See TRD.md for complete API specification.**

---

## Usage Guide

### First Time Setup

1. **Register Account**
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Enter email, password, name
   - Verify email (or skip in dev)

2. **Connect Gmail**
   - Click "Connect Gmail" on dashboard
   - Authorize app to read Gmail
   - Return to dashboard
   - Gmail status shows "Connected"

3. **Sync Inbox**
   - Click "Sync Inbox" button
   - Wait for processing (1-2 minutes for 5 contracts)
   - Dashboard updates with new contracts

4. **Review Contracts**
   - Click on a contract in the table
   - Read AI summary
   - Review extracted fields
   - View identified risks

5. **Ask Questions**
   - Scroll to "AI Chat" section
   - Type a question about the contract
   - AI responds with contextual answer
   - Chat history is saved

---

## Screenshots Placeholder

```
Dashboard:
┌────────────────────────────────────────────────────┐
│  Welcome, John!        Gmail Connected             │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  45      │  │  12      │  │  3       │         │
│  │ Contracts│  │ Pending  │  │  High    │         │
│  │Imported  │  │ Review   │  │ Risk     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                    │
│  Recent Contracts                                 │
│  ┌──────────────────────────────────────────────┐ │
│  │ Acme Corp      Service Agr  High Risk Review│ │
│  │ TechVendor Inc   NDA         Low Risk Review │ │
│  │ SecureCloud SA  SLA          Medium Risk Rev │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

Contract Details:
┌────────────────────────────────────────────────────┐
│ ACME Corp - Service Agreement                      │
├────────────────────────────────────────────────────┤
│                                                    │
│ Summary:                                           │
│ This is a 1-year service agreement between...     │
│ [Full AI-generated summary]                        │
│                                                    │
│ Key Fields:                                        │
│ Vendor: Acme Corp                                 │
│ Type: Service Agreement                           │
│ Start: 2026-01-01  End: 2027-01-01               │
│ Payment: Net 30                                   │
│                                                    │
│ Risks (3 identified):                             │
│ 🔴 HIGH: Auto-renewal without notice             │
│ 🟡 MED: Unlimited liability clause                │
│                                                    │
│ PDF Viewer:                                        │
│ [Embedded PDF display]                            │
│                                                    │
│ AI Chat:                                           │
│ You: What happens at renewal?                     │
│ AI: The contract auto-renews for another year...  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Development Guide

### Code Style

- **Frontend:** ESLint + Prettier (TypeScript)
- **Backend:** Google Java Style Guide
- **AI Service:** PEP 8 + Black formatter

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
./mvnw test

# AI Service tests
cd ai-service
pytest
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
./mvnw clean package -DskipTests

# AI Service
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Debugging

- **Frontend:** Chrome DevTools, Next.js debug logs
- **Backend:** Application logs at `target/logs/`
- **AI Service:** Logs in terminal, FastAPI docs at `/docs`

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Code Review Guidelines

- All PRs require review before merge
- Tests must pass
- Code must follow style guidelines
- Documentation must be updated
- Commits should be atomic and well-described

---

## Future Enhancements

### Phase 2: Collaboration & Workflows

- Team management and multi-user support
- Role-based access control (RBAC)
- Contract approval workflows
- Comments and annotations
- Team member assignments

### Phase 3: Intelligence & Analytics

- Advanced analytics dashboard
- Predictive renewal alerts
- Contract comparison tools
- Vendor performance tracking
- Compliance reporting

### Phase 4: Enterprise Features

- Real-time notifications
- Outlook integration
- Automatic background monitoring
- Advanced search and filtering
- Vendor management system
- Third-party integrations (Salesforce, Ariba)

---

## Deployment

### Development

```bash
docker-compose up
```

### Staging/Production

```bash
# Using Kubernetes
kubectl apply -f k8s/
kubectl apply -f k8s/ingress.yaml

# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

**See TRD.md for detailed deployment architecture.**

---

## Troubleshooting

### Gmail Connection Fails

- Verify Gmail OAuth credentials in backend `.env`
- Check that OAuth redirect URI matches Google Console configuration
- Ensure user has authorized app permissions

### AI Processing Times Out

- Check AI service is running (`http://localhost:8000/docs`)
- Verify OpenAI API key is valid
- Check PDF file size (very large PDFs may timeout)

### Database Connection Error

- Verify PostgreSQL is running
- Check database credentials in backend `.env`
- Ensure database is created: `createdb procure_ai`

### Frontend Cannot Connect to Backend

- Verify backend is running on port 8080
- Check CORS configuration in Spring Security
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

---

## License

This project is licensed under the MIT License. See `LICENSE` file for details.

---

## Project Information

**Portfolio Project:** This project demonstrates enterprise application architecture, microservice communication, AI integration, and modern DevOps practices suitable for a software engineering portfolio.

**Learning Outcomes:**
- Full-stack development (React/TypeScript, Java Spring Boot, Python FastAPI)
- Microservice architecture and communication
- OAuth 2.0 authentication and email integration
- AI/LLM integration with OpenAI API
- Database design and optimization
- REST API design and documentation
- Docker and containerization
- Kubernetes deployment
- Security best practices
- Production-ready code patterns

---

## Support

For issues, questions, or suggestions:

1. Check existing GitHub Issues
2. Review FAQ in discussions
3. Create a new issue with detailed description
4. Contact maintainers

---

**Last Updated:** July 2026  
**Version:** 1.0.0 (MVP)  
**Status:** Active Development

---

### Quick Links

- 📄 [Product Requirements Document (PRD)](./PRD.md)
- 📋 [Technical Requirements Document (TRD)](./TRD.md)
- 🔧 [Architecture Documentation](./docs/ARCHITECTURE.md)
- 📚 [API Documentation](./docs/API.md)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
- 🐛 [Troubleshooting](./docs/TROUBLESHOOTING.md)
