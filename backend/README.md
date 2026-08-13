# Procure AI Backend

Node.js + Express + TypeScript backend for Procure AI - AI-powered Contract Intelligence Platform

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin requests

## Features

### Phase 1: Authentication
- ✅ User registration with email validation
- ✅ User login with password verification
- ✅ JWT token generation and verification
- ✅ Protected endpoints with authentication middleware
- ✅ Password hashing with bcrypt

### Phase 2: Contract Management
- ✅ Create contracts (owned by user)
- ✅ List all user contracts
- ✅ Get single contract details
- ✅ Update contract information
- ✅ Delete contracts
- ✅ User ownership verification

### Phase 3: PDF Upload & Text Extraction
- ✅ PDF upload with file validation
- ✅ Automatic text extraction from PDFs
- ✅ File storage management
- ✅ Secure filename handling

### Phase 4: AI Contract Analysis
- ✅ OpenRouter AI integration
- ✅ Contract summarization
- ✅ Key information extraction
- ✅ Risk analysis and identification
- ✅ Structured JSON responses
- ✅ Analysis status tracking

### Phase 5: Chat History
- ✅ Save chat messages (user + AI response)
- ✅ Retrieve chat history for contracts
- ✅ Timestamp tracking
- ✅ Contract ownership verification

## Project Structure

```
backend/
├── src/
│   ├── controllers/           # Route handlers
│   │   ├── authController.ts
│   │   ├── contractController.ts
│   │   └── chatController.ts
│   ├── services/              # Business logic
│   │   ├── authService.ts
│   │   ├── contractService.ts
│   │   └── chatService.ts
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── contractRoutes.ts
│   │   └── chatRoutes.ts
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── utils/                 # Utility functions
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── types/                 # TypeScript types
│   │   └── auth.ts
│   ├── lib/                   # Library exports
│   │   └── prisma.ts
│   └── server.ts              # Main server file
├── prisma/
│   └── schema.prisma          # Database schema
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **PostgreSQL** 12+ (download from [postgresql.org](https://www.postgresql.org/download))
- **Git**

### 1. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE procure_ai;

# Exit psql
\q
```

Or using a GUI tool like pgAdmin.

### 2. Clone & Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# Use your text editor to open .env and configure:
# - DATABASE_URL
# - JWT_SECRET
# - PORT (optional, defaults to 5000)
# - FRONTEND_URL (optional, defaults to http://localhost:3000)
# - OPENROUTER_API_KEY (Phase 4: for AI analysis)
# - OPENROUTER_MODEL (Phase 4: AI model selection)
```

**Example .env file:**
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/procure_ai"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
OPENROUTER_API_KEY="sk-or-v1-xxxxx" # Phase 4: Get from openrouter.ai
OPENROUTER_MODEL="google/gemma-3-27b-it"
```

#### Phase 4: OpenRouter Setup (AI Analysis)

1. **Create OpenRouter Account:**
   - Go to [openrouter.ai](https://openrouter.ai)
   - Sign up with email or OAuth

2. **Get API Key:**
   - Navigate to "Keys" section
   - Create new API key
   - Copy the key (starts with `sk-or-v1-`)

3. **Add to .env:**
   ```
   OPENROUTER_API_KEY="sk-or-v1-your-key-here"
   OPENROUTER_MODEL="google/gemma-3-27b-it"
   ```

4. **Available Models (as of Aug 2026):**
   - `google/gemma-3-27b-it` - Free, recommended
   - `openrouter/auto` - Automatically picks best model
   - `meta-llama/llama-3.1-405b-instruct` - Premium
   
   Current setup uses: **google/gemma-3-27b-it** (free tier)

### 4. Database Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Optional: Open Prisma Studio (visual database editor)
npm run prisma:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

You should see:
```
╔══════════════════════════════════════════════════════════╗
║       Procure AI Backend - Node.js + Express             ║
╠══════════════════════════════════════════════════════════╣
║ Server running on port 5000                              ║
║ Environment: development                                 ║
║ Frontend URL: http://localhost:3000                      ║
║ Database: PostgreSQL                                     ║
║ API Health: http://localhost:5000/health               ║
╚══════════════════════════════════════════════════════════╝
```

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user |

### Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contracts` | ✅ | List all user contracts |
| GET | `/api/contracts/:id` | ✅ | Get contract details |
| POST | `/api/contracts` | ✅ | Create contract |
| POST | `/api/contracts/upload` | ✅ | Upload PDF contract |
| POST | `/api/contracts/:id/analyze` | ✅ | Analyze contract with AI |
| PUT | `/api/contracts/:id` | ✅ | Update contract |
| DELETE | `/api/contracts/:id` | ✅ | Delete contract |

### Chat History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contracts/:contractId/chat` | ✅ | Get chat history |
| POST | `/api/contracts/:contractId/chat` | ✅ | Save chat message |

## API Examples

### Register User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clh1abc...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clh1abc...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Create Contract

**Request:**
```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Master Service Agreement",
    "vendor": "Microsoft",
    "status": "Review",
    "riskLevel": "Medium",
    "summary": "12-month enterprise agreement",
    "contractType": "MSA",
    "effectiveDate": "2026-08-01",
    "expiryDate": "2027-08-01"
  }'
```

**Response (201):**
```json
{
  "id": "clh2xyz...",
  "userId": "clh1abc...",
  "title": "Master Service Agreement",
  "vendor": "Microsoft",
  "status": "Review",
  "riskLevel": "Medium",
  "summary": "12-month enterprise agreement",
  "contractType": "MSA",
  "effectiveDate": "2026-08-01T00:00:00.000Z",
  "expiryDate": "2027-08-01T00:00:00.000Z",
  "pdfPath": null,
  "createdAt": "2026-08-09T10:30:00.000Z",
  "updatedAt": "2026-08-09T10:30:00.000Z"
}
```

### Get Contracts

**Request:**
```bash
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
[
  {
    "id": "clh2xyz...",
    "userId": "clh1abc...",
    "title": "Master Service Agreement",
    ...
  }
]
```

### Save Chat Message

**Request:**
```bash
curl -X POST http://localhost:5000/api/contracts/clh2xyz/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userMessage": "What is the termination clause?",
    "aiResponse": "The contract can be terminated with 30 days notice."
  }'
```

**Response (201):**
```json
{
  "id": "clh3def...",
  "contractId": "clh2xyz...",
  "userMessage": "What is the termination clause?",
  "aiResponse": "The contract can be terminated with 30 days notice.",
  "timestamp": "2026-08-09T10:35:00.000Z"
}
```

### Analyze Contract (Phase 4)

**Request:**
```bash
curl -X POST http://localhost:5000/api/contracts/clh2xyz/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "message": "Contract analyzed successfully",
  "analysis": {
    "summary": "12-month Master Service Agreement with Microsoft for cloud services...",
    "contractType": "MSA",
    "vendor": "Microsoft",
    "effectiveDate": "2026-08-01",
    "expiryDate": "2027-08-01",
    "riskLevel": "Medium",
    "keyTerms": [
      "Auto-renewal clause",
      "Net 30 payment terms",
      "30-day termination notice"
    ],
    "risks": [
      {
        "title": "Automatic Renewal",
        "severity": "High",
        "description": "Contract automatically renews unless notice given 60 days prior"
      },
      {
        "title": "Liability Cap",
        "severity": "Medium",
        "description": "Liability limited to 12 months of fees paid"
      }
    ],
    "recommendations": [
      "Review the automatic renewal clause to ensure timely notice of cancellation",
      "Negotiate lower liability cap if possible",
      "Add specific SLA performance metrics"
    ]
  },
  "textTruncated": false
}
```

**Response if no extracted text (400):**
```json
{
  "message": "Cannot analyze contract",
  "error": "Contract does not have extracted text. Please upload a PDF first."
}
```

## Available npm Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run compiled application
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:reset
```

## Database Schema

### Users Table
```
id          String  @id @default(cuid())
name        String
email       String  @unique
password    String  (hashed)
contracts   Contract[]
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

### Contracts Table
```
id                 String  @id @default(cuid())
userId             String  (FK to users.id)
title              String
vendor             String
status             String
riskLevel          String
summary            String? (optional)
contractType       String
effectiveDate      DateTime
expiryDate         DateTime
pdfPath            String? (optional)
fileName           String? (Phase 3)
extractedText      String? (Phase 3)
aiSummary          String? (Phase 4)
aiContractType     String? (Phase 4)
aiVendor           String? (Phase 4)
aiEffectiveDate    DateTime? (Phase 4)
aiExpiryDate       DateTime? (Phase 4)
aiRiskLevel        String? (Phase 4)
aiKeyTerms         String[] (Phase 4)
aiRisks            Json? (Phase 4)
aiRecommendations  String[] (Phase 4)
analysisStatus     String (Phase 4: PENDING|COMPLETED|FAILED)
analysisError      String? (Phase 4)
chatHistory        ChatHistory[]
createdAt          DateTime @default(now())
updatedAt          DateTime @updatedAt
```

### ChatHistory Table
```
id              String  @id @default(cuid())
contractId      String  (FK to contracts.id)
userMessage     String
aiResponse      String
timestamp       DateTime @default(now())
```

## Security

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Original password never stored
- Compared during login using bcrypt.compare()

### JWT Authentication
- Token generated on successful login/registration
- Expires after 7 days (configurable)
- Verified on protected endpoints
- Secret stored in environment variable

### User Ownership
- Users can only access their own contracts
- Users can only access chat history for their contracts
- Verified in database queries with userId filter

### CORS
- Enabled for frontend URLs (localhost:3000, localhost:3001)
- Credentials supported
- Specific methods allowed: GET, POST, PUT, DELETE, PATCH

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication failed)
- `404` - Not Found
- `500` - Server Error

## Testing

### Quick Test Flow

1. **Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

2. **Copy the token from response**

3. **Create a contract:**
```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Contract","vendor":"Test Co","status":"Review","riskLevel":"Low","contractType":"MSA","effectiveDate":"2026-08-01","expiryDate":"2027-08-01"}'
```

4. **Get contracts:**
```bash
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Use Postman or Insomnia for easier testing with UI.

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify port 5432 is correct

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in .env
- Or kill process using port: `lsof -i :5000` (Mac/Linux)

### JWT Token Errors
```
Error: Invalid or expired token
```
**Solution:**
- Ensure Authorization header format is `Bearer TOKEN`
- Check token hasn't expired (7 days default)
- Verify JWT_SECRET matches between generation and verification

### Prisma Migration Issues
```
Error: Migrations have failed
```
**Solution:**
- Run: `npm run prisma:reset` (deletes data!)
- Or manually fix schema.prisma conflicts

## Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** - Use a strong random string
2. **Update DATABASE_URL** - Use managed PostgreSQL service
3. **Set NODE_ENV=production**
4. **Enable HTTPS** - Use SSL/TLS certificates
5. **Update CORS origins** - Use actual domain
6. **Run migrations** - `npm run prisma:migrate -- --skip-generate`
7. **Build project** - `npm run build`
8. **Start with** - `npm start`

## License

MIT License - See LICENSE file for details

---

**Backend Version**: 1.0.0  
**Last Updated**: July 2026  
**Status**: Production Ready
