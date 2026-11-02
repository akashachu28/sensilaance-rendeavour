#!/bin/sh
set -e

# Default value used both at build time (as placeholder) and runtime fallback
DEFAULT_API_URL="https://deal-believed-reforms-employ.trycloudflare.com"

# Use runtime env if set, otherwise fall back to default
RUNTIME_URL="${NEXT_PUBLIC_API_URL:-$DEFAULT_API_URL}"

echo "[entrypoint] NEXT_PUBLIC_API_URL = $RUNTIME_URL"

# Replace the build-time placeholder with the runtime value throughout the bundle.
# The placeholder __NEXT_PUBLIC_API_URL_PLACEHOLDER__ was baked in during build.
find /app/.next/static /app/.next/server -type f \( -name "*.js" -o -name "*.json" \) 2>/dev/null | \
  xargs -r sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$RUNTIME_URL|g"

# Also patch server.js if it references the placeholder
sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$RUNTIME_URL|g" /app/server.js 2>/dev/null || true

exec node server.js
