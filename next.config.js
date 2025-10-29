/** @type {import('next').NextConfig} */
const nextConfig = {
  // برای Vercel Blob — storeId رو بعداً از dashboard Vercel می‌گیریم
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
  // hostname برای blob (بعداً ست می‌کنیم)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
