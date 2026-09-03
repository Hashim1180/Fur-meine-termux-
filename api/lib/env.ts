import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string, defaultValue: string = ""): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  // Application
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  
  // Database
  databaseUrl: required("DATABASE_URL"),
  
  // Server
  port: parseInt(optional("PORT", "3000")),
  
  // Features
  enableCors: process.env.ENABLE_CORS !== "false",
  corsOrigin: optional(
    "CORS_ORIGIN",
    "https://awgyms.com,https://www.awgyms.com,http://localhost:3000"
  ),
} as const;

// Validate on startup
if (env.isProduction) {
  const required_vars = ["APP_ID", "APP_SECRET", "DATABASE_URL"];
  const missing = required_vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ All required environment variables configured");
}
