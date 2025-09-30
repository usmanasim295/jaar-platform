import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  devIndicators: false,
  // Ensure static assets are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Configure public directory handling
  publicRuntimeConfig: {
    // Add any runtime config here if needed
  },
  // Ensure proper handling of static files
  trailingSlash: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  // Ensure proper handling of static assets in production
  async rewrites() {
    return [
      // Ensure translation files are accessible
      {
        source: '/locales/:path*',
        destination: '/locales/:path*',
      },
      // Ensure assets are accessible
      {
        source: '/assets/:path*',
        destination: '/assets/:path*',
      },
    ];
  },
};

export default nextConfig;
