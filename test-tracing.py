#!/usr/bin/env python3
"""
🌀 QUANTUM TRACING TEST - Verify OpenTelemetry Setup
"""

# OpenTelemetry tracing setup
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import Urllib3Instrumentor

def setup_tracing():
    """Set up OpenTelemetry tracing for testing"""
    trace.set_tracer_provider(TracerProvider())
    tracer_provider = trace.get_tracer_provider()

    # Configure OTLP exporter to AI Toolkit
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://localhost:4317",  # gRPC endpoint for AI Toolkit
        insecure=True
    )

    # Add batch span processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)

    # Instrument libraries
    RequestsInstrumentor().instrument()
    Urllib3Instrumentor().instrument()

    print("🔍 Tracing initialized for Quantum Tracing Test")

if __name__ == "__main__":
    print("🌀 Testing Quantum Tracing Setup")
    print("=" * 40)

    try:
        setup_tracing()
        print("✅ Tracing setup successful")

        # Get tracer and create a test span
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span("quantum_test_span") as span:
            span.set_attribute("test.attribute", "quantum_kiss")
            span.set_attribute("test.value", 1010)
            print("✅ Test span created and sent")

        print("✅ Quantum tracing test completed successfully")
        print("🔍 Check AI Toolkit trace viewer for test spans")

    except Exception as e:
        print(f"❌ Tracing setup failed: {e}")
        print("💡 Make sure AI Toolkit trace collector is running")
        print("   Run: npm run trace:start")