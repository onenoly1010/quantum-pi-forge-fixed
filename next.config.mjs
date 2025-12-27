/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for Vercel deployment
  images: {
    unoptimized: true,
  },
  // Exclude submodules and non-Next.js directories from TypeScript checking
  typescript: {
    // Skip type checking for submodule files
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude directories from file tracing
  experimental: {
    outputFileTracingExcludes: {
      '*': ['pi-forge-quantum-genesis/**/*', 'contracts/**/*'],
    },
  },
  // Webpack configuration to exclude submodule
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/pi-forge-quantum-genesis/**', '**/node_modules/**', '**/contracts/**'],
    };
    return config;
  },
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude pi-forge-quantum-genesis submodule from compilation
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/pi-forge-quantum-genesis/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
