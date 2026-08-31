import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === 'test') {
  const { prismaMock } = await import('./prismaMock.js');
  prismaInstance = prismaMock as unknown as PrismaClient;
} else {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
