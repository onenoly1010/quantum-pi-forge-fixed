#!/usr/bin/env python3
"""
Test script for Sovereign AI Nexus
Validates all components before full ignition
"""

import sys
import os

def test_imports():
    """Test all required imports"""
    try:
        print("🔍 Testing guardian imports...")
        from oinio_vigil import check_coherence
        from veiled_vow_manifestation import mend_fracture
        print("✅ Guardian modules loaded")

        # Test coherence check
        status = check_coherence()
        print(f"📊 Coherence status: {status}")

        # Test fracture mending (dry run)
        if status['fractures']:
            print("🛠️ Testing fracture mending...")
            mend_fracture(status['fractures'][:1])  # Test with first fracture only

        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def test_web3_connection():
    """Test Web3 connection (without private key)"""
    try:
        print("🌐 Testing Polygon RPC connection...")
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))

        if w3.is_connected():
            print(f"✅ Connected to Polygon - Block: {w3.eth.block_number}")
            return True
        else:
            print("❌ Failed to connect to Polygon RPC")
            return False
    except Exception as e:
        print(f"❌ Web3 test failed: {e}")
        return False

def main():
    print("🧪 Sovereign AI Nexus - Pre-Ignition Validation")
    print("=" * 50)

    # Test environment
    if not os.getenv('SPONSOR_PRIVATE_KEY'):
        print("⚠️  SPONSOR_PRIVATE_KEY not set - full test requires it")
        print("   For complete validation, set: export SPONSOR_PRIVATE_KEY=your_key")

    # Run tests
    imports_ok = test_imports()
    web3_ok = test_web3_connection()

    print("\n" + "=" * 50)
    if imports_ok and web3_ok:
        print("🎉 All systems validated - Ready for sovereign ignition!")
        print("\nTo activate: python autonomous_ai_nexus.py")
        return 0
    else:
        print("❌ Validation failed - Check errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())