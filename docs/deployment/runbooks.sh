#!/bin/bash
################################################################################
# OINIO LAUNCH - QUICK REFERENCE CARD
# All essential commands in one place
################################################################################

echo "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    OINIO LAUNCH - QUICK REFERENCE                            ║
║                   Status: 95% Ready (1 Blocker: DEX Router)                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

📍 CURRENT LOCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd /workspaces/quantum-pi-forge-fixed


🎯 NEXT STEPS (IN ORDER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Resolve DEX Router Blocker (15 minutes) ⚡
────────────────────────────────────────────────

bash scripts/deploy-dex.sh

This will:
✓ Check if Uniswap V2 Router exists on 0G Aristotle
✓ Auto-update .env.launch if found
✓ Show deployment guide if not found

Expected Output: Either ✅ router address found OR ℹ️ deployment guide


Step 2: If Router Not Found, Get Community Help (Async) 💬
──────────────────────────────────────────────────────────

cat DISCORD_QUERY.md  # Review pre-written message

Then post to: https://discord.gg/0g-labs → #developer-support

While waiting for response: Proceed with Step 3


Step 3: Configure Environment Variables (30 minutes) 📝
───────────────────────────────────────────────────────

nano .env.launch

Required values (get from Guild + wallet):
  - GUILD_API_KEY=sk_...
  - ZERO_G_GRANT_ID=grant_...
  - DEPLOYER_PRIVATE_KEY=0x...
  - DEPLOYER_ADDRESS=0x...
  - DEX_ROUTER_ADDRESS=0x...  ← (from Step 1)
  - WGAS_ADDRESS=0x...        ← (0G wrapped gas)


Step 4: Deploy Frontend (5 minutes) 🚀
──────────────────────────────────────

# Verify build
npm run build

# If successful, push to GitHub
git status  # Review changes
git add .
git commit -m \"Ready for launch\"
git push origin main

Vercel will auto-deploy. Dashboard available at: https://your-vercel-domain.com


Step 5: Start Monitoring (1 minute) 📡
──────────────────────────────────────

# Load environment
source .env.launch

# Start monitoring in background
bash scripts/monitor-grant.sh &

# In separate terminal, view dashboard
bash scripts/launch-dashboard.sh

System now watches guild.0g.ai for grant approval. When approved: Auto-deploy!


Step 6: Execute Launch (< 5 minutes, automated) ✨
──────────────────────────────────────────────────

When grant is approved:
- monitoring script detects approval
- deploy.sh executes automatically
- Token goes live on 0G Aristotle
- Announcements post to Discord
- Leaderboard starts recording activity


═══════════════════════════════════════════════════════════════════════════════

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cat FINAL_SPRINT_STATUS.md  ← READ FIRST: Current status, blockers, timeline
cat LAUNCH_SETUP.md         ← Detailed config guide
cat LAUNCH_ANNOUNCEMENTS.md ← Twitter/Discord/Email templates
cat DISCORD_QUERY.md        ← Community message template
cat INDEX.md                ← Navigation hub for all docs

═══════════════════════════════════════════════════════════════════════════════

🔧 USEFUL COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Check configuration
source .env.launch
echo \"GUILD_API_KEY: \$GUILD_API_KEY\"
echo \"ZERO_G_RPC_URL: \$ZERO_G_RPC_URL\"

# Build frontend
npm run build

# Check for errors
npm run lint

# Test RPC connection
curl -X POST -H \"Content-Type: application/json\" \\
  --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' \\
  https://evmrpc.0g.ai | jq .

# View git log
git log --oneline -10

# Kill background process
ps aux | grep monitor-grant
kill <PID>

# Clear logs
rm -rf logs/*

═══════════════════════════════════════════════════════════════════════════════

⏱️  TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOW                 Phase 1: Resolve DEX Router       [15 min]
|
+15 min             Phase 2: Configure Environment    [30 min]
|
+45 min             Phase 3: Deploy Frontend          [5 min]
|
+50 min             Phase 4: Start Monitoring         [1 min]
|
+51 min             SYSTEM READY ✅ (awaiting grant approval)
|
+X hours            Phase 5: LAUNCH (< 5 min, auto)   [GRANT APPROVED]
|
+X:05 hours        ✨ TOKEN LIVE ✨
                    Users minting iNFTs
                    Validators staking
                    Royalties flowing

═══════════════════════════════════════════════════════════════════════════════

🆘 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: \"DEPLOYER_PRIVATE_KEY not set\"
Solution: Edit .env.launch and add your wallet private key

Problem: \"RPC endpoint not responding\"
Solution: Check internet connection, try: curl https://evmrpc.0g.ai

Problem: \"Scripts not executable\"
Solution: chmod +x scripts/*.sh

Problem: \"Build failing with TypeScript errors\"
Solution: npm install && npm run build

Problem: \"DEX Router not found\"
Solution: Post to Discord for help (see DISCORD_QUERY.md)

═══════════════════════════════════════════════════════════════════════════════

✅ READINESS CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before launch, verify:

✓ Frontend Dashboard:     npm run build → NO ERRORS
✓ RPC Connection:         curl https://evmrpc.0g.ai → returns chain ID
✓ Environment Config:     source .env.launch → NO ERRORS
✓ DEX Router:            bash scripts/deploy-dex.sh → FINDS ROUTER
✓ Monitoring Script:      bash scripts/monitor-grant.sh → STARTS OK
✓ All Secrets:           .env.launch protected in .gitignore
✓ Documentation:         All guides reviewed
✓ Announcements:         Templates ready to post
✓ Discord Server:        Community channel ready
✓ Wallet:               Sufficient gas tokens

═══════════════════════════════════════════════════════════════════════════════

🎯 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 BLOCKER: Get DEX Router Address
   → Run: bash scripts/deploy-dex.sh
   → Or: Post to Discord (DISCORD_QUERY.md)
   → Or: Deploy your own Uniswap V2

🟡 CONFIG: Populate .env.launch
   → Get values from Guild + wallet
   → Edit: nano .env.launch

🟢 DEPLOY: Push to GitHub → Vercel auto-deploys
   → git push origin main

⚪ LAUNCH: Monitor grant approval
   → bash scripts/monitor-grant.sh &
   → Automation handles the rest

═══════════════════════════════════════════════════════════════════════════════

Ready? Start with:
  bash scripts/deploy-dex.sh

Questions? Check:
  cat INDEX.md

═══════════════════════════════════════════════════════════════════════════════
" | less
