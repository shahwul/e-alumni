# ----- Stage 1: Dependencies -----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install @prisma/client@6 prisma@6

COPY package*.json ./
COPY prisma ./prisma/

# Install @prisma/client versi 6 dan prisma CLI versi 6
RUN npm install
# Generate Prisma Client 6 khusus untuk environment Linux Alpine
RUN npx prisma generate

# ----- Stage 2: Builder -----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
# Tambahkan baris sakti ini:
ENV NEXT_FONT_GOOGLE_MOCKED=true 
ENV DATABASE_URL="postgresql://postgres:123@db:5432/db_e_alumni?schema=public"
RUN npm run build

# ----- Stage 3: Runner -----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY hasil build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- BAGIAN KRUSIAL UNTUK PRISMA ---
# Salin folder prisma (schema & migrations)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Salin binary prisma CLI agar npx bisa jalan tanpa download lagi
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# ----------------------------------

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]