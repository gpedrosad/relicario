import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "replicate"],
  outputFileTracingIncludes: {
    "/api/relicario/enhance": ["./public/relicario-colgante-plata.png"],
  },
};

export default nextConfig;
