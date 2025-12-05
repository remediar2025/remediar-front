import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ["hebbkdanhl1syf.public.blob.vercel-storage.com"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_API_URL: 'https://remediar-api.mgioqc.easypanel.host/api',
  }
};


export default nextConfig;
