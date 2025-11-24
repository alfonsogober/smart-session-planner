/**
 * Prisma client singleton instance
 * Ensures only one instance is created across the application
 */
import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL uses absolute path for SQLite
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  if (dbUrl.startsWith("file:")) {
    const dbPath = dbUrl.replace("file:", "");
    // If relative path, make it absolute relative to project root
    if (!path.isAbsolute(dbPath)) {
      return `file:${path.resolve(process.cwd(), dbPath)}`;
    }
  }
  return dbUrl;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

