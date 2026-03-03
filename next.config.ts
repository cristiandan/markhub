import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Image optimization
  images: {
    // Allow GitHub avatar images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
    ],
    // Use modern formats
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'react-syntax-highlighter',
      'react-markdown',
    ],
  },
};

export default nextConfig;
