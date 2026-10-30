const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const env = {
  // Ensure trailing slash so axios joins relative paths correctly
  apiUrl: rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`,
} as const;

export default env;
