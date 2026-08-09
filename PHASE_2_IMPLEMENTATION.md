# Phase 2: Contract Management + Chat History - Implementation Summary

## Overview
Phase 2 adds contract and chat history management to the ProcureAI backend. All entities, repositories, services, and controllers have been implemented with user-ownership security.

## Files Created

### 1. Model Entities (2 files)
- **Contract.java** (`src/main/java/com/procureai/model/Contract.java`)
  - Fields: id (UUID), user (ManyToOne), title, vendor, status, riskLevel, summary, contractType, effectiveDate, expiryDate, pdfPath, createdAt, updatedAt
  - Relationships: ManyToOne with User, with lazy loading
  - Auto-generated timestamps via @PrePersist and @PreUpdate

- **ChatHistory.java** (`src/main/java/com/procureai/model/ChatHistory.java`)
  - Fields: id (UUID), contract (ManyToOne), userMessage, aiResponse, timestamp
  - Relationships: ManyToOne with Contract, with lazy loading
  - Auto-generated timestamp via @CreationTimestamp

### 2. Repositories (2 files)
- **ContractRepository.java** (`src/main/java/com/procureai/repository/ContractRepository.java`)
  - `findByUserId(String userId)` - Get all contracts for a user
  - `findByIdAndUserId(String id, String userId)` - Get specific contract and verify ownership

- **ChatHistoryRepository.java** (`src/main/java/com/procureai/repository/ChatHistoryRepository.java`)
  - `findByContractIdOrderByTimestampAsc(String contractId)` - Get chat history ordered by timestamp

### 3. DTOs (4 files)
- **ContractRequest.java** - Input DTO for creating/updating contracts
- **ContractResponse.java** - Output DTO for contract responses
- **ChatRequest.java** - Input DTO for saving chat messages
- **ChatResponse.java** - Output DTO for chat responses

### 4. Services (2 files)
- **ContractService.java** (`src/main/java/com/procureai/service/ContractService.java`)
  - `getAllContractsForUser(String userId)` - Returns all user contracts
  - `getContractById(String contractId, String userId)` - Get with ownership verification
  - `createContract(ContractRequest request, String userId)` - Create new contract
  - `updateContract(String contractId, ContractRequest request, String userId)` - Update with verification
  - `deleteContract(String contractId, String userId)` - Delete with verification
  - All methods verify user ownership before returning or modifying data

- **ChatService.java** (`src/main/java/com/procureai/service/ChatService.java`)
  - `getChatHistory(String contractId, String userId)` - Get chat with ownership verification
  - `saveChatMessage(String contractId, ChatRequest request, String userId)` - Save chat with verification
  - Ownership verified through contract association

### 5. Controllers (2 files)
- **ContractController.java** (`src/main/java/com/procureai/controller/ContractController.java`)
  - Base path: `/api/contracts`
  - `GET /api/contracts` - Get all contracts for authenticated user
  - `GET /api/contracts/{id}` - Get specific contract (ownership verified)
  - `POST /api/contracts` - Create contract (authenticated)
  - `PUT /api/contracts/{id}` - Update contract (ownership verified)
  - `DELETE /api/contracts/{id}` - Delete contract (ownership verified)

- **ChatController.java** (`src/main/java/com/procureai/controller/ChatController.java`)
  - Base path: `/api/contracts/{contractId}/chat`
  - `GET /api/contracts/{contractId}/chat` - Get chat history (ownership verified)
  - `POST /api/contracts/{contractId}/chat` - Save chat message (ownership verified)

## Database Relationships

```
users (1) ──── (N) contracts
                        │
                        │ (1) ──── (N) chat_history
```

### Tables Created by JPA

1. **users** - Pre-existing from Phase 1
   - id (UUID, Primary Key)
   - name
   - email (unique)
   - password
   - created_at
   - updated_at

2. **contracts** - New
   - id (UUID, Primary Key)
   - user_id (Foreign Key → users.id)
   - title
   - vendor
   - status
   - risk_level
   - summary (TEXT)
   - contract_type
   - effective_date
   - expiry_date
   - pdf_path
   - created_at
   - updated_at

3. **chat_history** - New
   - id (UUID, Primary Key)
   - contract_id (Foreign Key → contracts.id)
   - user_message (TEXT)
   - ai_response (TEXT)
   - timestamp

## Security Implementation

### Authentication
- All endpoints (except /api/auth/register and /api/auth/login) require JWT authentication
- JWT token extracted from Authorization header via JwtAuthenticationFilter
- User ID stored in Authentication.getPrincipal()

### Authorization (User Ownership)
- **Contract endpoints**: Each request extracts userId from JWT and verifies user owns the contract
  - `ContractRepository.findByIdAndUserId()` ensures user can only access own contracts
  - RuntimeException thrown if contract not found or doesn't belong to user

- **Chat endpoints**: Ownership verified through contract association
  - Chat history can only be accessed for contracts the user owns
  - `ContractRepository.findByIdAndUserId()` verifies contract ownership before returning chat

### Security Pattern
```java
// Extract authenticated user
String userId = (String) authentication.getPrincipal();

// Verify ownership in service
Optional<Contract> contract = contractRepository.findByIdAndUserId(contractId, userId);
if (!contract.isPresent()) {
    throw new RuntimeException("Contract not found or does not belong to user");
}
```

## API Endpoints

### Contract Management
```
GET    /api/contracts                    - List all user contracts
GET    /api/contracts/{id}               - Get single contract
POST   /api/contracts                    - Create contract
PUT    /api/contracts/{id}               - Update contract
DELETE /api/contracts/{id}               - Delete contract
```

### Chat History
```
GET    /api/contracts/{contractId}/chat  - Get chat history
POST   /api/contracts/{contractId}/chat  - Save chat message
```

## Request/Response Examples

### Create Contract
**Request:**
```json
POST /api/contracts
Authorization: Bearer {JWT_TOKEN}

{
  "title": "Master Service Agreement",
  "vendor": "Microsoft",
  "status": "Review",
  "riskLevel": "Medium",
  "summary": "Contract summary",
  "contractType": "MSA",
  "effectiveDate": "2026-08-01",
  "expiryDate": "2027-08-01"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Master Service Agreement",
  "vendor": "Microsoft",
  "status": "Review",
  "riskLevel": "Medium",
  "summary": "Contract summary",
  "contractType": "MSA",
  "effectiveDate": "2026-08-01",
  "expiryDate": "2027-08-01",
  "pdfPath": null,
  "createdAt": "2026-08-09T10:30:00",
  "updatedAt": "2026-08-09T10:30:00"
}
```

### Save Chat Message
**Request:**
```json
POST /api/contracts/{contractId}/chat
Authorization: Bearer {JWT_TOKEN}

{
  "userMessage": "What is the termination period?",
  "aiResponse": "The termination period is 30 days."
}
```

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "userMessage": "What is the termination period?",
  "aiResponse": "The termination period is 30 days.",
  "timestamp": "2026-08-09T10:31:00"
}
```

## Error Handling

All errors are handled by the existing `GlobalExceptionHandler`:

- **Contract not found**: RuntimeException → 400 Bad Request
- **Contract doesn't belong to user**: RuntimeException → 400 Bad Request
- **Invalid request body**: MethodArgumentNotValidException → 400 Bad Request with field errors
- **Other exceptions**: Exception → 500 Internal Server Error

## Testing with Postman

### 1. Register User
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Save the token from response as `{{token}}`.

### 2. Create Contract
```
POST http://localhost:8080/api/contracts
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Test Contract",
  "vendor": "Vendor Inc",
  "status": "Review",
  "riskLevel": "Medium",
  "summary": "Test summary",
  "contractType": "MSA",
  "effectiveDate": "2026-08-01",
  "expiryDate": "2027-08-01"
}
```

Save the contract ID as `{{contractId}}`.

### 3. Get All Contracts
```
GET http://localhost:8080/api/contracts
Authorization: Bearer {{token}}
```

### 4. Get Single Contract
```
GET http://localhost:8080/api/contracts/{{contractId}}
Authorization: Bearer {{token}}
```

### 5. Update Contract
```
PUT http://localhost:8080/api/contracts/{{contractId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Updated Contract",
  "vendor": "Vendor Inc",
  "status": "Approved",
  "riskLevel": "Low",
  "summary": "Updated summary",
  "contractType": "MSA",
  "effectiveDate": "2026-08-01",
  "expiryDate": "2027-08-01"
}
```

### 6. Save Chat Message
```
POST http://localhost:8080/api/contracts/{{contractId}}/chat
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userMessage": "What are the key terms?",
  "aiResponse": "The key terms include..."
}
```

### 7. Get Chat History
```
GET http://localhost:8080/api/contracts/{{contractId}}/chat
Authorization: Bearer {{token}}
```

### 8. Delete Contract
```
DELETE http://localhost:8080/api/contracts/{{contractId}}
Authorization: Bearer {{token}}
```

## Testing User Ownership Security

### Verify User A Cannot Access User B's Contract

1. Register User A
2. Create Contract as User A
3. Register User B
4. Try to access User A's contract with User B's token:
```
GET http://localhost:8080/api/contracts/{{userAContractId}}
Authorization: Bearer {{userBToken}}
```

**Expected Response (400 Bad Request):**
```json
{
  "timestamp": "2026-08-09T10:35:00",
  "status": 400,
  "message": "Contract not found or does not belong to user",
  "path": "/api/contracts/550e8400-e29b-41d4-a716-446655440000"
}
```

## Code Quality

✅ Constructor injection used throughout (via @RequiredArgsConstructor)
✅ Lombok annotations for boilerplate reduction (@Entity, @Data, @Builder)
✅ Spring Data JPA for database operations
✅ REST conventions followed (HTTP methods, status codes)
✅ DTOs separate from entities (no lazy loading issues)
✅ Consistent error handling via GlobalExceptionHandler
✅ User ownership verification on every protected endpoint
✅ No authentication system modifications needed

## Compilation

The project is designed to compile with:
```bash
mvn clean compile
```

All code follows Spring Boot 3.2 and Java 21 standards.

## What's NOT Included (As Per Phase 2 Scope)

- ❌ AI service integration (Phase 3)
- ❌ PDF upload/processing (Phase 4)
- ❌ Gmail integration (Phase 5)
- ❌ Notifications (Future)
- ❌ Advanced search (Future)
- ❌ Approval workflows (Future)

## Next Steps

Phase 3: AI Integration
- Create FastAPI service for contract intelligence
- Integrate with Spring Boot backend
- Real AI summarization and field extraction
