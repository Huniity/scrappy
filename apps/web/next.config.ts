import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
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
      {
        protocol: "https",
        hostname: "backend.museusemonumentos.pt",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
