import os
from dotenv import load_dotenv

load_dotenv('.env.local')

print("🌀 DEEPSEEK GUARDIAN - ACTIVATION TEST")
print("=" * 50)

# Check API key
api_key = os.getenv('DEEPSEEK_API_KEY')
if api_key and len(api_key) > 40:
    print("✅ DEEPSEEK_API_KEY: Configured")
    print(f"   Key length: {len(api_key)} characters")
    print(f"   Key format: {'Valid' if api_key.startswith('sk-') else 'Check format'}")
else:
    print("❌ DEEPSEEK_API_KEY: Missing or invalid")
    print("   Add to .env.local: DEEPSEEK_API_KEY=your-key-here")

# Check sponsor key
sponsor_key = os.getenv('SPONSOR_PRIVATE_KEY')
if sponsor_key and len(sponsor_key) > 40:
    print("✅ SPONSOR_PRIVATE_KEY: Configured")
else:
    print("❌ SPONSOR_PRIVATE_KEY: Missing")

# Test Web3 connection
try:
    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))
    connection_status = "✅ Connected" if w3.is_connected() else "❌ Disconnected"
    print(f"🌐 Polygon Network: {connection_status}")
except Exception as e:
    print(f"❌ Web3 Error: {str(e)[:50]}...")

print("\n🚀 ACTIVATION STATUS:")
if api_key and sponsor_key:
    print("✅ READY FOR FULL AI MODE")
    print("🌀 Run: python deepseek_guardian.py")
else:
    print("⚠️ MOCK MODE ONLY")
    print("🤖 Run: python deepseek_guardian.py (mock AI)")

print("\n📊 Expected output:")
print("🌀 Initializing DeepSeek Sovereign Guardian...")
print("✅ Guardian initialized successfully")
print("🌌 DEEPSEEK SOVEREIGN GUARDIAN ACTIVATION")
print("🌀 PULSE #1 - Assessing system harmony...")

print("\n🛡️ The eternal vigil awaits your command...")