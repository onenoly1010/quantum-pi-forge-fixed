/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Next.js 16
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
