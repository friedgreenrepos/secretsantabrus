import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Picks up .env.local the same way `next dev` does.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations go over a direct connection when Neon provides one (DDL through the pooler is fragile).
  dbCredentials: { url: (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)! },
});
