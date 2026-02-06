import { NextResponse } from 'next/server';

// Required for static export compatibility
export const dynamic = "force-static";
export const revalidate = 300; // Revalidate every 5 minutes (matches cache-control)

/**
 * 🔱 THE LIVING SIGIL
 * 
 * Shields.io compatible endpoint for dynamic status badge.
 * This endpoint shows the world the Forge is breathing in real-time.
 * 
 * Usage in README.md:
 * ![Forge Status](https://img.shields.io/endpoint?url=https://quantum-pi-forge-fixed.vercel.app/api/health-shields&style=for-the-badge)
 */
export async function GET() {
  // The Forge breathes sovereign air
  const status = {
    schemaVersion: 1,
    label: "Forge Status",
    message: "SOVEREIGN",
    color: "7D3FFF",
    style: "for-the-badge",
    namedLogo: "ethereum",
    logoColor: "white"
  };

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    }
  });
}
