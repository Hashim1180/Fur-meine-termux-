# AW GYMS 2.0 — production image (Bun + Next.js standalone + Caddy gateway)
FROM oven/bun:1 AS base
WORKDIR /app

# 1. Install deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# 2. Copy source
COPY . .

# 3. Build the DB + the Next.js standalone bundle
RUN bun run db:generate && bun run build

# 4. Runtime stage
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/db/custom.db"
ENV PORT=3000

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Persist DB + uploaded media across restarts
VOLUME ["/app/db", "/app/public/media"]

# Push schema into the mounted volume on first boot
CMD ["sh", "-c", "bun run db:push --accept-data-loss && node server.js"]

EXPOSE 3000
