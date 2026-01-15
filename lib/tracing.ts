// lib/tracing.ts - Tracing utilities and manual instrumentation helpers
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';

// Get the global tracer for manual spans
const tracer = trace.getTracer('quantum-pi-forge', '2.0.0');

export interface TraceOptions {
  operation: string;
  attributes?: Record<string, string | number | boolean>;
  kind?: SpanKind;
}

/**
 * Wrapper function to trace async operations
 */
export async function traceAsync<T>(
  options: TraceOptions,
  fn: () => Promise<T>
): Promise<T> {
  const { operation, attributes = {}, kind = SpanKind.INTERNAL } = options;
  
  return tracer.startActiveSpan(operation, { kind, attributes }, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Wrapper function to trace sync operations
 */
export function traceSync<T>(
  options: TraceOptions,
  fn: () => T
): T {
  const { operation, attributes = {}, kind = SpanKind.INTERNAL } = options;
  
  return tracer.startActiveSpan(operation, { kind, attributes }, (span) => {
    try {
      const result = fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to current active span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>) {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      activeSpan.setAttributes({ [key]: value });
    });
  }
}

/**
 * Record an event in the current active span
 */
export function recordSpanEvent(name: string, attributes?: Record<string, string | number | boolean>) {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.addEvent(name, attributes);
  }
}

/**
 * Set span status and message
 */
export function setSpanStatus(code: SpanStatusCode, message?: string) {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setStatus({ code, message });
  }
}

/**
 * Create a child span from current context
 */
export function createChildSpan(name: string, attributes?: Record<string, string | number | boolean>) {
  return tracer.startSpan(name, { attributes });
}

/**
 * Get the current trace ID for logging correlation
 */
export function getCurrentTraceId(): string {
  const activeSpan = trace.getActiveSpan();
  return activeSpan?.spanContext().traceId || 'no-trace';
}

/**
 * Get the current span ID for logging correlation
 */
export function getCurrentSpanId(): string {
  const activeSpan = trace.getActiveSpan();
  return activeSpan?.spanContext().spanId || 'no-span';
}