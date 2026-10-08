import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    // Signup and password-reset arguments contain credentials.
    serverFunctions: false,
  },
};

export default nextConfig;
