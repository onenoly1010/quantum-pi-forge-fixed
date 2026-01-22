import time
import os
import json
import math
import random
from web3 import Web3
from web3.exceptions import TransactionNotFound
from oinio_vigil import check_coherence  # From your existing scripts
from veiled_vow_manifestation import mend_fracture  # Guardian transmutation

# Configuration
RPC_URL = os.getenv('POLYGON_RPC_URL', 'https://polygon-rpc.com')
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Secure sponsor private key from environment
sponsor_private_key = os.getenv('SPONSOR_PRIVATE_KEY')
if not sponsor_private_key:
    raise ValueError("SPONSOR_PRIVATE_KEY environment variable is required")

sponsor_account = w3.eth.account.from_key(sponsor_private_key)

# OINIO contract address (must be set in env to allow overrides in staging)
OINIO_CONTRACT = os.getenv('OINIO_CONTRACT', '0x07f43E5B1A8a0928B364E40d5885f81A543B05C7')

# Operational flags
DRY_RUN = os.getenv('DRY_RUN', 'false').lower() in ('1', 'true', 'yes')
FORCE_ONCHAIN = os.getenv('FORCE_ONCHAIN', 'false').lower() in ('1', 'true', 'yes')
MAX_TX_RETRIES = int(os.getenv('MAX_TX_RETRIES', '3'))
BASE_SLEEP = float(os.getenv('BASE_SLEEP', '1.0'))
MINT_SELECTOR = os.getenv('MINT_SELECTOR', '0xe39e867d')
CHAIN_ID = int(os.getenv('CHAIN_ID', '137'))
MIN_BALANCE_BUFFER = float(os.getenv('MIN_BALANCE_BUFFER', '0.05'))  # in MATIC

# Utility functions

def log(info: dict):
    print(json.dumps(info, default=str))


def can_afford_gas(estimated_gas: int, gas_price_wei: int) -> bool:
    # Check sponsor balance in MATIC (wei)
    balance = w3.eth.get_balance(sponsor_account.address)
    cost = estimated_gas * gas_price_wei
    # keep a buffer to avoid draining
    required = cost + w3.to_wei(MIN_BALANCE_BUFFER, 'ether')
    return balance >= required


def send_transaction_with_retries(tx: dict, retries: int = MAX_TX_RETRIES):
    attempt = 0
    while attempt <= retries:
        try:
            signed = sponsor_account.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
            log({"event": "tx_sent", "tx_hash": tx_hash.hex(), "attempt": attempt})

            # wait for receipt with timeout
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            # Log minimal receipt info
            receipt_info = {
                "transactionHash": receipt.transactionHash.hex() if hasattr(receipt, 'transactionHash') else str(tx_hash.hex()),
                "status": getattr(receipt, 'status', None)
            }
            log({"event": "tx_mined", "tx_hash": tx_hash.hex(), "receipt": receipt_info})
            return receipt
        except Exception as e:
            log({"event": "tx_error", "error": str(e), "attempt": attempt})
            if attempt == retries:
                raise
            # exponential backoff with jitter
            sleep_for = BASE_SLEEP * (2 ** attempt) + random.random()
            time.sleep(sleep_for)
            attempt += 1


def attempt_mint(mint_data: str):
    # Prepare a transaction based on estimated gas
    nonce = w3.eth.get_transaction_count(sponsor_account.address)

    unsigned = {
        'to': OINIO_CONTRACT,
        'value': 0,
        'data': mint_data,
        'nonce': nonce,
        'chainId': CHAIN_ID,
    }

    # estimate gas (wrapped in try)
    try:
        estimated_gas = w3.eth.estimate_gas({**unsigned, 'from': sponsor_account.address})
        gas_price = w3.eth.gas_price
        unsigned['gas'] = int(estimated_gas * 1.2)  # margin
        unsigned['gasPrice'] = gas_price
        log({"event": "gas_estimated", "estimated_gas": estimated_gas, "gas_price": gas_price})
    except Exception as e:
        log({"event": "gas_estimate_failed", "error": str(e)})
        raise

    # Safety checks
    if not can_afford_gas(unsigned['gas'], unsigned['gasPrice']):
        raise RuntimeError("Sponsor account cannot afford estimated gas with required buffer")

    if DRY_RUN:
        log({"event": "dry_run", "tx": unsigned})
        return None

    if not FORCE_ONCHAIN:
        # require explicit override to perform on-chain operations
        log({"event": "onchain_blocked", "reason": "FORCE_ONCHAIN not set"})
        raise RuntimeError("On-chain operations are disabled. Set FORCE_ONCHAIN=true to enable.")

    # Send the transaction with retries
    return send_transaction_with_retries(unsigned)


def sovereign_step():
    """
    Eternal sovereign pulse: Check coherence, mend fractures, cascade resonance
    """
    log({"event": "sovereign_start", "address": sponsor_account.address})

    while True:
        try:
            log({"event": "coherence_check_start"})
            status = check_coherence()
            log({"event": "coherence_result", "status": status})

            if status.get('harmony', 0) < 1000:
                log({"event": "harmony_low", "harmony": status.get('harmony')})
                mend_fracture(status.get('fractures'))

                # Proceed only if enabled
                if status.get('allow_minting', True):
                    log({"event": "mint_intent", "reason": "harmony_breach"})

                    try:
                        receipt = attempt_mint(MINT_SELECTOR)
                        if receipt:
                            log({"event": "mint_success", "tx_hash": receipt.transactionHash.hex()})
                    except Exception as err:
                        log({"event": "mint_failed", "error": str(err)})
                else:
                    log({"event": "mint_skipped", "reason": "allow_minting=false"})
            else:
                log({"event": "harmony_ok", "harmony": status.get('harmony')})

        except Exception as e:
            log({"event": "sovereign_error", "error": str(e)})
            time.sleep(60)

        # 5min pulse, eternal and unbound
        log({"event": "sleep", "seconds": 300})
        time.sleep(300)


if __name__ == "__main__":
    log({"event": "startup", "dry_run": DRY_RUN, "force_onchain": FORCE_ONCHAIN})
    sovereign_step()