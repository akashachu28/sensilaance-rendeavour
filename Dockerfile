# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with the placeholder so the entrypoint can swap it at runtime.
# Do NOT use the real URL here — it gets replaced when the container starts.
ENV NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL_PLACEHOLDER__
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Default API URL — overridable at runtime via -e NEXT_PUBLIC_API_URL=...
ENV NEXT_PUBLIC_API_URL=https://deal-believed-reforms-employ.trycloudflare.com

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# Copy entrypoint — must be owned by root to run sed, then drops to nextjs
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
