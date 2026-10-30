// Environment variables configuration
// Next.js automatically loads .env files, but we need to validate and expose them

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '',
} as const;

// Validate required environment variables
if (!env.apiUrl) {
  console.warn('Warning: API_URL or NEXT_PUBLIC_API_URL is not set in environment variables');
}

export default env;
