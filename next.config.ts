import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "replicate"],
  outputFileTracingIncludes: {
    "/api/relicario/enhance": ["./public/reli.png"],
  },
};

export default nextConfig;
