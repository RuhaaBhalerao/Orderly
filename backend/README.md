# Procure AI Backend

Spring Boot backend for Procure AI - AI-powered Contract Intelligence Platform

## Tech Stack

- **Java 21**
- **Spring Boot 3.2.0**
- **Spring Web** - REST API
- **Spring Data JPA** - Database ORM
- **Spring Security** - Authentication & Authorization
- **JWT (JJWT)** - Token-based authentication
- **PostgreSQL** - Database
- **Lombok** - Reduce boilerplate code
- **Maven** - Build tool

## Project Structure

```
backend/
├── src/main/java/com/procureai/
│   ├── controller/           # REST API endpoints
│   │   └── AuthController.java
│   ├── service/              # Business logic
│   │   └── AuthService.java
│   ├── repository/           # Database access
│   │   └── UserRepository.java
│   ├── model/                # Entity classes
│   │   └── User.java
│   ├── security/             # Security configuration
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   ├── config/               # Configuration classes
│   │   └── SecurityConfig.java
│   ├── dto/                  # Data transfer objects
│   │   ├── AuthRequest.java
│   │   ├── LoginRequest.java
│   │   └── AuthResponse.java
│   ├── exception/            # Exception handling
│   │   └── GlobalExceptionHandler.java
│   └── ProcureAiApplication.java  # Main application class
│
├── src/main/resources/
│   └── application.properties      # Configuration
│
├── pom.xml                         # Maven dependencies
└── README.md                       # This file
```

## Setup Instructions

### Prerequisites

- Java 21 installed
- PostgreSQL running locally
- Maven installed
- Git

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE procure_ai;
```

2. Create user (optional but recommended):
```sql
CREATE USER procure_user WITH ENCRYPTED PASSWORD 'procure_password';
GRANT ALL PRIVILEGES ON DATABASE procure_ai TO procure_user;
```

### Configuration

1. Update `application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/procure_ai
spring.datasource.username=postgres
spring.datasource.password=your_password
jwt.secret=your-very-long-secure-random-string-here
```

2. Change JWT secret to a strong random string in production!

### Build & Run

1. **Build the project:**
```bash
cd backend
mvn clean install
```

2. **Run the application:**
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

Alternatively, run the JAR file:
```bash
java -jar target/procure-ai-backend-1.0.0.jar
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 3. Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Security

- **Passwords**: Hashed using BCrypt
- **Authentication**: JWT (JSON Web Token)
- **CORS**: Enabled for frontend (localhost:3000)
- **Session**: Stateless (no sessions, only tokens)

### Security Features

1. **Password Security**
   - Passwords are hashed using BCrypt
   - Original password never stored

2. **JWT Token**
   - Token expires after 24 hours (configurable)
   - Contains user ID and email
   - Signed with secret key

3. **CORS Configuration**
   - Allows requests from http://localhost:3000
   - Allows requests from http://localhost:3001
   - Credentials supported

4. **Protected Endpoints**
   - `/api/auth/me` - Requires valid JWT token
   - Only public endpoints: `/api/auth/register`, `/api/auth/login`

## Error Handling

The API returns meaningful error messages:

```json
{
  "timestamp": "2026-07-22T10:30:00",
  "status": 400,
  "message": "User with this email already exists",
  "path": "/api/auth/register"
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Frontend Integration

See [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md) for how to connect your Next.js frontend to these APIs.

## Common Issues

### Issue: PostgreSQL connection refused
**Solution:** Ensure PostgreSQL is running and accessible at localhost:5432

### Issue: Table not found
**Solution:** The tables are created automatically with `spring.jpa.hibernate.ddl-auto=update`

### Issue: CORS errors in frontend
**Solution:** Ensure the frontend URL is in the CORS allowed origins in `SecurityConfig.java`

### Issue: 401 Unauthorized on protected endpoints
**Solution:** Ensure you're sending the JWT token in the Authorization header: `Bearer YOUR_TOKEN`

## Production Deployment

Before deploying to production:

1. **Change JWT Secret**: Use a strong, random string
2. **Update Database**: Use a managed PostgreSQL instance
3. **Enable HTTPS**: Set up SSL/TLS certificates
4. **Update CORS**: Use your actual domain instead of localhost
5. **Set Environment Variables**: Use environment variables for sensitive configs
6. **Enable Logging**: Configure appropriate log levels

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Dependencies

Key dependencies in pom.xml:
- Spring Boot Web Starter
- Spring Data JPA
- Spring Security
- PostgreSQL JDBC Driver
- JJWT (JWT library)
- Lombok
- Validation

## License

MIT License - See LICENSE file for details

---

**Created**: July 2026
**Version**: 1.0.0
**Status**: Production Ready
