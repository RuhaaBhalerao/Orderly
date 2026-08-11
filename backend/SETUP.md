# Backend Setup Guide - Node.js + Express + Prisma

Complete step-by-step guide to set up and run the Procure AI Node.js backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Backend](#running-the-backend)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have installed:

### 1. Node.js & npm

**macOS:**
```bash
brew install node
```

**Windows:**
- Download from [nodejs.org](https://nodejs.org)
- Run installer (includes npm)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Verify installation:**
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### 2. PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer
- Note the password you set for `postgres` user

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Verify installation:**
```bash
psql --version  # Should show PostgreSQL version
```

### 3. Git

**macOS:**
```bash
brew install git
```

**Windows/Linux:**
- Download from [git-scm.com](https://git-scm.com)
- Or use system package manager

---

## Installation

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages from package.json:
- express - Web framework
- @prisma/client - Database client
- jsonwebtoken - JWT authentication
- bcrypt - Password hashing
- cors - CORS handling
- express-validator - Input validation
- dotenv - Environment variables
- TypeScript and dev tools

### Step 3: Verify Installation

```bash
npm list --depth=0
```

Should show all main dependencies installed.

---

## Configuration

### Step 1: Create .env File

```bash
# Copy from template
cp .env.example .env
```

### Step 2: Edit .env

Open `.env` in your text editor and configure:

```bash
# Database Connection String
DATABASE_URL="postgresql://username:password@localhost:5432/procure_ai"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

**Important:**
- Replace `username` and `password` with your PostgreSQL credentials
- Change `JWT_SECRET` to a random string (use `openssl rand -base64 32`)
- Never commit `.env` to git

### Step 3: Verify .env

```bash
# Check that .env file exists and has content
cat .env
```

---

## Database Setup

### Step 1: Create PostgreSQL Database

**Option A: Using psql (command line)**

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell, create database
CREATE DATABASE procure_ai;

# Exit psql
\q
```

**Option B: Using pgAdmin (GUI)**

1. Open pgAdmin
2. Right-click "Databases"
3. Select "Create" → "Database"
4. Name: `procure_ai`
5. Click Save

**Option C: Using DBeaver (GUI)**

1. Open DBeaver
2. Right-click on PostgreSQL connection
3. Select "Create New Database"
4. Name: `procure_ai`
5. Click OK

### Step 2: Verify Database Connection

```bash
# Test connection
psql -U postgres -d procure_ai

# If connected, you should see:
# procure_ai=>

# Exit
\q
```

### Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client in `node_modules/@prisma/client`.

### Step 4: Run Migrations

```bash
npm run prisma:migrate
```

This:
1. Creates migration files
2. Applies schema to database
3. Creates tables: users, contracts, chat_history

You'll be prompted:
```
✔ Enter a name for this migration: › init
```

Type a name like `init` or `create_tables` and press Enter.

### Step 5: Verify Database Schema

**Option A: Using Prisma Studio (GUI)**

```bash
npm run prisma:studio
```

Opens browser at `http://localhost:5555` to view/edit database.

**Option B: Using psql**

```bash
psql -U postgres -d procure_ai

# List tables
\dt

# Describe users table
\d users

# Exit
\q
```

Should see:
```
         List of relations
 Schema | Name | Type  | Owner
--------+------+-------+-------
 public | users | table | postgres
 public | contracts | table | postgres
 public | chat_history | table | postgres
```

---

## Running the Backend

### Option 1: Development Mode (Recommended for Development)

```bash
npm run dev
```

Features:
- Auto-reloads on code changes
- TypeScript watch mode
- Shows full logs
- Accessible at `http://localhost:5000`

Expected output:
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

### Option 2: Production Build

```bash
# Compile TypeScript
npm run build

# Run compiled JavaScript
npm start
```

Runs compiled version from `dist/` directory.

---

## Verification

### Test 1: Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","message":"Backend is running"}
```

### Test 2: Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clh1abc...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Test 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Same response with token.

### Test 4: Protected Endpoint

Save token from previous response, then:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response (200):
```json
{
  "id": "clh1abc...",
  "name": "Test User",
  "email": "test@example.com"
}
```

### Test 5: Create Contract

```bash
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Contract",
    "vendor": "Test Company",
    "status": "Review",
    "riskLevel": "Medium",
    "contractType": "MSA",
    "effectiveDate": "2026-08-01",
    "expiryDate": "2027-08-01"
  }'
```

Expected response (201) with contract details.

---

## Using Postman (Recommended for Testing)

1. **Download Postman** from [postman.com](https://www.postman.com/downloads/)

2. **Import Collection:**
   - Create new Collection: "Procure AI"

3. **Create Requests:**

   **Register:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

   **Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

   **Get Me (with Auth):**
   - Method: GET
   - URL: `http://localhost:5000/api/auth/me`
   - Headers: `Authorization: Bearer {{token}}`

4. **Use Variables:**
   - Set token as collection variable
   - Use `{{token}}` in requests

---

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
npm install
npm run prisma:generate
```

### Issue: "Connection refused at 127.0.0.1:5432"

PostgreSQL is not running.

**Solution:**

**macOS:**
```bash
brew services start postgresql
```

**Windows:**
- Open Services (services.msc)
- Find "PostgreSQL"
- Right-click → Start

**Linux:**
```bash
sudo systemctl start postgresql
```

### Issue: "Database does not exist"

The `procure_ai` database wasn't created.

**Solution:**
```bash
psql -U postgres
CREATE DATABASE procure_ai;
\q
```

### Issue: "Invalid DATABASE_URL format"

Check .env file syntax.

**Correct format:**
```
postgresql://username:password@localhost:5432/database_name
```

### Issue: "EADDRINUSE: address already in use :::5000"

Another process is using port 5000.

**Solution:**

**macOS/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

### Issue: "Unexpected token < in JSON at position 0"

API returned HTML error page instead of JSON. Server likely crashed.

**Solution:**
- Check console for error messages
- Verify all dependencies installed
- Check .env configuration

### Issue: "JWT malformed"

Token format is incorrect.

**Solution:**
- Ensure Authorization header is: `Bearer TOKEN` (with space)
- Not: `BearerTOKEN` or just `TOKEN`

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `JWT_SECRET` | Required | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin for CORS |

---

## Next Steps

After setup:

1. ✅ Backend running at http://localhost:5000
2. ✅ Database connected with tables created
3. ✅ Authentication working
4. ✅ Contracts API functional
5. Next: Start frontend development

See `FRONTEND_INTEGRATION.md` for connecting the Next.js frontend.

---

**Setup Guide Version**: 1.0  
**Last Updated**: July 2026
