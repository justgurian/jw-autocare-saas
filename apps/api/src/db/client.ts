import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

// Extend PrismaClient with logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.env === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Log queries in development
if (config.env === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

if (config.env !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper to set tenant context for RLS
export async function setTenantContext(tenantId: string): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);
}

// Helper to clear tenant context
export async function clearTenantContext(): Promise<void> {
  await prisma.$executeRawUnsafe(`RESET app.current_tenant_id`);
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
