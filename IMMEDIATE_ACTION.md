#!/bin/bash
# DEPLOYMENT_GUIDE.sh - Step-by-step Vercel deployment

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════╗
║                 QUANTUM PI FORGE - VERCEL DEPLOYMENT                  ║
║                      IMMEDIATE ACTION GUIDE                           ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ VERIFICATION: All migration files exist in:
   c:\Users\Colle\Downloads\quantum-pi-forge-fixed\

   ✓ 00_READ_ME_FIRST.md
   ✓ START_HERE.md
   ✓ DEPLOYMENT_CHECKLIST.md
   ✓ 6 API endpoints (app/api/*)
   ✓ 2 client libraries (lib/*)
   ✓ Configuration files (vercel.json, .env.*)

═══════════════════════════════════════════════════════════════════════

📋 YOUR DEPLOYMENT CHECKLIST (Complete these NOW)

STEP 1: Identify Target Vercel Project (2 minutes)
┌─────────────────────────────────────────────────────┐
│ 1. Go to: https://vercel.com/dashboard             │
│ 2. Look at your 6 projects                         │
│ 3. Find the one with DOMAIN: quantumpiforge.com    │
│ 4. Write down the PROJECT NAME:                    │
│                                                     │
│    Project Name: ____________________________        │
│                                                     │
│    (Most likely: "pi-forge-quantum-genesis" or    │
│     "quantum-pi-forge-fixed")                      │
└─────────────────────────────────────────────────────┘

STEP 2: Gather Your 7 Credentials (10 minutes)
┌─────────────────────────────────────────────────────┐
│ A. From Supabase (https://supabase.com/dashboard)  │
│    Settings → API → Copy:                          │
│                                                     │
│    SUPABASE_URL:                                   │
│    __________________________________________________│
│                                                     │
│    SUPABASE_ANON_KEY:                              │
│    __________________________________________________│
│                                                     │
│    SUPABASE_SERVICE_KEY:                           │
│    __________________________________________________│
│                                                     │
│ B. From Pi Network Dashboard                       │
│    (https://dashboards.minepi.com/)                │
│                                                     │
│    PI_NETWORK_APP_ID:                              │
│    __________________________________________________│
│                                                     │
│    PI_NETWORK_API_KEY:                             │
│    __________________________________________________│
│                                                     │
│    PI_NETWORK_WEBHOOK_SECRET:                      │
│    __________________________________________________│
│                                                     │
│ C. Generate JWT Secret (run in terminal):          │
│    openssl rand -base64 32                         │
│                                                     │
│    JWT_SECRET:                                     │
│    __________________________________________________│
└─────────────────────────────────────────────────────┘

STEP 3: Add Variables to Vercel Dashboard (10 minutes)
┌─────────────────────────────────────────────────────┐
│ 1. Go to: https://vercel.com/dashboard             │
│ 2. Select your quantumpiforge.com project          │
│ 3. Settings → Environment Variables                │
│ 4. Click "Add" for EACH variable below:            │
│                                                     │
│ Add These 10 Variables:                            │
│ ─────────────────────────────────────────────────  │
│ ✓ SUPABASE_URL                                     │
│ ✓ SUPABASE_ANON_KEY                                │
│ ✓ SUPABASE_SERVICE_KEY                             │
│ ✓ PI_NETWORK_APP_ID                                │
│ ✓ PI_NETWORK_API_KEY                               │
│ ✓ PI_NETWORK_WEBHOOK_SECRET                        │
│ ✓ JWT_SECRET                                       │
│ ✓ PI_NETWORK_MODE (= "mainnet")                    │
│ ✓ PI_NETWORK_API_ENDPOINT (= "https://api...")     │
│ ✓ NEXT_PUBLIC_CORS_ORIGINS (= "quantumpiforge...")│
│                                                     │
│ For EACH variable:                                 │
│ • Paste NAME and VALUE                             │
│ • Check: ✓ Production ✓ Preview ✓ Development     │
│ • Click "Save"                                     │
└─────────────────────────────────────────────────────┘

STEP 4: Deploy via Git Push (5 minutes)
┌─────────────────────────────────────────────────────┐
│ Run these commands:                                │
│                                                     │
│ git add .                                          │
│ git commit -m "✨ Deploy Vercel serverless backend" │
│ git push origin main                               │
│                                                     │
│ DONE! Vercel auto-builds and deploys...            │
│ (Takes 2-5 minutes)                                │
└─────────────────────────────────────────────────────┘

STEP 5: Verify Deployment Works (5 minutes)
┌─────────────────────────────────────────────────────┐
│ Once deployment shows "Ready" in Vercel dashboard: │
│                                                     │
│ Test endpoints in PowerShell:                      │
│                                                     │
│ curl https://quantumpiforge.com/api/health         │
│                                                     │
│ Expected Response:                                 │
│ {                                                  │
│   "status": "healthy",                             │
│   "version": "2.0.0"                               │
│ }                                                  │
│                                                     │
│ Status should be: 200 OK ✅                        │
│                                                     │
│ Also test:                                         │
│ • /api/pi-network/status                           │
│ • /api/supabase/status                             │
│ • /api/payments/approve (POST)                     │
└─────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

🎯 ESTIMATED TIME: 35-45 minutes TOTAL

✓ Step 1: 2 min
✓ Step 2: 10 min
✓ Step 3: 10 min
✓ Step 4: 5 min (+ 2-5 min auto-deploy)
✓ Step 5: 5 min

═══════════════════════════════════════════════════════════════════════

📚 DOCUMENTATION (if you get stuck)

QUICK REFERENCE:
→ 00_READ_ME_FIRST.md (overview)
→ START_HERE.md (60-second summary)
→ DEPLOYMENT_CHECKLIST.md (detailed 6-phase guide)
→ VERCEL_PROJECT_SETUP.md (if you need help identifying project)

═══════════════════════════════════════════════════════════════════════

🚀 READY? START HERE:

1. Go to: https://vercel.com/dashboard
2. Find your quantumpiforge.com project
3. Come back and run: git push origin main (after credentials are added)

═══════════════════════════════════════════════════════════════════════
EOF
