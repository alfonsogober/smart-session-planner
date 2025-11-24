import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@prisma/client'],
  turbopack: {},
};

export default nextConfig;
