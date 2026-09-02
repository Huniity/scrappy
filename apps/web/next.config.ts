import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.viralagenda.com",
      },
      {
        protocol: "https",
        hostname: "bolimg.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
