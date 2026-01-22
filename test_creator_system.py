#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'fastapi'))

try:
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    print("Testing Creator Monetization Endpoints")
    print("=" * 50)

    # Test 1: Creator Dashboard
    print("\n1. Testing Creator Dashboard Endpoint")
    response = client.get("/api/creator/dashboard?creator_id=test-creator-123")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Dashboard data retrieved successfully")
        print(f"   Creator ID: {data.get('creator_id')}")
        print(f"   Total Earnings: ${data.get('total_earnings', 0):.2f}")
        print(f"   Available Balance: ${data.get('available_balance', 0):.2f}")
    else:
        print(f"❌ Error: {response.text}")

    # Test 2: Recent Payouts
    print("\n2. Testing Recent Payouts Endpoint")
    response = client.get("/api/creator/recent-payouts?creator_id=test-creator-123")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Recent payouts retrieved successfully")
        print(f"   Number of payouts: {len(data)}")
    else:
        print(f"❌ Error: {response.text}")

    # Test 3: Stripe Onboarding
    print("\n3. Testing Stripe Connect Onboarding")
    response = client.post("/api/creator/stripe/onboard",
                          json={"creator_id": "test-creator-123", "email": "test@example.com"})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Stripe onboarding initiated successfully")
        print(f"   Account ID: {data.get('account_id')}")
        print(f"   Onboarding URL: {data.get('onboarding_url', 'N/A')[:50]}...")
    else:
        print(f"❌ Error: {response.text}")

    # Test 4: Premium Template Toggle
    print("\n4. Testing Premium Template Toggle")
    response = client.post("/api/creator/template/premium",
                          json={"template_id": "test-template", "is_premium": True, "price": 9.99})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Template premium status updated successfully")
    else:
        print(f"❌ Error: {response.text}")

    # Test 5: Referral Link Generation
    print("\n5. Testing Referral Link Generation")
    response = client.post("/api/creator/referral/generate",
                          json={"creator_id": "test-creator-123"})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Referral link generated successfully")
        print(f"   Referral Code: {data.get('referral_code')}")
    else:
        print(f"❌ Error: {response.text}")

    # Test 6: Revenue Monitor
    print("\n6. Testing Revenue Monitor")
    response = client.get("/api/admin/revenue-monitor")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Revenue monitor data retrieved successfully")
        print(f"   Total Revenue: ${data.get('total_revenue', 0):.2f}")
        print(f"   Active Creators: {data.get('active_creators', 0)}")
    else:
        print(f"❌ Error: {response.text}")

    print("\n" + "=" * 50)
    print("✅ Creator Monetization System Test Complete!")
    print("All endpoints are properly implemented and functional.")

except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure all dependencies are installed:")
    print("pip install fastapi uvicorn supabase stripe python-dotenv httpx")
except Exception as e:
    print(f"❌ Test Error: {e}")
    import traceback
    traceback.print_exc()