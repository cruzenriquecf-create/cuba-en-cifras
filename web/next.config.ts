import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers/OpenNext: Cache Components are temporarily disabled
  // because Next.js 16 currently has a known Worker-hang issue with this mode.
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
