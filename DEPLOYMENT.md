# AW GYMS 2.0 — Deployment Guide

A full-stack Next.js 16 monolith (App Router + Prisma/SQLite + z-ai-web-dev-sdk).
Frontend, API, AI, and admin all ship from one process on port `3000`.
Behind the included Caddy gateway, the only externally exposed port is `80/443`.

---

## 0. Architecture at a glance

```
                 ┌──────────────────────────────────────────────┐
   Browser  ───► │  Caddy (443)  ──reverse_proxy──►  Next.js :3000 │
                 │                       (App Router + API routes) │
                 │                                  │             │
                 │                                  ├─ Prisma ──► SQLite (file)│
                 │                                  ├─ /api/chat ► z-ai-web-dev-sdk (LLM)│
                 │                                  └─ /public/media (uploads)│
                 └──────────────────────────────────────────────┘
```

- **Frontend**: `/` — single immersive route (preloader → cinematic intro → site).
- **Admin**: same `/` route, gated fullscreen overlay (⌘K or `?admin=1`). No extra routes.
- **API**: `/api/*` — products, events, settings, media, chat, admin CRUD, telemetry, bulk-sync.
- **DB**: SQLite file at `db/custom.db` (env `DATABASE_URL=file:...`).
- **Media**: uploaded files land in `public/media/{photos,videos,audio}/`.

---

## 1. Prerequisites

- Node.js 20+ **or** Bun 1.1+ (recommended: Bun)
- The `z-ai-web-dev-sdk` credentials are already wired into the runtime — no extra env keys needed in this sandbox. On your own host, ensure the SDK's auth is available (see §4).
- (Optional) `ffmpeg` only if you re-transcode media — current assets are already web-safe H.264.

---

## 2. Environment variables

Create `.env` at the project root:

```env
DATABASE_URL="file:./db/custom.db"
# If you move to Postgres/Neon/Supabase instead of SQLite:
# DATABASE_URL="postgresql://user:pass@host:5432/awgyms?schema=public"
```

All operational settings (WhatsApp number, USD/AED conversion rates, announcement bar, brand name, Sketchfab URL, admin password) are stored **in the database** and editable live from the admin **Settings** panel — **no redeploy needed**.

---

## 3. First-time setup (any host)

```bash
# 1. Install deps
bun install            # or: npm install / pnpm install

# 2. Push the DB schema + seed researched PKR rates
bun run db:push
bun run db:seed

# 3. Run
bun run dev            # dev (port 3000, hot reload)
bun run build && bun run start   # production
```

Default admin login: **`admin`** / **`awgyms2026`** (change it from the admin Settings panel immediately).

---

## 4. Deployment targets

### A. Vercel (easiest — all-in-one)

Vercel runs Next.js natively. **Caveat**: Vercel's serverless filesystem is read-only except `/tmp`, so SQLite + uploaded media won't persist across invocations. Use this target **only** if you also move the DB to Neon/Supabase and media to an object store (S3/R2/Cloudinary).

```bash
# 1. Push repo to GitHub.
# 2. Import into Vercel.
# 3. Env: DATABASE_URL = your Neon/Supabase connection string.
# 4. Build command: prisma generate && next build
# 5. Output: Next.js auto-detected.
```

To swap the DB driver for Postgres, change `prisma/schema.prisma`:
```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
```
and the `/api/admin/media` upload route currently writes to `public/media/...` — replace `fs.writeFile` with your S3/R2 SDK put call.

### B. Railway / Render (recommended — persistent disk + SQLite)

Both offer a persistent volume mount, so SQLite + uploaded media survive deploys and restarts.

**Railway:**
1. New project → deploy from GitHub repo.
2. Add a **Volume** mounted at `/home/z/my-project` (or wherever the app lives) so `db/custom.db` and `public/media/` persist.
3. Env: `DATABASE_URL="file:/home/z/my-project/db/custom.db"`.
4. Build: `bun install && bun run db:push && bun run db:seed && bun run build`.
5. Start: `bun run start` (or `NODE_ENV=production bun .next/standalone/server.js`).
6. Exposed port: `3000` (Railway proxies 80→3000 automatically).

**Render:**
1. New Web Service → connect repo.
2. Build: `bun install && bun run db:push && bun run db:seed && bun run build`.
3. Start: `bun run start`.
4. Add a **Disk** mounted at `/home/z/my-project` (min 1 GB; scale if you upload lots of video).
5. Env: `DATABASE_URL="file:/home/z/my-project/db/custom.db"`.

### C. VPS / Docker (full control, includes Caddy gateway)

A `Dockerfile` + `Caddyfile` are included. The Dockerfile uses the Bun base image, builds the Next.js standalone output, and runs on `3000`. Caddy terminates TLS and reverse-proxies to `3000`.

```bash
# Build + run locally with Docker
docker build -t awgyms .
docker run -p 80:80 -p 443:443 \
  -v $(pwd)/db:/app/db \
  -v $(pwd)/public/media:/app/public/media \
  -e DATABASE_URL="file:/app/db/custom.db" \
  awgyms
```

On a real VPS:
1. Point your domain's A/AAAA records at the box.
2. Edit `Caddyfile`: replace `:81` with your domain (e.g. `awgyms.pk`) — Caddy auto-provisions Let's Encrypt certs.
3. `docker compose up -d` (compose file optional; the `docker run` above works too).
4. Persist `db/` and `public/media/` via volume mounts.

### D. Split front + back (optional, advanced)

If you want a decoupled setup (e.g. a static frontend CDN + a separate API host):

- **Frontend**: `bun run build` produces `.next/standalone` + static assets. Deploy the static assets to Cloudflare Pages / Vercel static / S3+CloudFront. Set `NEXT_PUBLIC_API_BASE` to your API origin and prefix all `api-client.ts` fetches with it.
- **Backend**: Deploy the Next.js API (or extract routes to a Hono/Fastify server) to Railway/Render. Expose `/api/*`. Provision Postgres + object storage. Keep the z-ai-web-dev-sdk on this host only (never bundle into the client).
- The included Caddyfile already handles the `XTransformPort` query gateway pattern if you add sidecar mini-services.

---

## 5. Media pipeline & object storage (production hardening)

Out of the box, uploaded media is written to `public/media/{photos,videos,audio}/`. For production with multiple instances or CDN delivery:

1. Swap the `/api/admin/media` POST handler's `fs.writeFile` for your storage SDK:
   ```ts
   // e.g. S3
   await s3.putObject({ Bucket, Key: path, Body: buf, ContentType: mt })
   ```
2. Store the resulting URL in the `Media.path` column. The catalog & sections already render `path` via `<img src={m.path}>` / `<video src>`, so a full URL works transparently.
3. For HLS/DASH adaptive streaming of the cinematic videos, transcode with `ffmpeg`:
   ```bash
   ffmpeg -i facility-dark.mp4 -codec:v libx264 -profile:v high -level 4.0 \
     -start_number 0 -hls_time 6 -hls_list_size 0 -f hls facility-dark.m3u8
   ```
   Then point the `<video src>` at the `.m3u8` and add an `hls.js` loader.

---

## 6. Operations

- **Live updates**: open `/?admin=1` (or press ⌘K) → authenticate → edit products, events, media, settings. Everything is live instantly — **no rebuild, no redeploy**.
- **Bulk sync**: admin → Products → BULK SYNC → paste CSV with columns `name,category,tagline,description,pricePKR,badges,image,video,rating`. Submit → upserts by name.
- **Backups**: snapshot the `db/custom.db` file and `public/media/` directory on a schedule (cron + `sqlite3 .backup` is sufficient at this scale).
- **Telemetry**: admin → Telemetry tab shows live counts, inventory value (PKR + USD + AED), and session sparklines.

---

## 7. z-ai-web-dev-sdk notes

- The SDK is imported only in `/api/chat` (server route) — never in client code.
- It powers the ARIA AI Sales Closer: multi-turn conversation, PKR price quoting, negotiated 5–7% Insider discount, checkout-token → invoice generation → WhatsApp handoff.
- `thinking: { type: "disabled" }` is set for low-latency sales replies.
- No API key env is required in this sandbox; on your own host, ensure the SDK's credential bootstrap is present (it reads from the runtime environment).

---

## 8. Health checklist after deploy

- [ ] `GET /` returns 200 and the preloader animates → intro → site.
- [ ] `GET /api/products` → JSON with 7 products, PKR prices.
- [ ] `GET /api/events` → JSON with 3 events, ISO dates.
- [ ] Currency switch (PKR/USD/AED) updates all prices live.
- [ ] ⌘K opens the admin command palette; `awgyms2026` authenticates.
- [ ] Admin → Media → upload a photo → it appears in the catalog image picker.
- [ ] Admin → Settings → change announcement → it scrolls in the site header bar live.
- [ ] ARIA chat: ask "I want the whey in Lahore" → it quotes Rs 36,855 → checkout → invoice → WhatsApp link.

---

© AW GYMS. Engineered in Pakistan.
