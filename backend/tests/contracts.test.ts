import request from 'supertest';
import express, { Express } from 'express';
import contractRoutes from '../src/routes/contractRoutes';
import authRoutes from '../src/routes/authRoutes';
import { errorMiddleware, notFoundHandler } from '../src/middleware/errorMiddleware';
import { handleValidationErrors } from '../src/middleware/validationMiddleware';
import {
  TEST_USER_1,
  TEST_USER_2,
  TEST_CONTRACT_1,
  registerTestUser,
  loginTestUser,
  createTestContract,
  makeAuthRequest,
} from './testUtils';

let app: Express;

/**
 * Contract Management Tests
 * Tests for CRUD operations on contracts
 */
describe('Contract Management', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let contractId = '';

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(handleValidationErrors);
    app.use('/api/auth', authRoutes);
    app.use('/api/contracts', contractRoutes);
    app.use(notFoundHandler);
    app.use(errorMiddleware);

    // Register test users
    const user1 = await registerTestUser(app, {
      name: TEST_USER_1.name,
      email: `user1-${Date.now()}@example.com`,
      password: TEST_USER_1.password,
    });
    user1Token = user1.token;
    user1Id = user1.userId;

    const user2 = await registerTestUser(app, {
      name: TEST_USER_2.name,
      email: `user2-${Date.now()}@example.com`,
      password: TEST_USER_2.password,
    });
    user2Token = user2.token;

    // Create test contract
    contractId = await createTestContract(app, user1Token, TEST_CONTRACT_1);
  });

  describe('POST /api/contracts (Create)', () => {
    it('should create contract with valid data', async () => {
      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(TEST_CONTRACT_1);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(TEST_CONTRACT_1.title);
      expect(res.body.userId).toBe(user1Id);
    });

    it('should reject contract with missing title', async () => {
      const invalidContract = { ...TEST_CONTRACT_1, title: undefined };
      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(invalidContract);

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('title');
    });

    it('should reject contract with invalid date range', async () => {
      const invalidContract = {
        ...TEST_CONTRACT_1,
        effectiveDate: '2027-08-01',
        expiryDate: '2026-08-01', // Earlier than effective date
      };
      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(invalidContract);

      expect(res.status).toBe(400);
    });

    it('should reject contract without authentication', async () => {
      const res = await request(app).post('/api/contracts').send(TEST_CONTRACT_1);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contracts (List)', () => {
    it('should list contracts for authenticated user', async () => {
      const res = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.some((c: any) => c.id === contractId)).toBe(true);
    });

    it('should not list other users contracts', async () => {
      const res = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // User 2 should not see User 1's contracts
      expect(res.body.some((c: any) => c.id === contractId)).toBe(false);
    });

    it('should reject list without authentication', async () => {
      const res = await request(app).get('/api/contracts');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contracts/:id (Get Single)', () => {
    it('should get contract by id', async () => {
      const res = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(contractId);
      expect(res.body.title).toBe(TEST_CONTRACT_1.title);
    });

    it('should reject access to other users contract', async () => {
      const res = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });

    it('should reject with invalid contract id', async () => {
      const res = await request(app)
        .get('/api/contracts/invalid-id')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });

    it('should reject without authentication', async () => {
      const res = await request(app).get(`/api/contracts/${contractId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/contracts/:id (Update)', () => {
    it('should update contract with valid data', async () => {
      const updatedData = {
        ...TEST_CONTRACT_1,
        status: 'Approved',
        riskLevel: 'Low',
      };

      const res = await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Approved');
      expect(res.body.riskLevel).toBe('Low');
    });

    it('should reject update by unauthorized user', async () => {
      const updatedData = { ...TEST_CONTRACT_1, status: 'Signed' };

      const res = await request(app)
        .put(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(updatedData);

      expect(res.status).toBe(404);
    });

    it('should reject without authentication', async () => {
      const updatedData = { ...TEST_CONTRACT_1, status: 'Signed' };

      const res = await request(app).put(`/api/contracts/${contractId}`).send(updatedData);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/contracts/:id', () => {
    it('should delete contract', async () => {
      // Create a contract to delete
      const tempContractId = await createTestContract(app, user1Token, TEST_CONTRACT_1);

      const res = await request(app)
        .delete(`/api/contracts/${tempContractId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(204);

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/api/contracts/${tempContractId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(getRes.status).toBe(404);
    });

    it('should reject delete by unauthorized user', async () => {
      const res = await request(app)
        .delete(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });

    it('should reject without authentication', async () => {
      const res = await request(app).delete(`/api/contracts/${contractId}`);

      expect(res.status).toBe(401);
    });
  });
});
