# ─── Stage 1: Install all dependencies ───────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
# Install ALL deps (including dev) so we can compile TypeScript
RUN npm install

# ─── Stage 2: Build (prisma generate + tsc) ───────────────────────────────────
FROM deps AS build
WORKDIR /app

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run db:generate
RUN npm run build

# ─── Stage 3: Production runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Only install production dependencies in final image
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy compiled output and generated Prisma client
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma

# Startup script: run migrations then start the server
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
