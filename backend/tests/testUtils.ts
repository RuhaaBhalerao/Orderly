import request from 'supertest';
import { Express } from 'express';

/**
 * Test utility functions for API testing
 */

export interface TestUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  token?: string;
}

export interface TestContract {
  id?: string;
  title: string;
  vendor: string;
  status: string;
  riskLevel: string;
  contractType: string;
  effectiveDate: string;
  expiryDate: string;
  summary?: string;
}

/**
 * Registers a test user and returns token
 */
export async function registerTestUser(
  app: Express,
  user: TestUser
): Promise<{ token: string; userId: string }> {
  const res = await request(app).post('/api/auth/register').send({
    name: user.name,
    email: user.email,
    password: user.password,
  });

  if (res.status !== 201) {
    throw new Error(`Failed to register user: ${res.body.message}`);
  }

  return {
    token: res.body.token,
    userId: res.body.user.id,
  };
}

/**
 * Logs in a test user and returns token
 */
export async function loginTestUser(
  app: Express,
  email: string,
  password: string
): Promise<{ token: string; userId: string }> {
  const res = await request(app).post('/api/auth/login').send({
    email,
    password,
  });

  if (res.status !== 200) {
    throw new Error(`Failed to login user: ${res.body.message}`);
  }

  return {
    token: res.body.token,
    userId: res.body.user.id,
  };
}

/**
 * Creates a test contract
 */
export async function createTestContract(
  app: Express,
  token: string,
  contract: TestContract
): Promise<string> {
  const res = await request(app)
    .post('/api/contracts')
    .set('Authorization', `Bearer ${token}`)
    .send(contract);

  if (res.status !== 201) {
    throw new Error(`Failed to create contract: ${res.body.message}`);
  }

  return res.body.id;
}

/**
 * Makes authenticated request
 */
export function makeAuthRequest(app: Express, token: string) {
  return {
    get: (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`),
    post: (path: string) => request(app).post(path).set('Authorization', `Bearer ${token}`),
    put: (path: string) => request(app).put(path).set('Authorization', `Bearer ${token}`),
    delete: (path: string) => request(app).delete(path).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Sample test user data
 */
export const TEST_USER_1 = {
  name: 'Test User 1',
  email: 'testuser1@example.com',
  password: 'password123456',
};

export const TEST_USER_2 = {
  name: 'Test User 2',
  email: 'testuser2@example.com',
  password: 'password654321',
};

/**
 * Sample test contract data
 */
export const TEST_CONTRACT_1: TestContract = {
  title: 'Sample Service Agreement',
  vendor: 'Test Vendor Inc',
  status: 'Review',
  riskLevel: 'Medium',
  contractType: 'MSA',
  effectiveDate: '2026-08-01',
  expiryDate: '2027-08-01',
  summary: 'Test contract for unit testing',
};

export const TEST_CONTRACT_2: TestContract = {
  title: 'Another Test Contract',
  vendor: 'Another Vendor LLC',
  status: 'Draft',
  riskLevel: 'Low',
  contractType: 'SLA',
  effectiveDate: '2026-09-01',
  expiryDate: '2027-09-01',
  summary: 'Another test contract',
};
