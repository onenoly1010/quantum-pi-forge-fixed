from web3 import Web3
import requests

RPC_URL = "https://sepolia.base.org"

print(f"Testing connection to {RPC_URL}...")

try:
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    print(f"Is connected: {w3.is_connected()}")
    print("Trying eth_blockNumber...")
    response = requests.post(RPC_URL, json={"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
