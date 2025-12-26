/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for Vercel deployment
  images: {
    unoptimized: true,
  },
  // Removed basePath and assetPrefix - not needed for Vercel
  // These were for GitHub Pages static export
};

export default nextConfig;
