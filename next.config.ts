import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  serverExternalPackages: [
    "agentdb",
    "ruvector",
    "@ruvector/ruvllm",
    "@ruvector/attention",
    "@ruvector/graph-node",
    "@ruvector/sona",
    "better-sqlite3",
    "sharp",
    "node-pty",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
