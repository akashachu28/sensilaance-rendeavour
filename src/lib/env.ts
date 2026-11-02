// NEXT_PUBLIC_API_URL is baked at build time as a placeholder string.
// The docker-entrypoint.sh replaces __NEXT_PUBLIC_API_URL_PLACEHOLDER__
// with the real value at container startup, enabling runtime configuration.
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  '__NEXT_PUBLIC_API_URL_PLACEHOLDER__';

export const env = {
  // Ensure trailing slash so axios joins relative paths correctly
  apiUrl: rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`,
} as const;

export default env;
