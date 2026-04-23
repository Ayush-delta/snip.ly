import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  turbopack: {},

  webpack: isDev
    ? (config) => {
        config.cache = {
          type: "filesystem",
          buildDependencies: { config: [__filename] },
        };
        return config;
      }
    : undefined,

  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/:code",
          destination: `${backendUrl}/:code`,
        },
      ],
    };
  },
};

export default nextConfig;

