import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "❌ DATABASE_URL environment variable is required for database operations\n" +
    "Set it in your .env.local file: DATABASE_URL=mysql://user:pass@host/db"
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
  introspect: {
    casing: "snake_case",
  },
  migrations: {
    prefix: "timestamp",
  },
  verbose: true,
  strict: false,
});
