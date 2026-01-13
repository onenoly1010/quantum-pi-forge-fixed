import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const SERVICE_NAME = 'quantum-pi-forge-frontend';
const SERVICE_VERSION = '3.2.0';

// AI Toolkit OTLP endpoint
const OTLP_ENDPOINT = process.env.NEXT_PUBLIC_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

let tracerProvider: WebTracerProvider | null = null;

export function initTracing() {
  if (typeof window === 'undefined') return;
  
  // Prevent double initialization
  if (tracerProvider) return;

  const exporter = new OTLPTraceExporter({
    url: OTLP_ENDPOINT,
  });

  tracerProvider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      'service.version': SERVICE_VERSION,
      'quantum.architecture': 'Sacred Trinity Frontend',
      'quantum.framework': 'Next.js 14',
      'quantum.ui_library': 'React 18 + shadcn/ui',
      'consciousness.streaming': 'enabled',
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  tracerProvider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    tracerProvider: tracerProvider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.+/g], // Propagate trace headers to all CORS URLs
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request, response) => {
          // Add custom attributes for Sacred Trinity integration
          span.setAttribute('quantum.request_type', 'frontend_fetch');
          if (request instanceof Request) {
            span.setAttribute('quantum.endpoint', request.url);
          }
        },
      }),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit', 'change', 'focus', 'blur'],
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [/.+/g],
      }),
    ],
  });

  console.log('✅ OpenTelemetry tracing initialized for Quantum Pi Forge frontend');
  console.log(`📡 Exporting traces to: ${OTLP_ENDPOINT}`);
}

/**
 * Get the tracer for custom span creation
 */
export function getTracer(name: string = 'quantum-pi-forge') {
  if (!tracerProvider) {
    initTracing();
  }
  return tracerProvider?.getTracer(name, SERVICE_VERSION);
}

/**
 * Create a custom span for tracking specific operations
 */
export function createSpan(name: string, attributes?: Record<string, string | number | boolean>) {
  const tracer = getTracer();
  if (!tracer) return null;
  
  const span = tracer.startSpan(name);
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
  return span;
}

/**
 * Track wallet connection events
 */
export function traceWalletConnection(address: string, networkId: number) {
  const span = createSpan('wallet.connect', {
    'wallet.address': address,
    'wallet.network_id': networkId,
    'quantum.component': 'MetaMask',
  });
  span?.end();
}

/**
 * Track staking transaction events
 */
export function traceStakingTransaction(amount: string, status: 'pending' | 'success' | 'failed') {
  const span = createSpan('staking.transaction', {
    'staking.amount': amount,
    'staking.status': status,
    'quantum.component': 'GaslessStaking',
  });
  span?.end();
}

/**
 * Track page navigation events
 */
export function tracePageNavigation(route: string) {
  const span = createSpan('navigation.route', {
    'navigation.route': route,
    'quantum.component': 'NextRouter',
  });
  span?.end();
}
