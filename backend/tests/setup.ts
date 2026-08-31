/**
 * Test setup file
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '5001'; // Different port for tests
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.OPENROUTER_API_KEY = 'test-api-key';
process.env.OPENROUTER_MODEL = 'test-model';

// Mock database URL if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/orderly_test';
}

// Suppress console logs during tests (optional, comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
