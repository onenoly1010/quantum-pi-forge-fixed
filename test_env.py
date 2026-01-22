import os
from dotenv import load_dotenv

load_dotenv('.env.local')

print("Environment Test:")
print(f"DEEPSEEK_API_KEY: {'Loaded' if os.getenv('DEEPSEEK_API_KEY') else 'None'}")
print(f"SPONSOR_PRIVATE_KEY: {'Loaded' if os.getenv('SPONSOR_PRIVATE_KEY') else 'None'}")

# Test basic guardian initialization
try:
    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))
    print(f"Web3 Connection: {'Connected' if w3.is_connected() else 'Disconnected'}")
except Exception as e:
    print(f"Web3 Error: {e}")

print("Test complete.")