import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // produces .next/standalone for Docker
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
