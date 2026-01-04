import { NextResponse } from 'next/server';

// Service configuration from environment variables
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';
const GRADIO_URL = process.env.GRADIO_URL || 'http://localhost:7860';
const HEALTH_CHECK_TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10);

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  url: string;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

interface AgentHealthResponse {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'unavailable';
  services: {
    fastapi: ServiceHealth;
    flask: ServiceHealth;
    gradio: ServiceHealth;
  };
}

/**
 * Check health of a single service
 */
async function checkServiceHealth(
  name: string,
  url: string,
  endpoint: string = '/health'
): Promise<ServiceHealth> {
  const startTime = Date.now();
  const lastChecked = new Date().toISOString();

  try {
    // Remove trailing slash from URL and construct full endpoint
    const fullUrl = `${url.replace(/\/$/, '')}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Quantum-Pi-Forge/1.0',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        name,
        status: 'healthy',
        url,
        responseTime,
        lastChecked,
      };
    } else {
      return {
        name,
        status: 'unhealthy',
        url,
        responseTime,
        lastChecked,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `Timeout after ${HEALTH_CHECK_TIMEOUT}ms`;
      } else {
        errorMessage = error.message;
      }
    }

    return {
      name,
      status: 'unhealthy',
      url,
      responseTime,
      lastChecked,
      error: errorMessage,
    };
  }
}

/**
 * Determine overall system status based on individual service health
 */
function calculateOverallStatus(services: {
  fastapi: ServiceHealth;
  flask: ServiceHealth;
  gradio: ServiceHealth;
}): 'healthy' | 'degraded' | 'unavailable' {
  const healthyCount = Object.values(services).filter(
    (s) => s.status === 'healthy'
  ).length;

  if (healthyCount === 3) {
    return 'healthy';
  } else if (healthyCount > 0) {
    return 'degraded';
  } else {
    return 'unavailable';
  }
}

/**
 * GET /api/agent-health
 * 
 * Aggregate health check endpoint for all agent services.
 * Returns health status of FastAPI, Flask, and Gradio services.
 */
export async function GET() {
  try {
    // Check all services in parallel for efficiency
    const [fastapiHealth, flaskHealth, gradioHealth] = await Promise.all([
      checkServiceHealth('FastAPI Quantum Conduit', FASTAPI_URL, '/health'),
      checkServiceHealth('Flask Glyph Weaver', FLASK_URL, '/health'),
      checkServiceHealth('Gradio Truth Mirror', GRADIO_URL, '/'),
    ]);

    const services = {
      fastapi: fastapiHealth,
      flask: flaskHealth,
      gradio: gradioHealth,
    };

    const response: AgentHealthResponse = {
      timestamp: new Date().toISOString(),
      overallStatus: calculateOverallStatus(services),
      services,
    };

    // Set appropriate cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Agent health check error:', error);

    // Return error response but still provide structure
    const errorResponse: AgentHealthResponse = {
      timestamp: new Date().toISOString(),
      overallStatus: 'unavailable',
      services: {
        fastapi: {
          name: 'FastAPI Quantum Conduit',
          status: 'unknown',
          url: FASTAPI_URL,
          lastChecked: new Date().toISOString(),
          error: 'Health check failed',
        },
        flask: {
          name: 'Flask Glyph Weaver',
          status: 'unknown',
          url: FLASK_URL,
          lastChecked: new Date().toISOString(),
          error: 'Health check failed',
        },
        gradio: {
          name: 'Gradio Truth Mirror',
          status: 'unknown',
          url: GRADIO_URL,
          lastChecked: new Date().toISOString(),
          error: 'Health check failed',
        },
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  }
}
