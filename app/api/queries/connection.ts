import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;
let pool: any = null;

export async function getDb() {
  if (!instance) {
    try {
      // Create connection pool for better performance
      pool = createPool({
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelayMs: 0,
        uri: env.databaseUrl,
      });

      // Test connection
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      instance = drizzle(pool, {
        mode: "planetscale",
        schema: fullSchema,
        logger: env.isDevelopment,
      });

      console.log("✅ Database connection established");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  return instance;
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (pool) {
    await pool.end();
    console.log("Database pool closed");
  }
});
