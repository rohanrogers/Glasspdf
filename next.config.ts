import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  output: 'export',
  serverExternalPackages: ['pdfjs-dist'],
  turbopack: {},
};

export default nextConfig;
