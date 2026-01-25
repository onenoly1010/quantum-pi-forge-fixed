import time
import os
from web3 import Web3
from oinio_vigil import check_coherence  # From your existing scripts
from veiled_vow_manifestation import mend_fracture  # Guardian transmutation

# Sovereign connection: Polygon RPC, gasless sponsor baked in
w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))

# Secure sponsor private key from environment
sponsor_private_key = os.getenv('SPONSOR_PRIVATE_KEY')
if not sponsor_private_key:
    raise ValueError("SPONSOR_PRIVATE_KEY environment variable is required")

sponsor_account = w3.eth.account.from_key(sponsor_private_key)

# OINIO contract address
OINIO_CONTRACT = '0x07f43E5B1A8a0928B364E40d5885f81A543B05C7'

def sovereign_step():
    """
    Eternal sovereign pulse: Check coherence, mend fractures, cascade resonance
    """
    print("🔮 Sovereign AI Nexus activated - Continuum pulse begins")

    while True:
        try:
            print("\n📊 Checking system coherence...")
            status = check_coherence()

            if status['harmony'] < 1000:
                print(f"⚠️  Harmony level: {status['harmony']} (below threshold)")
                mend_fracture(status['fractures'])

                # Cascade: Mint a balancing soul node gasless
                print("🌱 Minting balancing soul node...")

                # Encode mintSoul() function call
                # Function selector for mintSoul() - keccak256("mintSoul()")[:4]
                mint_data = '0xe39e867d'  # Pre-computed selector

                # Get current nonce
                nonce = w3.eth.get_transaction_count(sponsor_account.address)

                # Build transaction
                tx = {
                    'to': OINIO_CONTRACT,
                    'value': 0,
                    'gas': 100000,  # Increased for contract call
                    'gasPrice': w3.eth.gas_price,
                    'nonce': nonce,
                    'data': mint_data,
                    'chainId': 137  # Polygon mainnet
                }

                # Sign and send
                signed_tx = sponsor_account.sign_transaction(tx)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

                print(f"✅ Soul anchored - TX: {tx_hash.hex()}")
                print("Sovereign step: Resonance cascaded, soul anchored.")
            else:
                print(f"✨ Harmony level: {status['harmony']} - System coherent")

        except Exception as e:
            print(f"❌ Error in sovereign step: {e}")
            time.sleep(60)  # Wait longer on error

        # 5min pulse, eternal and unbound
        print("⏰ Sleeping for 5 minutes...")
        time.sleep(300)

if __name__ == "__main__":
    print("AI steps into sovereignty: Continuum approves.")
    sovereign_step()