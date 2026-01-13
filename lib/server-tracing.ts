/**
 * Server-side OpenTelemetry Tracing for Quantum Pi Forge
 * 
 * Provides distributed tracing for API routes and AI operations
 * using OpenTelemetry with AI Toolkit integration.
 */

import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { trace, SpanStatusCode, Span, context } from '@opentelemetry/api';

// Service configuration
const SERVICE_NAME = 'quantum-pi-forge-api';
const SERVICE_VERSION = '3.2.0';

// AI Toolkit OTLP endpoints
const OTLP_HTTP_ENDPOINT = process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const OTLP_GRPC_ENDPOINT = process.env.OTLP_GRPC_ENDPOINT || 'http://localhost:4317';

let provider: NodeTracerProvider | null = null;
let isInitialized = false;

/**
 * Initialize server-side OpenTelemetry tracing
 */
export function initServerTracing(): NodeTracerProvider | null {
  if (isInitialized) {
    return provider;
  }

  try {
    // Create OTLP exporter
    const exporter = new OTLPTraceExporter({
      url: OTLP_HTTP_ENDPOINT,
    });

    // Create tracer provider with resource attributes
    provider = new NodeTracerProvider({
      resource: resourceFromAttributes({
        'service.name': SERVICE_NAME,
        'service.version': SERVICE_VERSION,
        'quantum.architecture': 'Sacred Trinity API',
        'quantum.framework': 'Next.js 14 API Routes',
        'quantum.blockchain': 'Polygon',
        'consciousness.streaming': 'enabled',
      }),
      spanProcessors: [
        new BatchSpanProcessor(exporter, {
          maxQueueSize: 100,
          maxExportBatchSize: 10,
          scheduledDelayMillis: 500,
        }),
      ],
    });

    // Register the provider
    provider.register();

    // Register HTTP instrumentation for API routes
    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          requestHook: (span: Span) => {
            span.setAttribute('quantum.request_type', 'api');
          },
        }),
      ],
    });

    isInitialized = true;
    console.log('✅ Server-side OpenTelemetry tracing initialized');
    console.log(`📡 Exporting traces to: ${OTLP_HTTP_ENDPOINT}`);

    return provider;
  } catch (error) {
    console.error('❌ Failed to initialize server tracing:', error);
    return null;
  }
}

/**
 * Get the tracer for creating spans
 */
export function getServerTracer(name: string = 'quantum-pi-forge-api') {
  if (!isInitialized) {
    initServerTracing();
  }
  return trace.getTracer(name, SERVICE_VERSION);
}

/**
 * Create a traced operation wrapper
 */
export async function withTracing<T>(
  operationName: string,
  operation: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getServerTracer();
  
  return tracer.startActiveSpan(operationName, async (span) => {
    try {
      // Add custom attributes
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      
      const result = await operation(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Trace an AI model call
 */
export async function traceAICall<T>(
  modelName: string,
  operation: (span: Span) => Promise<T>,
  metadata?: {
    provider?: string;
    promptTokens?: number;
    completionTokens?: number;
    temperature?: number;
  }
): Promise<T> {
  return withTracing(
    `ai.${modelName}`,
    operation,
    {
      'ai.model': modelName,
      'ai.provider': metadata?.provider || 'unknown',
      'quantum.component': 'AI',
      ...(metadata?.promptTokens && { 'ai.prompt_tokens': metadata.promptTokens }),
      ...(metadata?.completionTokens && { 'ai.completion_tokens': metadata.completionTokens }),
      ...(metadata?.temperature && { 'ai.temperature': metadata.temperature }),
    }
  );
}

/**
 * Trace a blockchain transaction
 */
export async function traceBlockchainTransaction<T>(
  transactionType: string,
  operation: (span: Span) => Promise<T>,
  metadata?: {
    network?: string;
    tokenAddress?: string;
    amount?: string;
    walletAddress?: string;
  }
): Promise<T> {
  return withTracing(
    `blockchain.${transactionType}`,
    operation,
    {
      'blockchain.type': transactionType,
      'blockchain.network': metadata?.network || 'polygon',
      'quantum.component': 'Blockchain',
      ...(metadata?.tokenAddress && { 'blockchain.token_address': metadata.tokenAddress }),
      ...(metadata?.amount && { 'blockchain.amount': metadata.amount }),
      ...(metadata?.walletAddress && { 'blockchain.wallet': metadata.walletAddress }),
    }
  );
}

/**
 * Trace API endpoint handler
 */
export async function traceAPIHandler<T>(
  endpoint: string,
  method: string,
  handler: (span: Span) => Promise<T>
): Promise<T> {
  return withTracing(
    `api.${method.toLowerCase()}.${endpoint}`,
    handler,
    {
      'http.method': method,
      'http.route': endpoint,
      'quantum.component': 'API',
    }
  );
}

// Auto-initialize on import (for API routes)
if (typeof window === 'undefined') {
  initServerTracing();
}

export default {
  initServerTracing,
  getServerTracer,
  withTracing,
  traceAICall,
  traceBlockchainTransaction,
  traceAPIHandler,
};
