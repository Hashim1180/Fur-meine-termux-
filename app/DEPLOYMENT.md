# AW GYMS — Server Transport & Migration Guide

Complete guide to moving this project between environments with **zero data loss**.

---

## 1. Architecture

```
awgyms/
├── src/            React 19 + Tailwind frontend (Vite)
├── api/            Hono + tRPC backend (Node.js)
├── db/             Drizzle ORM schema + seed (MySQL / PlanetScale-compatible)
├── contracts/      Shared frontend↔backend types
├── public/assets/  Videos (intro.mp4 = 6569), product images, ambient audio
├── .env            Environment variables (never commit)
└── Dockerfile      Single-container deployment
```

**Ports:** everything runs on `:3000` — the Hono server serves the built frontend
and the tRPC API (`/api/trpc/*`) from one process.

---

## 2. Environment Variables

| Variable       | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `DATABASE_URL` | MySQL connection string (external/hosted)          |
| `APP_ID`       | App identifier (portal-issued)                     |
| `APP_SECRET`   | Signs admin session tokens — keep secret           |
| `PORT`         | Optional, defaults to 3000                         |

> The database is **external** (hosted MySQL). No data lives inside the container,
> so containers are disposable — redeploys never touch product/rate data.

---

## 3. Deploy: Railway / Render (recommended, Docker)

1. Push this folder to a Git repo.
2. Railway: **New Project → Deploy from Repo** — it auto-detects the `Dockerfile`.
3. Add env vars from your local `.env` in the Railway **Variables** tab.
4. Set the generated domain (e.g. `awgyms.up.railway.app`) as your custom domain
   (`awgyms.com`) via CNAME in your DNS provider.
5. First deploy only: run the seed once to populate products/events —
   Railway shell → `npx tsx db/seed.ts` (safe to re-run; it resets catalog data).

Render: **New → Web Service → Docker**, same env vars, same one-time seed.

## 4. Deploy: Vercel (frontend) + Railway (backend)

1. Deploy the repo to Railway as above — this is your API + full app.
2. If you want Vercel's edge CDN for the frontend only:
   - `npm run build` → deploy `dist/public` to Vercel as a static project.
   - Add a Vercel rewrite: `/api/* → https://your-railway-domain/api/*`
     (`vercel.json`: `{ "rewrites": [{ "source": "/api/:path*", "destination": "https://your-railway-domain/api/:path*" }] }`).

## 5. Deploy: Single Linux VPS (Docker or PM2)

**Docker (simplest):**
```bash
docker build -t awgyms .
docker run -d --name awgyms -p 3000:3000 --env-file .env --restart unless-stopped awgyms
```

**PM2 (no Docker):**
```bash
npm ci && npm run build
pm2 start "npm start" --name awgyms
pm2 save && pm2 startup
```
Put Nginx in front with a reverse proxy to `127.0.0.1:3000` + Certbot SSL.

## 6. Database Migration / Switching Hosts

1. **Export** from old host: `mysqldump -h OLD -u user -p dbname > aw_backup.sql`
2. **Import** to new host: `mysql -h NEW -u user -p dbname < aw_backup.sql`
3. Update `DATABASE_URL` in the new environment → restart. Done.
4. Schema changes: edit `db/schema.ts` → `npm run db:push` (dev) or
   `npm run db:generate && npm run db:migrate` (production).
   Never use `db:push --force` — it can drop columns.

## 7. Admin Console

- URL: `/admin` · Default user: `admin` · Default password: `awgyms2026`
  (**change it immediately** in Admin → Settings → New Admin Password).
- Products: full CRUD + one-click **Quick Rate Update** (PKR) per row.
- Events: add/edit/delete/archive; countdowns auto-archive at zero and the next
  event is promoted automatically.
- Settings: WhatsApp number, USD/AED conversion rates, announcement bar,
  admin password — all live instantly, no redeploy.

## 8. Routine Ops

- **Update a rate:** Admin → Products → type new PKR in the row → SET.
- **New 15-day course:** Admin → Events → New Event → set date — the frontend
  countdown, progress bar and archiving handle themselves.
- **Backup:** nightly `mysqldump` cron of the external database.
