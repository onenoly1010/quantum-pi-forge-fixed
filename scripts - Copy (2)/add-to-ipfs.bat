# IPFS Add Script for Quantum Pi Forge
# Adds the existing build to IPFS

echo "🏛️  Adding Quantum Pi Forge to IPFS..."
echo "====================================="

# Check if IPFS is running
if curl -s "http://127.0.0.1:5001/api/v0/id" > /dev/null; then
    echo "✅ IPFS Desktop is running"
else
    echo "❌ IPFS Desktop is not running. Please start IPFS Desktop first."
    exit 1
fi

# Add the out directory to IPFS
echo "📤 Adding files to IPFS..."
IPFS_HASH=$(curl -s -X POST -F "file=@out/" "http://127.0.0.1:5001/api/v0/add?recursive=true&wrap-with-directory=true" | tail -1 | jq -r '.Hash')

if [ -z "$IPFS_HASH" ]; then
    echo "❌ Failed to add files to IPFS"
    exit 1
fi

echo "✅ Files added to IPFS!"
echo "📋 IPFS Hash: $IPFS_HASH"
echo "🌐 Local Gateway: http://127.0.0.1:8080/ipfs/$IPFS_HASH"
echo "🌍 Public Gateway: https://ipfs.io/ipfs/$IPFS_HASH"

# Pin the content
echo "📌 Pinning content locally..."
curl -s -X POST "http://127.0.0.1:5001/api/v0/pin/add?arg=$IPFS_HASH" > /dev/null
echo "✅ Content pinned locally"

# Save configuration
cat > ipfs-deployment.json << EOF
{
  "ipfsHash": "$IPFS_HASH",
  "ipfsUrl": "https://ipfs.io/ipfs/$IPFS_HASH",
  "gatewayUrl": "http://127.0.0.1:8080/ipfs/$IPFS_HASH",
  "deployedAt": "$(date -Iseconds)",
  "network": "0G Aristotle",
  "status": "frontend-deployed"
}
EOF

echo "💾 Configuration saved to ipfs-deployment.json"
echo ""
echo "🎉 IPFS Deployment Complete!"
echo "==========================="
echo "Next steps:"
echo "1. Test the application: http://127.0.0.1:8080/ipfs/$IPFS_HASH"
echo "2. Run Kraken withdrawal: node scripts/secure-kraken-withdrawal.js"
echo "3. Deploy CentralAwarenessV2 contract"
echo "4. Configure ENS domain"