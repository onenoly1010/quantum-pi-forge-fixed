/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/quantum-pi-forge-fixed',
  assetPrefix: '/quantum-pi-forge-fixed/',
};

export default nextConfig;
