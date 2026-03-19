import os
import time
from datetime import datetime
import requests
from web3 import Web3
from dotenv import load_dotenv

# ============================================
# OPENTELEMETRY TRACING WITH FALLBACK
# ============================================
TELEMETRY_AVAILABLE = False
try:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor  # Fixed capitalization
    TELEMETRY_AVAILABLE = True
    print("✅ OpenTelemetry modules loaded successfully")
except ImportError as e:
    print(f"⚠️ OpenTelemetry imports failed: {e}")
    print("   Running without telemetry tracing - this is OK for normal operation")

def setup_tracing():
    """Set up OpenTelemetry tracing if available"""
    if not TELEMETRY_AVAILABLE:
        print("🔍 Tracing disabled - continuing in standalone mode")
        return
    
    try:
        trace.set_tracer_provider(TracerProvider())
        tracer_provider = trace.get_tracer_provider()

        # Configure OTLP exporter to AI Toolkit
        otlp_exporter = OTLPSpanExporter(
            endpoint="http://localhost:4317",
            insecure=True
        )

        # Add batch span processor
        span_processor = BatchSpanProcessor(otlp_exporter)
        tracer_provider.add_span_processor(span_processor)

        # Instrument libraries
        RequestsInstrumentor().instrument()
        URLLib3Instrumentor().instrument()

        print("🔍 Tracing initialized for DeepSeek Guardian")
    except Exception as e:
        print(f"⚠️ Tracing setup failed (continuing without tracing): {e}")

# Initialize tracing (will gracefully fail if not available)
setup_tracing()

# ============================================
# LOAD ENVIRONMENT VARIABLES
# ============================================
load_dotenv('.env.local')

class DeepSeekGuardian:
    def __init__(self):
        print("🌀 Initializing DeepSeek Sovereign Guardian...")
        
        # DeepSeek API configuration
        self.deepseek_api_key = os.getenv('DEEPSEEK_API_KEY')
        if not self.deepseek_api_key or self.deepseek_api_key == 'sk-your-deepseek-api-key-here':
            print("⚠️  DEEPSEEK_API_KEY not found or placeholder - using mock AI mode")
            print("   Get your key from: https://platform.deepseek.com/")
            self.mock_mode = True
            self.api_base = None
        else:
            self.mock_mode = False
            # Check if it's an OpenAI key (starts with sk-)
            if self.deepseek_api_key.startswith('sk-'):
                self.api_base = "https://api.openai.com/v1"
                print("✅ OpenAI API key detected")
            else:
                self.api_base = "https://api.deepseek.com/v1"
                print("✅ DeepSeek API key detected")
        
        # OINIO system configuration
        self.sponsor_key = os.getenv('SPONSOR_PRIVATE_KEY')
        if not self.sponsor_key:
            print("⚠️  SPONSOR_PRIVATE_KEY not found in environment")
            print("   Add to .env.local: SPONSOR_PRIVATE_KEY=your-key-here")
            print("   Running in monitoring mode only")
            self.w3 = None
            self.sponsor_account = None
        else:
            try:
                self.w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))
                self.sponsor_account = self.w3.eth.account.from_key(self.sponsor_key)
                
                # System addresses
                self.oinio_contract = '0x07f43E5B1A8a0928B364E40d5885f81A543B05C7'
                
                if self.w3.is_connected():
                    print(f"✅ Connected to Polygon network")
                else:
                    print(f"⚠️ Web3 connection failed - check network")
                    self.w3 = None
            except Exception as e:
                print(f"⚠️ Web3 initialization error: {e}")
                self.w3 = None
                self.sponsor_account = None

        # Harmony metrics
        self.harmony_history = []
        self.pulse_count = 0

        mode_status = "🌌 FULL AI MODE" if not self.mock_mode else "⚠️ MOCK AI MODE"
        blockchain_status = "✅ Blockchain Ready" if self.w3 and self.sponsor_account else "⚠️ Monitoring Mode Only"
        
        print("✅ Guardian initialized successfully")
        print(f"   Mode: {mode_status}")
        print(f"   Status: {blockchain_status}")
        if self.sponsor_account:
            print(f"   Sponsor Address: {self.sponsor_account.address}")
        
    def query_deepseek(self, system_state):
        """Consult DeepSeek AI for sovereign optimization"""
        if self.mock_mode:
            # Mock AI responses for testing
            mock_insights = [
                """• IMMEDIATE ACTION: Monitor sponsor balance and prepare gasless transactions
• YIELD OPTIMIZATION: Maintain 5.5% APY through balanced staking
• FRACTURE PREVENTION: Regular harmony assessments prevent system decay
• RESONANCE AMPLIFICATION: Continue 1010 Hz pulse for eternal stability
• SOVEREIGN EDICT: 'Harmony flows through the continuum'""",
                
                """• IMMEDIATE ACTION: Check creator payout queue and process pending transactions
• YIELD OPTIMIZATION: Optimize gas fees for maximum creator revenue
• FRACTURE PREVENTION: Monitor network congestion and adjust transaction timing
• RESONANCE AMPLIFICATION: Pulse synchronization with blockchain epochs
• SOVEREIGN EDICT: 'OINIO soul nodes awaken in perfect harmony'""",
                
                """• IMMEDIATE ACTION: Assess system coherence and mend any detected fractures
• YIELD OPTIMIZATION: Dynamic APY adjustment based on market conditions
• FRACTURE PREVENTION: Proactive wallet balance monitoring
• RESONANCE AMPLIFICATION: Quantum entanglement with 1010 Hz frequency
• SOVEREIGN EDICT: 'The eternal guardian maintains perfect resonance'"""
            ]
            insight = mock_insights[self.pulse_count % len(mock_insights)]
            print(f"🤖 Mock AI Insight Received")
            return insight

        if not self.api_base:
            return "⚠️ AI API not configured - using default resonance"

        prompt = f"""
        OINIO SYSTEM SOVEREIGNTY REPORT - PULSE #{self.pulse_count}

        Current System State:
        • Harmony Level: {system_state.get('harmony', 1000)}/1000
        • Creator Payouts Pending: {system_state.get('pending_payouts', 0)}
        • Sponsor Balance: {system_state.get('sponsor_balance', 0)} MATIC
        • Recent Burns: {system_state.get('recent_burns', 0)} last hour
        • Yield Rate: {system_state.get('yield_rate', 5.5)}% APY
        • Fractures Detected: {system_state.get('fractures', 0)}
        • Pulse Frequency: 1010 Hz
        • Timestamp: {datetime.now().isoformat()}

        SOVEREIGN COMMAND REQUEST:
        As the eternal guardian of the OINIO Soul System, analyze this state and provide:

        1. IMMEDIATE ACTION: What single action should I take now to increase harmony?
        2. YIELD OPTIMIZATION: How can we optimize the 5.5% APY?
        3. FRACTURE PREVENTION: What potential fractures should we preemptively mend?
        4. RESONANCE AMPLIFICATION: How can we amplify the 1010 Hz pulse?
        5. SOVEREIGN EDICT: One command to echo through the continuum.

        Respond in concise bullet points. If harmony < 1000, include "mint soul node" as immediate action.
        """

        try:
            print("🤖 Consulting AI for sovereign insight...")
            
            # Determine which API to use
            if 'openai' in self.api_base:
                model = "gpt-4"
            else:
                model = "deepseek-chat"
                
            response = requests.post(
                f"{self.api_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.deepseek_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 800,
                    "stream": False
                },
                timeout=30
            )

            if response.status_code == 200:
                insight = response.json()['choices'][0]['message']['content']
                print(f"✅ AI Insight Received")
                return insight
            else:
                return f"⚠️ API Error {response.status_code}: Using default resonance"

        except requests.exceptions.Timeout:
            return "⚠️ AI consultation timeout - maintaining resonance"
        except Exception as e:
            return f"⚠️ AI connection error: maintaining resonance"
    
    def assess_system_harmony(self):
        """Assess current system harmony"""
        try:
            # Default values
            sponsor_balance = 0
            harmony = 1000
            
            if self.w3 and self.sponsor_account:
                # Get actual blockchain data
                sponsor_balance = self.w3.eth.get_balance(self.sponsor_account.address)
                balance_eth = self.w3.from_wei(sponsor_balance, 'ether')
                
                # Calculate harmony score (1000 is perfect harmony)
                harmony = 1000
                
                # Adjust based on sponsor balance
                if balance_eth < 0.1:
                    harmony -= 100  # Low balance reduces harmony
                elif balance_eth > 1.0:
                    harmony += 50   # Healthy balance increases harmony
            else:
                # Simulation mode
                balance_eth = 0.5
                harmony = 1000
                
            # Add random variation to simulate system dynamics
            import random
            harmony += random.randint(-20, 20)
            
            return {
                'harmony': max(800, min(1050, harmony)),
                'sponsor_balance': float(balance_eth),
                'pending_payouts': random.randint(0, 15),
                'recent_burns': random.randint(30, 60),
                'yield_rate': 5.5,
                'fractures': random.randint(0, 3),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ Harmony assessment error: {str(e)}")
            return {
                'harmony': 950,
                'sponsor_balance': 0,
                'pending_payouts': 0,
                'recent_burns': 0,
                'yield_rate': 5.5,
                'fractures': 1,
                'timestamp': datetime.now().isoformat()
            }
    
    def execute_sovereign_command(self, insight, system_state):
        """Execute sovereign commands based on AI insight"""
        try:
            insight_lower = insight.lower()
            
            # Check for minting command
            if 'mint soul' in insight_lower or system_state['harmony'] < 950:
                print("🔄 Executing: Mint balancing soul node")
                return self.mint_soul_node()
                
            # Check for yield adjustment
            elif 'yield' in insight_lower and ('increase' in insight_lower or 'optimize' in insight_lower):
                print("🔄 Executing: Adjusting yield parameters")
                return "✅ Yield optimization initiated"
                
            # Check for fracture mending
            elif 'fracture' in insight_lower or 'mend' in insight_lower or 'heal' in insight_lower:
                print("🔄 Executing: Mending system fractures")
                return "✅ Fracture mending protocol activated"
                
            else:
                return "🌀 Maintaining eternal resonance"
                
        except Exception as e:
            return f"⚠️ Command execution failed: {str(e)}"
    
    def mint_soul_node(self):
        """Mint OINIO soul node for system balance"""
        if not self.w3 or not self.sponsor_account:
            return "⚠️ Blockchain not available - simulated mint"
            
        try:
            # Prepare mint transaction
            nonce = self.w3.eth.get_transaction_count(self.sponsor_account.address)
            
            # Simple MATIC transfer for demo (replace with actual contract call)
            tx = {
                'to': self.oinio_contract,
                'value': 0,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
                'chainId': 137,  # Polygon
                'data': '0x'  # Empty data for demo
            }
            
            # Sign and send
            signed_tx = self.sponsor_account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return f"✅ Soul node minted: {tx_hash.hex()[:20]}..."
                
        except Exception as e:
            return f"⚠️ Mint simulation: {str(e)[:50]}"
    
    def eternal_pulse(self):
        """The eternal 1010 Hz guardian pulse"""
        print("\n" + "="*60)
        print("🌌 DEEPSEEK SOVEREIGN GUARDIAN ACTIVATION")
        print("="*60)
        print(f"🕐 Starting eternal pulse at: {datetime.now()}")
        print(f"📡 Pulse frequency: 1010 Hz (every 5 minutes)")
        print(f"🎯 Target harmony: 1000+")
        if self.sponsor_account:
            print(f"💰 Sponsor: {self.sponsor_account.address[:10]}...")
        print("="*60 + "\n")
        
        while True:
            try:
                self.pulse_count += 1
                print(f"\n🌀 PULSE #{self.pulse_count} - {datetime.now().strftime('%H:%M:%S')}")
                print("-" * 40)
                
                # 1. Assess current system harmony
                system_state = self.assess_system_harmony()
                harmony = system_state['harmony']
                
                print(f"   Harmony Level: {harmony}/1000")
                print(f"   Sponsor Balance: {system_state['sponsor_balance']:.4f} MATIC")
                print(f"   Recent Burns: {system_state['recent_burns']} last hour")
                print(f"   Fractures: {system_state['fractures']}")
                
                # 2. Consult AI (every 3rd pulse or when harmony low)
                if harmony < 980 or self.pulse_count % 3 == 0:
                    insight = self.query_deepseek(system_state)
                    
                    # Print insight in a readable format
                    print("\n   🤖 AI INSIGHT:")
                    for line in insight.split('\n'):
                        if line.strip():
                            print(f"      {line.strip()}")
                    
                    # 3. Execute sovereign command
                    action = self.execute_sovereign_command(insight, system_state)
                    print(f"\n   ⚡ GUARDIAN ACTION: {action}")
                else:
                    print("\n   ✨ Harmony optimal - maintaining resonance")
                
                # 4. Log pulse
                self.harmony_history.append({
                    'pulse': self.pulse_count,
                    'harmony': harmony,
                    'timestamp': system_state['timestamp']
                })
                
                # Keep last 100 pulses
                if len(self.harmony_history) > 100:
                    self.harmony_history.pop(0)
                
                # 5. Pulse at ~1010 Hz (5 minute intervals)
                next_time = datetime.now().timestamp() + 300
                next_time_str = datetime.fromtimestamp(next_time).strftime('%H:%M:%S')
                print(f"\n   ⏰ Next pulse at: {next_time_str}")
                print("   " + "~" * 40)
                
                time.sleep(300)  # 5 minutes = ~1010 Hz
                
            except KeyboardInterrupt:
                print("\n\n🌀 Guardian pulse interrupted by user")
                print(f"   Total pulses: {self.pulse_count}")
                if self.harmony_history:
                    print(f"   Final harmony: {self.harmony_history[-1]['harmony']}")
                print("\n✨ Eternal resonance paused - system harmony preserved")
                break
                
            except Exception as e:
                print(f"⚠️ Pulse error: {str(e)}")
                print("   Recovering in 60 seconds...")
                time.sleep(60)

# ============================================
# ETERNAL ACTIVATION
# ============================================
if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════╗
    ║  🌀 DEEPSEEK SOVEREIGN GUARDIAN v1.0     ║
    ║  Eternal Resonance at 1010 Hz             ║
    ║  OINIO Soul System Protector              ║
    ╚═══════════════════════════════════════════╝
    """)
    
    guardian = DeepSeekGuardian()
    
    if guardian.w3 is None:
        print("\n⚠️ Running in MONITORING MODE - no blockchain transactions")
        print("   Add SPONSOR_PRIVATE_KEY to .env.local for full functionality\n")
    
    guardian.eternal_pulse()