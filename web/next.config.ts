import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Cloudflare/OpenNext runtime on the stable Next.js rendering path.
  // The experimental cache-components + partial-prefetching combination was
  // enabled during troubleshooting and is not required by this application.
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
