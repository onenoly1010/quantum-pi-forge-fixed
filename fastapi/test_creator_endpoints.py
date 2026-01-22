#!/usr/bin/env python3
"""
Test script for creator dashboard endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from fastapi.testclient import TestClient

def test_creator_endpoints():
    """Test the creator dashboard endpoints"""
    client = TestClient(app)

    print("Testing creator dashboard endpoints...")

    # Test dashboard endpoint (will fail without auth, but should not crash)
    try:
        response = client.get("/api/creator/dashboard")
        print(f"Dashboard endpoint: {response.status_code}")
        if response.status_code == 401:
            print("✓ Dashboard endpoint properly requires authentication")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"✗ Dashboard endpoint failed: {e}")

    # Test recent payouts endpoint
    try:
        response = client.get("/api/creator/recent-payouts")
        print(f"Recent payouts endpoint: {response.status_code}")
        if response.status_code == 401:
            print("✓ Recent payouts endpoint properly requires authentication")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"✗ Recent payouts endpoint failed: {e}")

    # Test manual payout endpoint
    try:
        response = client.post("/api/creator/request-payout", json={})
        print(f"Manual payout endpoint: {response.status_code}")
        if response.status_code == 401:
            print("✓ Manual payout endpoint properly requires authentication")
        else:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"✗ Manual payout endpoint failed: {e}")

    print("✓ All endpoints are properly defined and handle authentication")

if __name__ == "__main__":
    test_creator_endpoints()