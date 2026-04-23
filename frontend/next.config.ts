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
};

export default nextConfig;

