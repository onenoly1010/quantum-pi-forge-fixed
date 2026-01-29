import { NextResponse } from 'next/server';
import { trace } from '@opentelemetry/api';

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
  const tracer = trace.getTracer('quantum-pi-forge-shields');

  return tracer.startActiveSpan('shields-badge', async (span) => {
    try {
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

      span.setAttributes({
        'shields.label': status.label,
        'shields.message': status.message,
        'shields.color': status.color,
        'quantum.operation': 'status-badge',
        'quantum.sovereignty': 'active',
      });

      span.setStatus({ code: 0 }); // OK
      return NextResponse.json(status, {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 1, message: 'Shields generation failed' });
      throw error;
    } finally {
      span.end();
    }
  });
}
