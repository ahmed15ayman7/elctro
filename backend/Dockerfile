# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
# هنستخدم alpine في كل المراحل عشان نضمن التوافق
FROM node:20-alpine AS deps
# تثبيت المكتبات اللازمة لـ Prisma على Alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# توليد الـ Client والـ Build
RUN npx prisma generate
RUN npm run build

# ─── Stage 3: Production Runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runtime
# تكرار تثبيت المكتبات هنا لضمان عمل الـ Engine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# إنشاء مستخدم غير جذر (Non-root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# نسخ ملفات الـ Production فقط
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# نسخ المخرجات والملفات الضرورية
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# حل مشكلة الـ Permissions والـ Engines
RUN chmod +x docker-entrypoint.sh && \
    chown -R expressjs:nodejs /app

# التبديل للمستخدم لضمان الأمان
USER expressjs

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]