import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

// Middleware
app.use(logger());
app.use(
  cors({
    origin: [
      "https://awgyms.com",
      "https://www.awgyms.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check
app.get("/health", (c) => 
  c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: env.isProduction ? "production" : "development",
  })
);

// tRPC API
app.use("/api/trpc/*", async (c) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext,
      onError: ({ path, error }) => {
        console.error(`[tRPC Error] ${path}:`, error);
      },
    });
  } catch (error) {
    console.error("[API Error]", error);
    return c.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

// 404 fallback for API
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Production server
if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = env.port;
  serve({ fetch: app.fetch, port }, () => {
    console.log(`🚀 Server running at http://localhost:${port}/`);
    console.log(`📡 tRPC API at http://localhost:${port}/api/trpc`);
    console.log(`✅ Database connected`);
    console.log(`🌍 CORS enabled for awgyms.com`);
  });
}
