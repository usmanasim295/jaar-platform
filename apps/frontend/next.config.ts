import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  devIndicators: false,
  // Ensure static assets are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Ensure proper handling of static files
  trailingSlash: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
