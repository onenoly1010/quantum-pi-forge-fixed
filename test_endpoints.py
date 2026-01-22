import requests
import json

# Test the creator dashboard endpoint
try:
    response = requests.get("http://localhost:5001/api/creator/dashboard?creator_id=test-creator-123")
    print(f"Dashboard endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Dashboard data:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")

# Test the recent payouts endpoint
try:
    response = requests.get("http://localhost:5001/api/creator/recent-payouts?creator_id=test-creator-123")
    print(f"\nRecent payouts endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Recent payouts data:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")

# Test the Stripe Connect onboarding endpoint
try:
    response = requests.post("http://localhost:5001/api/creator/stripe/onboard",
                           json={"creator_id": "test-creator-123", "email": "test@example.com"})
    print(f"\nStripe onboard endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Stripe onboard data:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")

print("\nTest completed.")