import type { NextConfig } from "next";
import municipalityConfiguration from "../../Scrappy/Configuration/municipalities.json";

const municipalityRedirects = Object.entries(
  municipalityConfiguration.MunicipalityCatalog.Entries,
).flatMap(([localitySlug, municipality]) => [
  {
    source: `/municipios/${localitySlug}`,
    destination: municipality.WebsiteUrl,
    permanent: false,
  },
  {
    source: `/municipio/${localitySlug}`,
    destination: municipality.WebsiteUrl,
    permanent: false,
  },
]);

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  async redirects() {
    return municipalityRedirects;
  },
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
