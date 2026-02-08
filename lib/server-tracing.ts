/**
 * Server-side OpenTelemetry Tracing for Quantum Pi Forge
 * 
 * Provides distributed tracing for API routes and AI operations
 * using OpenTelemetry with AI Toolkit integration.
 * 
 * Edge Runtime Compatible: Provides no-op implementations in edge runtime
 * to avoid "navigator is not defined" errors.
 */

// Check if we're in edge runtime (avoid Node.js-specific imports)
// Edge runtime is indicated by NEXT_RUNTIME environment variable or lack of Node.js APIs
const isEdgeRuntime = 
  typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge' ||
  typeof globalThis !== 'undefined' && (globalThis as any).EdgeRuntime !== undefined;

// Conditionally import Node.js-specific packages only in Node.js runtime
let resourceFromAttributes: any;
let NodeTracerProvider: any;
let SimpleSpanProcessor: any;
let BatchSpanProcessor: any;
let OTLPTraceExporter: any;
let registerInstrumentations: any;
let HttpInstrumentation: any;
let trace: any;
let SpanStatusCode: any;
let Span: any;
let context: any;

if (!isEdgeRuntime) {
  // Only import OpenTelemetry packages in Node.js runtime
  const resources = require('@opentelemetry/resources');
  const sdkTraceNode = require('@opentelemetry/sdk-trace-node');
  const otlpExporter = require('@opentelemetry/exporter-trace-otlp-proto');
  const instrumentation = require('@opentelemetry/instrumentation');
  const httpInstrumentation = require('@opentelemetry/instrumentation-http');
  const api = require('@opentelemetry/api');

  resourceFromAttributes = resources.resourceFromAttributes;
  NodeTracerProvider = sdkTraceNode.NodeTracerProvider;
  SimpleSpanProcessor = sdkTraceNode.SimpleSpanProcessor;
  BatchSpanProcessor = sdkTraceNode.BatchSpanProcessor;
  OTLPTraceExporter = otlpExporter.OTLPTraceExporter;
  registerInstrumentations = instrumentation.registerInstrumentations;
  HttpInstrumentation = httpInstrumentation.HttpInstrumentation;
  trace = api.trace;
  SpanStatusCode = api.SpanStatusCode;
  Span = api.Span;
  context = api.context;
}

// Service configuration
const SERVICE_NAME = 'quantum-pi-forge-api';
const SERVICE_VERSION = '3.2.0';

// AI Toolkit OTLP endpoints
const OTLP_HTTP_ENDPOINT = process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const OTLP_GRPC_ENDPOINT = process.env.OTLP_GRPC_ENDPOINT || 'http://localhost:4317';

let provider: any = null;
let isInitialized = false;

/**
 * Initialize server-side OpenTelemetry tracing
 * No-op in edge runtime
 */
export function initServerTracing(): any {
  if (isEdgeRuntime) {
    // Skip initialization in edge runtime
    return null;
  }

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
          requestHook: (span: any) => {
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
 * No-op in edge runtime
 */
export function getServerTracer(name: string = 'quantum-pi-forge-api') {
  if (isEdgeRuntime) {
    // Return no-op tracer in edge runtime
    return {
      startActiveSpan: (name: string, fn: any) => fn({ 
        setAttribute: () => {}, 
        setStatus: () => {}, 
        recordException: () => {},
        end: () => {} 
      })
    };
  }

  if (!isInitialized) {
    initServerTracing();
  }
  return trace.getTracer(name, SERVICE_VERSION);
}

/**
 * Create a traced operation wrapper
 * No-op in edge runtime
 */
export async function withTracing<T>(
  operationName: string,
  operation: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  if (isEdgeRuntime) {
    // Execute without tracing in edge runtime
    return operation({ 
      setAttribute: () => {}, 
      setStatus: () => {}, 
      recordException: () => {},
      end: () => {} 
    });
  }

  const tracer = getServerTracer();
  
  return tracer.startActiveSpan(operationName, async (span: any) => {
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
  operation: (span: any) => Promise<T>,
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
  operation: (span: any) => Promise<T>,
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
  handler: (span: any) => Promise<T>
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

// Auto-initialize on import (for API routes in Node.js runtime only)
// Skip edge runtime to avoid "navigator is not defined" errors
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && (globalThis as any).EdgeRuntime === undefined) {
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
