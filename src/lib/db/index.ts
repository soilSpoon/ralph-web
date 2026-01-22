import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

let pgliteSingleton: PGlite | null = null;
let dbSingleton: ReturnType<typeof drizzle<typeof schema>> | null = null;

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITEST;

/**
 * Get DB instance (singleton)
 * Returns null during build to avoid PGlite/FS issues in restricted environments
 */
export async function getDB(options: { forceNew?: boolean } = {}) {
  if (isBuild) {
    console.log("[DB] Build phase: skipping DB initialization");
    return null;
  }

  if (dbSingleton && !options.forceNew) return dbSingleton;

  // Use in-memory DB for tests to ensure isolation and speed
  const dbPath = isTest
    ? ":memory:"
    : path.resolve(process.cwd(), ".ralph", "pgdata");

  console.log(
    `[DB] Initializing PGlite at: ${dbPath}${options.forceNew ? " (forced new instance)" : ""}`,
  );

  if (options.forceNew && pgliteSingleton) {
    await pgliteSingleton.close();
    pgliteSingleton = null;
    dbSingleton = null;
  }

  if (!pgliteSingleton) {
    pgliteSingleton = new PGlite(dbPath);
  }
  dbSingleton = drizzle(pgliteSingleton, { schema });

  try {
    const migrationsPath = `${process.cwd()}/drizzle`;
    // Only log migrations if not in test to keep output clean
    if (!isTest) {
      console.log(`[DB] Running migrations from: ${migrationsPath}`);
    }
    await migrate(dbSingleton, { migrationsFolder: migrationsPath });
    if (!isTest) {
      console.log("[DB] Migrations completed");
    }
  } catch (error) {
    console.error("[DB] Migration failed:", error);
  }

  return dbSingleton;
}

/**
 * Close database connection
 */
export async function closeDB() {
  if (pgliteSingleton) {
    await pgliteSingleton.close();
    pgliteSingleton = null;
    dbSingleton = null;
    console.log("[DB] Database closed");
  }
}

export * from "./schema";
