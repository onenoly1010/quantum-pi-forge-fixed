#!/bin/bash
# QUICK_START.md - 5-Minute Deployment Checklist

# 1. GATHER CREDENTIALS (5 minutes)
# From Supabase Dashboard:
export SUPABASE_URL="paste-here"
export SUPABASE_ANON_KEY="paste-here"
export SUPABASE_SERVICE_KEY="paste-here"

# From Pi Network Dashboard:
export PI_NETWORK_APP_ID="paste-here"
export PI_NETWORK_API_KEY="paste-here"
export PI_NETWORK_WEBHOOK_SECRET="paste-here"

# Generate JWT Secret:
export JWT_SECRET=$(openssl rand -base64 32)

# 2. ADD TO VERCEL ENVIRONMENT (2 minutes)
# Go to: https://vercel.com/dashboard
# Select: quantum-pi-forge project
# Settings → Environment Variables
# Add each variable above as:
#   - Name: NEXT_PUBLIC_SUPABASE_URL
#   - Value: [your-value]
#   - Environments: Production, Preview, Development
#   - Click "Add"
# Repeat for all variables

# 3. COMMIT AND PUSH (1 minute)
cd ~/quantum-pi-forge-fixed
git add .
git commit -m "feat: Migrate backend to Vercel serverless functions"
git push origin main

# 4. WAIT FOR DEPLOYMENT (Auto)
# Vercel automatically deploys when you push to main
# Monitor at: https://vercel.com/dashboard/quantum-pi-forge

# 5. TEST ENDPOINTS (1 minute)
# Once deployment shows "Ready":
curl https://quantumpiforge.com/api/health
curl https://quantumpiforge.com/api/pi-network/status
curl https://quantumpiforge.com/api/supabase/status

# ✅ DONE! Your backend is now serverless and global.

# TROUBLESHOOTING:
# Build failed? Check: https://vercel.com/dashboard/[project]/deployments
# Environment variable not set? Double-check Vercel dashboard Settings > Environment Variables
# 404 errors? Make sure files are in app/api/* directory (not pages/api/*)
# Database connection fails? Verify NEXT_PUBLIC_SUPABASE_URL and keys are correct

# MONITORING:
# Real-time logs: https://vercel.com/dashboard/[project]/deployments
# Performance: https://vercel.com/analytics/[project]
# Error tracking: Configure Sentry (optional)
