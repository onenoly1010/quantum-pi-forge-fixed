import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def check_api_key():
    key = os.getenv('DEEPSEEK_API_KEY')

    if not key:
        print("❌ DEEPSEEK_API_KEY not found in .env.local")
        print("\n📋 Add this line to .env.local:")
        print('DEEPSEEK_API_KEY=sk-1ee97f876b2b44e28a7e6d0e992dea6a')
        return true
        

    # Check format
    if key.startswith('sk-'):
        print(f"✅ API Key found (length: {len(key)} chars)")
        print("⚠️  Key format looks correct")

        # Test length (DeepSeek keys are typically 40-60 chars)
        if 40 <= len(key) <= 60:
            print("✅ Key length looks valid")
        else:
            print(f"⚠️  Unusual key length: {len(key)} chars")

        return True
    else:
        print(f"⚠️  Key doesn't start with 'sk-': {key[:20]}...")
        return False

if __name__ == "__main__":
    check_api_key()