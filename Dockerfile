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
ENV NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL_PLACEHOLDER__
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner stage (Next.js + nginx in one container) ----
FROM node:20-alpine AS runner
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Default API URL — override with -e NEXT_PUBLIC_API_URL=... at docker run
ENV NEXT_PUBLIC_API_URL=https://deal-believed-reforms-employ.trycloudflare.com

# Copy Next.js standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# nginx needs these dirs
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx

EXPOSE 80
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
