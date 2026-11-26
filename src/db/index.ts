import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one client across hot reloads in dev and across invocations on Vercel.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    // Neon's pooler (PgBouncer) does not support prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 1 : 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
export * from "./schema";
