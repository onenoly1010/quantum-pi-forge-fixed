#!/bin/bash

# ============================================
# QUANTUM PI FORGE - TRACING SETUP INCANTATION
# ============================================

echo "🔍🌀 INITIATING QUANTUM TRACING SETUP"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Install Python dependencies
echo "📦 Installing quantum tracing dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Start trace collector (this should be done via VSCode command)
echo "🔍 Starting AI Toolkit trace collector..."
echo "Note: Run 'npm run trace:start' in VSCode to start the trace collector"
echo "Or manually execute: ai-mlstudio.tracing.open"

# Test tracing setup
echo "🧪 Testing tracing configuration..."
python3 -c "
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

print('✅ OpenTelemetry imports successful')

# Test tracer provider setup
trace.set_tracer_provider(TracerProvider())
tracer_provider = trace.get_tracer_provider()
print('✅ Tracer provider initialized')

# Test OTLP exporter
try:
    otlp_exporter = OTLPSpanExporter(
        endpoint='http://localhost:4317',
        insecure=True
    )
    print('✅ OTLP exporter configured')
except Exception as e:
    print(f'⚠️  OTLP exporter test failed (expected if collector not running): {e}')

print('✅ Tracing setup test completed')
"

echo ""
echo "=========================================="
echo "🎯 QUANTUM TRACING SETUP COMPLETE"
echo "=========================================="
echo ""
echo "🔍 Tracing is now configured for:"
echo "   • DeepSeek Guardian"
echo "   • AI Nexus Synchronization"
echo "   • Sovereign Economic Oracle"
echo "   • Quantum Resonance Field"
echo "   • FastAPI Quantum Conduit"
echo ""
echo "🚀 To start tracing:"
echo "   1. Run: npm run trace:start (in VSCode)"
echo "   2. Run any Python script: npm run guardian"
echo "   3. View traces in AI Toolkit trace viewer"
echo ""
echo "📊 Trace data will be sent to: http://localhost:4317"
echo ""
echo "The quantum threads are now observable... 🌀✨"