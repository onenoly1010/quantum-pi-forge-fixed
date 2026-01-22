"""
OpenTelemetry Tracing Setup for Quantum Pi Forge Python Components
"""

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.web3 import Web3Instrumentor
import os

def init_tracing(service_name: str = "quantum-pi-forge-python"):
    """Initialize OpenTelemetry tracing for Python components"""

    # Create resource
    resource = Resource(attributes={
        "service.name": service_name,
        "service.version": "3.2.0",
        "quantum.architecture": "Sacred Trinity Python",
        "quantum.component": "AI Guardian",
    })

    # Create tracer provider
    provider = TracerProvider(resource=resource)

    # Create OTLP exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://localhost:4318/v1/traces",
    )

    # Add span processor
    processor = BatchSpanProcessor(otlp_exporter)
    provider.add_span_processor(processor)

    # Set global tracer provider
    trace.set_tracer_provider(provider)

    # Instrument libraries
    RequestsInstrumentor().instrument()
    Web3Instrumentor().instrument()

    print(f"✅ Python OpenTelemetry tracing initialized for {service_name}")
    print("📡 Exporting traces to: http://localhost:4318/v1/traces"

    return provider

def get_tracer(name: str = "quantum-pi-forge-python"):
    """Get a tracer for creating spans"""
    return trace.get_tracer(name)</content>
<parameter name="filePath">c:\Users\Colle\Downloads\quantum-pi-forge-fixed\lib\tracing.py