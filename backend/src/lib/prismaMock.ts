import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';

// In-memory store for mock users
const mockUsers: User[] = [];

export const prismaMock = mockDeep<PrismaClient>();

// Reset mocks and clear in-memory store before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// @ts-ignore
// Mock implementation for findUnique on User model
prismaMock.user.findUnique.mockImplementation(async (args: any) => {
  const { email, id } = args?.where || {};
  if (email) {
    return mockUsers.find((u) => u.email === email) || null;
  }
  if (id) {
    return mockUsers.find((u) => u.id === id) || null;
  }
  return null;
});

// @ts-ignore
// Mock implementation for create on User model
prismaMock.user.create.mockImplementation(async (args: any) => {
  const { name, email, password } = args.data;
  const newUser: User = {
    id: `mock-${mockUsers.length + 1}`,
    name,
    email,
    password,
    // Set required fields with defaults
    contracts: [],
    gmailConnection: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
  mockUsers.push(newUser);
  return newUser;
});
