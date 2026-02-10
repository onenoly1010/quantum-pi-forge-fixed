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
  // Move outputFileTracingExcludes out of experimental (Next.js 16+ requirement)
  outputFileTracingExcludes: {
    "*": ["pi-forge-quantum-genesis/**/*", "contracts/**/*", "docs/**/*"],
  },
  // Turbopack configuration
  turbopack: {
    root: ".",
  },
  // Webpack configuration to exclude submodule
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        "**/pi-forge-quantum-genesis/**",
        "**/node_modules/**",
        "**/contracts/**",
        "**/docs/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
