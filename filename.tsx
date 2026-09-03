printf '%s\n' \ 'import { Hono } from 
"hono";' \ 'import { cors } from 
"hono/cors";' \ '' \ 'const app = new 
Hono();' \ '' \ 'app.use(' \ ' "/*",' \ ' 
cors({' \ ' origin: (origin) => {' \ ' if 
(!origin) return "*";' \ ' if (' \ ' 
origin === "https://awgyms.com" ||' \ ' 
origin.endsWith(".netlify.app") ||' \ ' 
origin.endsWith(".vercel.app") ||' \ ' 
origin.startsWith("http://localhost:")' \ 
' ) {' \ ' return origin;' \ ' }' \ ' 
return null;' \ ' },' \ ' credentials: 
true,' \ ' })' \ ');' \ '' \ 
'app.get("/api/health", (c) => {' \ ' 
return c.json({ status: "ok", timestamp: 
new Date().toISOString() });' \ '});' \ '' 
\ 'app.all("/api/*", (c) => c.json({ 
error: "Not Found" }, 404));' \ '' \ 
'export default app;' > api/boot.ts

