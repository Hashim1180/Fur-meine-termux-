import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Serve static assets
  app.use("/assets/*", serveStatic({ root: "./dist/public" }));
  app.use("/public/*", serveStatic({ root: "./dist/public" }));

  // SPA fallback - serve index.html for all other routes
  app.notFound((c) => {
    try {
      const accept = c.req.header("accept") ?? "";
      if (!accept.includes("text/html")) {
        return c.json({ error: "Not Found" }, 404);
      }
      const indexPath = path.resolve(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        console.error(`❌ index.html not found at ${indexPath}`);
        return c.text("Build files not found. Run npm run build", 500);
      }
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch (error) {
      console.error("Error serving SPA:", error);
      return c.text("Internal Server Error", 500);
    }
  });

  console.log(`✅ Static files configured for ${distPath}`);
}
