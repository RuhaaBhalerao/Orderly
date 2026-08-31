import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../src/routes/authRoutes';
import { errorMiddleware, notFoundHandler } from '../src/middleware/errorMiddleware';
import { handleValidationErrors } from '../src/middleware/validationMiddleware';
import { prisma } from '../src/lib/prisma';

let app: Express;

/**
 * Authentication Tests
 * Tests for user registration, login, and protected routes
 */
describe('Authentication', () => {
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(handleValidationErrors);
    app.use('/api/auth', authRoutes);
    app.use(notFoundHandler);
    app.use(errorMiddleware);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject registration with missing name', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation');
      expect(res.body.errors).toHaveProperty('name');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('email');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      const email = `dup-${Date.now()}@example.com`;

      // First registration
      const res1 = await request(app).post('/api/auth/register').send({
        name: 'User 1',
        email,
        password: 'password123',
      });
      expect(res1.status).toBe(201);

      // Duplicate registration
      const res2 = await request(app).post('/api/auth/register').send({
        name: 'User 2',
        email,
        password: 'password456',
      });
      expect(res2.status).toBe(409);
      expect(res2.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail = '';
    let testPassword = 'password123456';

    beforeAll(async () => {
      testEmail = `login-test-${Date.now()}@example.com`;
      await request(app).post('/api/auth/register').send({
        name: 'Login Test User',
        email: testEmail,
        password: testPassword,
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should fall back to demo credentials when the database is unavailable', async () => {
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');
      findUniqueSpy.mockRejectedValueOnce(new Error("Can't reach database server at localhost:5432"));

      const res = await request(app).post('/api/auth/login').send({
        email: 'rahul@example.com',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('rahul@example.com');
      findUniqueSpy.mockRestore();
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should reject login with missing email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('email');
    });

    it('should reject login with missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('password');
    });
  });

  describe('GET /api/auth/me', () => {
    let validToken = '';
    let userId = '';

    beforeAll(async () => {
      const email = `me-test-${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Me Test User',
        email,
        password: 'password123456',
      });
      validToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should return user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should reject request with malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
    });
  });
});
