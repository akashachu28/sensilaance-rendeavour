// Environment variables configuration
// Next.js automatically loads .env files, but we need to validate and expose them

// Ensure baseURL always has a trailing slash so axios joins relative paths correctly.
// e.g. baseURL="/api/proxy/" + "api/logs" → "/api/proxy/api/logs"
const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';

export const env = {
  apiUrl: rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`,
} as const;

// Validate required environment variables
if (!rawUrl) {
  console.warn('Warning: NEXT_PUBLIC_API_URL is not set in environment variables');
}

export default env;
