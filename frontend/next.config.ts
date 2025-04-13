import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  
  // Enable Vercel Analytics
  analytics: {
    vercelAnalytics: {
      enabled: true,
    },
  },
};

export default nextConfig;
