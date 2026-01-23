import time
import json
from web3 import Web3
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

# Setup Tracing
resource = Resource(attributes={
    "service.name": "scribe-daemon",
    "service.version": "1.0.0"
})
provider = TracerProvider(resource=resource)
exporter = OTLPSpanExporter(endpoint="http://localhost:4318/v1/traces")
processor = BatchSpanProcessor(exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Configuration
RPC_URL = "https://sepolia.base.org"
CONTRACT_ADDRESS = "0x353663cd664bB3e034Dc0f308D8896C0a242e4cd" # Update this after deployment

# ABI for the Etched event
CONTRACT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "scribe", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "message", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "Etched",
        "type": "event"
    }
]

def main():
    if not CONTRACT_ADDRESS:
        print("Please update CONTRACT_ADDRESS in the script.")
        return

    print(f"Connecting to {RPC_URL}...")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    try:
        print(f"Connected! Current block: {w3.eth.block_number}")
    except Exception as e:
        print(f"Failed to connect to RPC: {e}")
        return

    print(f"Watching contract at {CONTRACT_ADDRESS}")
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

    # Simple polling for new events (for demonstration)
    # In production, use filters or websockets
    last_block = w3.eth.block_number
    print(f"Starting from block {last_block}")

    while True:
        with tracer.start_as_current_span("scan_blocks") as span:
            try:
                current_block = w3.eth.block_number
                span.set_attribute("eth.current_block", current_block)
                span.set_attribute("eth.last_block", last_block)
                
                if current_block > last_block:
                    print(f"Scanning blocks {last_block + 1} to {current_block}...")
                    events = contract.events.Etched.get_logs(fromBlock=last_block + 1, toBlock=current_block)
                    
                    span.set_attribute("eth.events_found", len(events))
                    
                    for event in events:
                        handle_event(event)
                    
                    last_block = current_block
                
                time.sleep(5)
            except Exception as e:
                print(f"Error: {e}")
                span.record_exception(e)
                time.sleep(5)

def handle_event(event):
    with tracer.start_as_current_span("handle_event") as span:
        scribe = event['args']['scribe']
        message = event['args']['message']
        timestamp = event['args']['timestamp']
        
        span.set_attribute("event.scribe", scribe)
        span.set_attribute("event.message", message)
        
        print(f"⚡ New Whisper Etched!")
        print(f"   Scribe: {scribe}")
        print(f"   Message: {message}")
        print(f"   Time: {timestamp}")
        print("-" * 30)

if __name__ == "__main__":
    main()
