// Environment variables configuration
// Next.js automatically loads .env files, but we need to validate and expose them

// Ensure baseURL always has a trailing slash so axios joins relative paths correctly.
// e.g. baseURL="/api/proxy/" + "api/logs" → "/api/proxy/api/logs"
// Falls back to "/api/proxy/" so it works on Vercel even if the env var is not set.
const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '/api/proxy';

export const env = {
  apiUrl: rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`,
} as const;

export default env;
