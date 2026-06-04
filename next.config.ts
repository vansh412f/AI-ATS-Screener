import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  logging: {
    serverFunctions: false, // Disables the massive Server Action argument logs
  },
};

export default nextConfig;