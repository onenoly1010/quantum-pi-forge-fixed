/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for Vercel deployment
  images: {
    unoptimized: true,
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude directories from file tracing
  experimental: {
    outputFileTracingExcludes: {
      '*': ['pi-forge-quantum-genesis/**/*', 'contracts/**/*', 'docs/**/*'],
    },
  },
  // Webpack configuration to exclude submodule
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/pi-forge-quantum-genesis/**', '**/node_modules/**', '**/contracts/**', '**/docs/**'],
    };
    return config;
  },
};

export default nextConfig;
