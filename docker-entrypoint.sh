#!/bin/sh
set -e

DEFAULT_API_URL="https://deal-believed-reforms-employ.trycloudflare.com"
RUNTIME_URL="${NEXT_PUBLIC_API_URL:-$DEFAULT_API_URL}"

echo "[entrypoint] NEXT_PUBLIC_API_URL = $RUNTIME_URL"

# Replace placeholder with the runtime value throughout the built bundle
find /app/.next/static /app/.next/server -type f \( -name "*.js" -o -name "*.json" \) 2>/dev/null | \
  xargs -r sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$RUNTIME_URL|g"
sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$RUNTIME_URL|g" /app/server.js 2>/dev/null || true

# Start Next.js in the background on port 3000
node /app/server.js &

# Start nginx in the foreground (keeps the container alive)
exec nginx -g "daemon off;"
