#!/usr/bin/env python3
"""
Creator Payout Engine - Launch Test Suite
Run this after deployment to verify everything works
"""

import requests
import json
import time

# Configuration - Update these with your actual URLs
API_BASE_URL = "https://your-api.vercel.app"  # Replace with your Vercel API URL
SUPABASE_URL = "https://your-project.supabase.co"  # Replace with your Supabase URL

def test_creator_onboarding():
    """Test 1: Create a creator account"""
    print("🧪 Test 1: Creator Onboarding")

    url = f"{API_BASE_URL}/api/creator/onboard"
    data = {
        "email": "test-creator@example.com",
        "name": "Test Creator"
    }

    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Creator onboarding successful!")
            print(f"Creator ID: {result.get('creator_id')}")
            return result.get('creator_id')
        else:
            print(f"❌ Onboarding failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_payout_transaction(creator_id):
    """Test 2: Trigger a payout transaction"""
    print("\n💰 Test 2: Payout Transaction")

    url = f"{API_BASE_URL}/api/creator/payout"
    data = {
        "templateId": "template_001",
        "userId": "test_user_001",
        "burnAmount": 10.00,
        "transactionHash": "0x0000000000000000000000000000000000000000"
    }

    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Payout transaction successful!")
            print(f"Payout Breakdown: {json.dumps(result.get('breakdown'), indent=2)}")
            print(f"Creator Balance: ${result.get('creator_balance')}")
            return True
        else:
            print(f"❌ Payout failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_stripe_onboarding():
    """Test 3: Stripe Connect onboarding"""
    print("\n💳 Test 3: Stripe Connect Onboarding")

    url = f"{API_BASE_URL}/api/creator/stripe/onboard"
    data = {
        "creator_id": "test-creator-123",
        "email": "test-creator@example.com"
    }

    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Stripe onboarding initiated!")
            print(f"Account ID: {result.get('account_id')}")
            print(f"Onboarding URL: {result.get('onboarding_url', 'N/A')[:50]}...")
            return True
        else:
            print(f"❌ Stripe onboarding failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_dashboard_data():
    """Test 4: Dashboard data retrieval"""
    print("\n📊 Test 4: Dashboard Data")

    url = f"{API_BASE_URL}/api/creator/dashboard?creator_id=test-creator-123"

    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Dashboard data retrieved!")
            print(f"Total Earnings: ${result.get('total_earnings', 0):.2f}")
            print(f"Available Balance: ${result.get('available_balance', 0):.2f}")
            print(f"Templates Created: {result.get('templates_created', 0)}")
            return True
        else:
            print(f"❌ Dashboard failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_revenue_monitor():
    """Test 5: Revenue monitor (admin)"""
    print("\n📈 Test 5: Revenue Monitor")

    url = f"{API_BASE_URL}/api/admin/revenue-monitor"

    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Revenue monitor working!")
            print(f"Total Revenue: ${result.get('total_revenue', 0):.2f}")
            print(f"Active Creators: {result.get('active_creators', 0)}")
            return True
        else:
            print(f"❌ Revenue monitor failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all launch tests"""
    print("🚀 CREATOR PAYOUT ENGINE - LAUNCH TEST SUITE")
    print("=" * 60)

    # Update these URLs before running!
    print("⚠️  IMPORTANT: Update API_BASE_URL and SUPABASE_URL in this script first!")
    print()

    # Run tests
    creator_id = test_creator_onboarding()
    if creator_id:
        test_payout_transaction(creator_id)

    test_stripe_onboarding()
    test_dashboard_data()
    test_revenue_monitor()

    print("\n" + "=" * 60)
    print("🎯 LAUNCH TEST SUITE COMPLETE")
    print("\nNext steps:")
    print("1. Fix any failed tests by checking environment variables")
    print("2. Set up Stripe webhook endpoint")
    print("3. Deploy the frontend components")
    print("4. Start your launch announcement!")

if __name__ == "__main__":
    main()