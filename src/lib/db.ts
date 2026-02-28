/**
 * Database client for Markhub.
 * Uses Prisma with PostgreSQL.
 *
 * TODO: Uncomment after P1-08 (Prisma setup)
 */

// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
//
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Placeholder export until Prisma is configured
export const db = null;
