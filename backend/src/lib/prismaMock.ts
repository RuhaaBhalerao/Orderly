import { PrismaClient, User } from '@prisma/client';

// In-memory store for mock users
const mockUsers: User[] = [];

// Simple mock without Jest
export const prismaMock = {
  user: {
    findUnique: async (args: any) => {
      const { email, id } = args?.where || {};
      if (email) {
        return mockUsers.find((u) => u.email === email) || null;
      }
      if (id) {
        return mockUsers.find((u) => u.id === id) || null;
      }
      return null;
    },
    create: async (args: any) => {
      const { name, email, password } = args.data;
      const newUser: User = {
        id: `mock-${mockUsers.length + 1}`,
        name,
        email,
        password,
        contracts: [],
        gmailConnection: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockUsers.push(newUser);
      return newUser;
    },
  },
} as any;

export function resetMocks() {
  mockUsers.length = 0;
}
