import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // standalone only needed for Docker production builds, skip in dev (saves RAM + compile time)
  ...(isDev ? {} : { output: "standalone" }),

  images: {
    remotePatterns: [],
  },

  // Turbopack config — do NOT set root, it causes full directory scanning
  turbopack: {},

  // Limit webpack memory usage in dev to prevent RAM spikes
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

