/**
 * Manual API endpoint testing script
 * Tests core backend functionality without Jest overhead
 * Run with: npx tsx test-api-endpoints.ts
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
let globalToken = '';
let globalUserId = '';
let globalContractId = '';

interface ApiResponse {
  status: number;
  body: any;
}

async function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<ApiResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return {
    status: response.status,
    body: data,
  };
}

async function log(message: string, success: boolean = true) {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${message}`);
}

async function testHealthCheck() {
  console.log('\n📋 Testing Health Check...');
  const res = await makeRequest('GET', '/health');
  
  if (res.status === 200 && res.body.status === 'ok') {
    await log('Health check passed');
    return true;
  }
  
  await log(`Health check failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testRegistration() {
  console.log('\n📋 Testing User Registration...');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const res = await makeRequest('POST', '/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'SecurePassword123!',
  });

  if (res.status === 201 && res.body.token && res.body.user.id) {
    globalToken = res.body.token;
    globalUserId = res.body.user.id;
    await log(`Registration passed - User: ${testEmail}`);
    return true;
  }

  await log(`Registration failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testLogin() {
  console.log('\n📋 Testing User Login...');
  
  // First register a user
  const testEmail = `login-${Date.now()}@example.com`;
  await makeRequest('POST', '/auth/register', {
    name: 'Login Test',
    email: testEmail,
    password: 'LoginPassword123!',
  });

  // Then login
  const res = await makeRequest('POST', '/auth/login', {
    email: testEmail,
    password: 'LoginPassword123!',
  });

  if (res.status === 200 && res.body.token) {
    await log('Login passed');
    return true;
  }

  await log(`Login failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testGetMe() {
  console.log('\n📋 Testing GET /auth/me...');

  if (!globalToken) {
    await log('Skipping - no token available', false);
    return false;
  }

  const res = await makeRequest('GET', '/auth/me', undefined, globalToken);

  if (res.status === 200 && res.body.user.id) {
    await log(`GET /me passed - User ID: ${res.body.user.id}`);
    return true;
  }

  await log(`GET /me failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testCreateContract() {
  console.log('\n📋 Testing Contract Creation...');

  if (!globalToken) {
    await log('Skipping - no token available', false);
    return false;
  }

  const res = await makeRequest(
    'POST',
    '/contracts',
    {
      title: 'Test Contract',
      vendor: 'Test Vendor Inc.',
      status: 'Draft',
      riskLevel: 'Low',
      contractType: 'MSA',
      effectiveDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Test contract for API verification',
    },
    globalToken
  );

  if (res.status === 201 && res.body.id) {
    globalContractId = res.body.id;
    await log(`Contract creation passed - ID: ${res.body.id}`);
    return true;
  }

  await log(`Contract creation failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testGetContracts() {
  console.log('\n📋 Testing GET /contracts...');

  if (!globalToken) {
    await log('Skipping - no token available', false);
    return false;
  }

  const res = await makeRequest('GET', '/contracts', undefined, globalToken);

  if (res.status === 200 && Array.isArray(res.body)) {
    await log(`GET /contracts passed - Found ${res.body.length} contracts`);
    return true;
  }

  await log(`GET /contracts failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testGetContract() {
  console.log('\n📋 Testing GET /contracts/:id...');

  if (!globalToken || !globalContractId) {
    await log('Skipping - no token or contract ID available', false);
    return false;
  }

  const res = await makeRequest(
    'GET',
    `/contracts/${globalContractId}`,
    undefined,
    globalToken
  );

  if (res.status === 200 && res.body.id === globalContractId) {
    await log(`GET /contracts/:id passed - Contract retrieved`);
    return true;
  }

  await log(`GET /contracts/:id failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testUpdateContract() {
  console.log('\n📋 Testing PUT /contracts/:id...');

  if (!globalToken || !globalContractId) {
    await log('Skipping - no token or contract ID available', false);
    return false;
  }

  const res = await makeRequest(
    'PUT',
    `/contracts/${globalContractId}`,
    {
      title: 'Updated Test Contract',
      vendor: 'Updated Vendor Inc.',
      status: 'Review',
      riskLevel: 'Medium',
      contractType: 'SLA',
      effectiveDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Updated summary',
    },
    globalToken
  );

  if (res.status === 200 && res.body.title === 'Updated Test Contract') {
    await log(`PUT /contracts/:id passed - Contract updated`);
    return true;
  }

  await log(`PUT /contracts/:id failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testUnauthorizedAccess() {
  console.log('\n📋 Testing Authorization Protection...');

  const res = await makeRequest('GET', '/contracts');

  if (res.status === 401) {
    await log('Authorization protection passed - Rejected unauthorized request');
    return true;
  }

  await log(`Authorization protection failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function testInvalidCredentials() {
  console.log('\n📋 Testing Invalid Credentials Handling...');

  const res = await makeRequest('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123!',
  });

  if (res.status === 401) {
    await log('Invalid credentials handling passed');
    return true;
  }

  await log(`Invalid credentials handling failed: ${res.status}`, false);
  console.log(res.body);
  return false;
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Orderly Backend API Endpoint Test Suite                ║');
  console.log('║     Make sure backend is running: npm run dev               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegistration },
    { name: 'User Login', fn: testLogin },
    { name: 'Get Current User', fn: testGetMe },
    { name: 'Create Contract', fn: testCreateContract },
    { name: 'Get All Contracts', fn: testGetContracts },
    { name: 'Get Single Contract', fn: testGetContract },
    { name: 'Update Contract', fn: testUpdateContract },
    { name: 'Authorization Protection', fn: testUnauthorizedAccess },
    { name: 'Invalid Credentials', fn: testInvalidCredentials },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} - Error: ${error}`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Test Results                             ║');
  console.log(`║  ✅ Passed: ${passed}/${tests.length}${' '.repeat(Math.max(0, 38 - passed.toString().length))}║`);
  console.log(`║  ❌ Failed: ${failed}/${tests.length}${' '.repeat(Math.max(0, 38 - failed.toString().length))}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
