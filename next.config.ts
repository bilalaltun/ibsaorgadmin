import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"], // 👈 Firebase için
    unoptimized: true,
  },
  // Production optimizations
  output: "standalone",
  trailingSlash: false,
};

export default nextConfig;
