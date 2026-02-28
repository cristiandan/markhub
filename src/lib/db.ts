/**
 * Database client for Markhub.
 * Uses Prisma v7 with PostgreSQL via pg adapter.
 *
 * Pattern: Singleton to prevent connection pool exhaustion during hot reload.
 * See: https://pris.ly/d/prisma7-client-config
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Global singleton for development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * Creates a new Prisma client with pg adapter.
 * Uses DATABASE_URL from environment.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Set it in .env.local for development or in your hosting provider for production.'
    );
  }

  // Create pg pool
  const pool = new Pool({ connectionString });
  globalForPrisma.pool = pool;

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create Prisma client with adapter
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

// Export singleton instance
export const db = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
