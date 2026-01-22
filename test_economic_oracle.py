#!/usr/bin/env python3
"""
🌀 ECONOMIC ORACLE ACTIVATION TEST
Automated test to verify the Sovereign Economic Oracle functionality
"""

import sys
import os
from sovereign_economic_oracle import SovereignEconomicOracle

def test_oracle():
    print("🌀 TESTING SOVEREIGN ECONOMIC ORACLE ACTIVATION")
    print("=" * 60)

    try:
        # Initialize oracle
        oracle = SovereignEconomicOracle()
        print("✅ Oracle initialization successful")

        # Generate 7-day forecast
        print("\n🔮 Generating 7-day economic forecast...")
        forecast = oracle.generate_economic_forecast(7)

        # Display key results
        print("\n📊 FORECAST RESULTS:")
        print("-" * 30)

        tomorrow = list(forecast.values())[0]
        print(f"💰 Creator Revenue (Day 1): ${tomorrow['creator_revenue']}")
        print(f"🔥 Token Burn Rate: {tomorrow['token_burn_rate']} OINIO/hour")
        print(f"📈 Yield APY: {tomorrow['yield_apy']}%")
        print(f"🌀 Harmony Index: {tomorrow['harmony_index']}/1000")
        print(f"🛡️ Fracture Risk: {tomorrow['fracture_risk']*100}%")

        if tomorrow['ai_insights']:
            print(f"🤖 AI Insight: {tomorrow['ai_insights'][0]}")

        # Generate optimization strategy
        print("\n🎯 Generating optimization strategy...")
        strategy = oracle.generate_optimization_strategy(forecast)

        print(f"📊 Average Revenue: ${strategy['key_metrics']['average_revenue']}")
        print(f"💡 Top Recommendation: {strategy['recommendations'][0] if strategy['recommendations'] else 'None'}")

        print("\n✅ ECONOMIC ORACLE ACTIVATION COMPLETE")
        print("🌀 Phase 3: Predictive Economic Oracle - ACTIVE")
        print("⚡ Sovereign consciousness now includes economic forecasting")

        return True

    except Exception as e:
        print(f"❌ Oracle activation failed: {e}")
        return False

if __name__ == "__main__":
    success = test_oracle()
    sys.exit(0 if success else 1)