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
  // Exclude directories from file tracing (moved from experimental in Next.js 16)
  outputFileTracingExcludes: {
    '*': ['pi-forge-quantum-genesis/**/*', 'contracts/**/*', 'docs/**/*'],
  },
  // Empty turbopack config silences the "webpack config with no turbopack config" error in Next.js 16
  // See: https://nextjs.org/docs/app/api-reference/next-config-js/turbopack
  // Many applications work fine under Turbopack with no configuration
  turbopack: {},
};

export default nextConfig;
