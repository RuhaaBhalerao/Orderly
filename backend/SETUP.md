# Spring Boot Backend Setup Guide

Complete setup instructions for Procure AI Spring Boot backend.

## ✅ What's Included

- ✅ Complete Spring Boot 3.2 project
- ✅ User authentication with JWT
- ✅ PostgreSQL database integration
- ✅ BCrypt password hashing
- ✅ CORS configuration for frontend
- ✅ Exception handling
- ✅ Constructor injection
- ✅ Maven build configuration
- ✅ Production-ready security

## 📋 Prerequisites

Before starting, ensure you have:

1. **Java 21** - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/)
2. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/download/)
3. **Maven** - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
4. **Git** - Download from [git-scm.com](https://git-scm.com/)
5. **IDE** - IntelliJ IDEA, VS Code, or Eclipse

## 🚀 Quick Start (5 minutes)

### Step 1: Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE procure_ai;

-- Create user (optional)
CREATE USER procure_user WITH ENCRYPTED PASSWORD 'procure_password';
GRANT ALL PRIVILEGES ON DATABASE procure_ai TO procure_user;
```

Or use pgAdmin GUI if you prefer.

### Step 2: Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
# Change these values to match your PostgreSQL setup
spring.datasource.url=jdbc:postgresql://localhost:5432/procure_ai
spring.datasource.username=postgres
spring.datasource.password=your_password

# Change JWT secret to something long and random
jwt.secret=your-super-secret-key-at-least-32-characters-long-change-this-in-production
```

### Step 3: Build and Run

```bash
# Navigate to backend directory
cd backend

# Build with Maven
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will start at: **http://localhost:8080**

You should see:
```
Started ProcureAiApplication in X.XXX seconds
```

## 📁 Project Structure

```
backend/
├── src/main/java/com/procureai/
│   ├── controller/
│   │   └── AuthController.java          ← REST endpoints
│   ├── service/
│   │   └── AuthService.java             ← Business logic
│   ├── repository/
│   │   └── UserRepository.java          ← Database queries
│   ├── model/
│   │   └── User.java                    ← Entity/Table
│   ├── security/
│   │   ├── JwtTokenProvider.java        ← Token generation
│   │   └── JwtAuthenticationFilter.java ← Token validation
│   ├── config/
│   │   └── SecurityConfig.java          ← Security rules
│   ├── dto/
│   │   ├── AuthRequest.java             ← Register request
│   │   ├── LoginRequest.java            ← Login request
│   │   └── AuthResponse.java            ← Response object
│   ├── exception/
│   │   └── GlobalExceptionHandler.java  ← Error handling
│   └── ProcureAiApplication.java        ← Main entry point
│
├── src/main/resources/
│   └── application.properties           ← Configuration
│
├── pom.xml                              ← Maven dependencies
├── README.md                            ← Project info
├── SETUP.md                             ← This file
└── FRONTEND_INTEGRATION.md              ← Frontend connection
```

## 🔧 Key Configuration Files

### `application.properties`

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/procure_ai
spring.datasource.username=postgres
spring.datasource.password=password

# Hibernate (auto-creates tables)
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000  # 24 hours in milliseconds
```

### `pom.xml`

Main dependencies:
- Spring Boot Web
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- JJWT (JWT)
- Lombok
- Validation

## 🔐 Security Configuration

### JWT Token Flow

```
1. User login with email/password
2. Backend validates credentials
3. Backend creates JWT token with user ID
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header
6. Backend validates token on each request
```

### Endpoints

| Method | Endpoint | Protected | Purpose |
|--------|----------|-----------|---------|
| POST | /api/auth/register | ❌ No | Register new user |
| POST | /api/auth/login | ❌ No | Login user |
| GET | /api/auth/me | ✅ Yes | Get current user |

### CORS Configuration

Allowed origins:
- http://localhost:3000 (Next.js frontend)
- http://localhost:3001 (Alternative port)
- http://127.0.0.1:3000

Modify in `SecurityConfig.java` if needed.

## 🧪 Testing

### Test Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response.

### Test Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Schema

Tables created automatically:

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔄 Development Workflow

### Make Changes
1. Edit Java files in `src/main/java/com/procureai/`
2. Save the file
3. Dev tools will auto-reload the application
4. Test changes with curl or Postman

### Common Tasks

**Add new endpoint:**
1. Create method in `AuthController`
2. Implement logic in `AuthService`
3. Test with curl

**Add new database field:**
1. Add field to `User.java` entity
2. Hibernate creates migration automatically
3. Test with login

**Change security rules:**
1. Edit `SecurityConfig.java`
2. Update `authorizeHttpRequests` rules
3. Restart application

## 🐛 Troubleshooting

### Issue: Connection refused to PostgreSQL
```
Error: Connection refused
```
**Solution:**
- Ensure PostgreSQL is running
- Check database URL in application.properties
- Verify database exists: `psql -l`

### Issue: Table not found
```
Error: relation "users" does not exist
```
**Solution:**
- Ensure `spring.jpa.hibernate.ddl-auto=update` is set
- Delete existing database and recreate
- Check PostgreSQL logs

### Issue: CORS error in browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Verify frontend URL is in CORS allowed origins
- Check `SecurityConfig.java` cors configuration
- Restart backend after changes

### Issue: 401 Unauthorized
```
Status: 401
```
**Solution:**
- Ensure JWT token is included in header
- Verify token hasn't expired (24 hours)
- Test with `/api/auth/login` first to get token

### Issue: Build fails
```
BUILD FAILURE
```
**Solutions:**
- Ensure Java 21 is installed: `java -version`
- Clear Maven cache: `mvn clean`
- Update Maven: `mvn -v`
- Check internet connection for dependencies

## 📦 Maven Commands

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Run tests
mvn test

# Skip tests during build
mvn clean install -DskipTests

# Create JAR file
mvn clean package

# View dependencies
mvn dependency:tree
```

## 🚢 Running JAR File

After building:
```bash
# Run JAR directly
java -jar target/procure-ai-backend-1.0.0.jar

# Run with custom properties
java -jar target/procure-ai-backend-1.0.0.jar \
  --spring.datasource.password=your_password \
  --jwt.secret=your-secret
```

## 🌐 Connect Frontend

See `FRONTEND_INTEGRATION.md` for complete frontend integration guide.

Quick summary:
1. Add `NEXT_PUBLIC_API_URL=http://localhost:8080/api` to frontend `.env.local`
2. Create `lib/api.ts` with fetch functions
3. Update Login page to call backend
4. Test register and login

## 📚 Next Steps

1. ✅ Backend setup complete
2. ✅ Database configured
3. ✅ Authentication working
4. → Connect frontend (see FRONTEND_INTEGRATION.md)
5. → Add contract endpoints
6. → Add AI service integration
7. → Deploy to production

## 🔑 Important Notes

### Security
- **Never commit `application.properties`** with real credentials
- **Change JWT secret** before production
- **Use strong passwords** in database
- **Enable HTTPS** in production
- **Validate all user input**

### Performance
- **Connection pooling** configured automatically
- **Database indexing** on email (unique constraint)
- **Lazy loading** enabled for JPA
- **Query caching** available

### Monitoring
- Debug logs enabled in development
- All requests logged
- Error details in response
- Check `target/logs` for application logs

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review backend README.md
3. Check Spring Boot logs
4. Review application.properties settings

## 📖 Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)

---

**Setup Complete!** 🎉

Your Spring Boot backend is ready. Next: [Connect your frontend](./FRONTEND_INTEGRATION.md)
