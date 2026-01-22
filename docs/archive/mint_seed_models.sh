#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                    OINIO SEED MODEL MINTING SCRIPT                           ║
# ║══════════════════════════════════════════════════════════════════════════════║
# ║  ARCHIVED: Historical artifact for minting the 6 foundational OINIO         ║
# ║  Model Royalty NFTs (MR-NFTs) to the creator's EVM address.                  ║
# ║                                                                              ║
# ║  Prerequisites:                                                              ║
# ║    - deployments/contracts.json must exist (from deployment script)         ║
# ║    - PRIVATE_KEY environment variable must be set                           ║
# ║    - Python3 with scripts/mint_models.py available                          ║
# ║                                                                              ║
# ║  T=∞ = T=0                                                                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================="
echo "OINIO SEED MODEL MINTING"
echo -e "==========================================${NC}"
echo ""

if [ ! -f "deployments/contracts.json" ]; then
    echo -e "${RED}❌ ERROR: contracts.json not found. Run deployment script first.${NC}"
    exit 1
fi

# Load contract addresses and deployer from the JSON file
NFT_ADDRESS=$(jq -r '.ModelRoyaltyNFT' deployments/contracts.json)
OINIO_CREATOR_EVM_ADDRESS=$(jq -r '.deployer' deployments/contracts.json)

# Re-validate environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ ERROR: PRIVATE_KEY environment variable is NOT set.${NC}"
    exit 1
fi

echo -e "${YELLOW}Target NFT Contract: $NFT_ADDRESS${NC}"
echo -e "${YELLOW}Minter/Recipient: $OINIO_CREATOR_EVM_ADDRESS${NC}"
echo ""

read -p "Mint the 6 foundational OINIO MR-NFTs? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Minting cancelled."
    exit 0
fi

# We use the python script for minting logic
echo -e "${YELLOW}Starting Python Minting Script...${NC}"
python3 scripts/mint_models.py \
    --nft-address "$NFT_ADDRESS" \
    --creator-address "$OINIO_CREATOR_EVM_ADDRESS"
    
echo ""
echo -e "${GREEN}=========================================="
echo "ALL 6 OINIO SEED MODELS MINTED!"
echo -e "==========================================${NC}"
