import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prismaInstance: PrismaClient;

// Initialize Prisma Client
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  });
}

prismaInstance = globalForPrisma.prisma;

export const prisma = prismaInstance;
