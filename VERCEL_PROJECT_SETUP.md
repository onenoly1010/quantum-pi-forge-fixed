# 🎯 Vercel Project Configuration Plan

## Current Status

### Repository
- **Name**: `quantum-pi-forge-v2`
- **GitHub**: `onenoly1010/quantum-pi-forge-fixed`
- **Current Branch**: `infra/ledger-api-v1`
- **Default Branch**: `main`

### Project Structure
✅ **API Routes Created:**
- `app/api/health.ts`
- `app/api/pi-network/status.route.ts`
- `app/api/payments/approve.route.ts`
- `app/api/payments/complete.route.ts`
- `app/api/pi-webhooks/payment.route.ts`
- `app/api/supabase/status.route.ts`

✅ **Configuration Files:**
- `vercel.json` - Vercel deployment config
- `.env.local.example` - Development template
- `.env.production` - Production guide

✅ **Dependencies Installed:**
- Next.js 14.0.0
- React 18.3.1
- react-dom 18.3.1

---

## 🔍 Step 1: Identify Your Vercel Project

### Find which project serves quantumpiforge.com:

**Option A: Via Vercel Dashboard (Fastest)**
1. Go to: https://vercel.com/dashboard
2. Look through all 6 projects
3. Find the one with **Domain**: `quantumpiforge.com`
4. Note the **Project Name**

**Option B: Via CLI (If Vercel CLI installed)**
```bash
# Check if CLI is installed
vercel --version

# If not installed:
npm install -g vercel

# Login to Vercel
vercel login

# List all projects and domains
vercel list
vercel domains ls
```

**Option C: Via DNS (Verify current setup)**
```bash
# Check what the domain points to
nslookup quantumpiforge.com
# or
dig quantumpiforge.com
# Look for CNAME pointing to vercel.com
```

### Expected Result:
You'll find something like:
```
Project: "pi-forge-quantum-genesis" or "quantum-pi-forge-fixed" or similar
Domain: quantumpiforge.com
Status: Production
```

---

## 🔗 Step 2: Link This Repository to the Correct Project

Once you've identified which project serves `quantumpiforge.com`:

### Option A: If using Vercel CLI
```bash
# Navigate to this repo
cd c:\Users\Colle\Downloads\quantum-pi-forge-fixed

# Install Vercel CLI if needed
npm install -g vercel

# Link to the project
vercel link

# When prompted:
# Select your team/scope (probably "personal")
# Found existing project settings? → "No"
# Project name → Enter the name (e.g., "quantum-pi-forge-fixed")
# Didn't find it? → Create new project
```

### Option B: Via Vercel Dashboard
1. Go to Vercel dashboard
2. Select the project that serves `quantumpiforge.com`
3. Settings → Git → Connect Git
4. Select: `onenoly1010/quantum-pi-forge-fixed`

---

## 🔐 Step 3: Configure Environment Variables

Add these to Vercel Dashboard → **Settings → Environment Variables** → **Production**:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase Dashboard |
| `PI_NETWORK_MODE` | `mainnet` | Static |
| `PI_NETWORK_API_ENDPOINT` | `https://api.minepi.com` | Static |
| `PI_NETWORK_APP_ID` | Your app ID | Pi Network Dashboard |
| `PI_NETWORK_API_KEY` | Your API key | Pi Network Dashboard |
| `PI_NETWORK_WEBHOOK_SECRET` | Your webhook secret | Pi Network Dashboard |
| `JWT_SECRET` | Random 32-char string | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_CORS_ORIGINS` | `https://quantumpiforge.com` | Static |

### How to add environment variables:
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Click "Add"
5. Name: `NEXT_PUBLIC_SUPABASE_URL`
6. Value: `[paste-your-value]`
7. Environments: Check "Production", "Preview", "Development"
8. Click "Save"
9. Repeat for each variable

---

## 🚀 Step 4: Deploy to Production

### Method 1: Via Git Push (Recommended)
```bash
# Navigate to repo
cd c:\Users\Colle\Downloads\quantum-pi-forge-fixed

# Ensure all files are committed
git add .
git commit -m "feat: Configure Vercel serverless backend"

# Push to main (or the deployed branch)
git push origin main
```

### Method 2: Via Vercel CLI
```bash
# Deploy immediately
vercel --prod

# This builds and deploys to production
```

### Method 3: Via Vercel Dashboard
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest main deployment
5. Confirm

---

## ✅ Step 5: Verify Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://quantumpiforge.com/api/health

# Expected response:
# {"status":"healthy","version":"2.0.0",...}

# Pi Network status
curl https://quantumpiforge.com/api/pi-network/status

# Supabase status
curl https://quantumpiforge.com/api/supabase/status
```

### Check deployment logs:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. View "Logs" for build and runtime logs

---

## 📋 Which Vercel Project is Yours?

Based on your repository list, here's what we know:

| Repository | Status | Action |
|------------|--------|--------|
| `quantum-pi-forge-fixed` | Current | ⬅️ **THIS IS THE ONE TO CONFIGURE** |
| `pi-forge-quantum-genesis` | May serve quantumpiforge.com? | Check dashboard |
| `quantum-resonance-clean` | Unknown | Check if used |
| Others | Unknown | May be archived |

**Your task:** Open https://vercel.com/dashboard and find which of the 6 projects has `quantumpiforge.com` as the domain.

---

## 🎬 Quick Action Items (In Order)

1. [ ] **Identify**: Which Vercel project serves `quantumpiforge.com`?
   - Check Vercel Dashboard
   - Look for project with that domain

2. [ ] **Get Credentials**:
   - Supabase: URL + 2 keys
   - Pi Network: App ID + API Key + Webhook Secret
   - JWT Secret: Run `openssl rand -base64 32`

3. [ ] **Link Project**:
   - Run: `vercel link`
   - OR link via Vercel Dashboard

4. [ ] **Add Environment Variables**:
   - Open Vercel Dashboard
   - Settings → Environment Variables
   - Add all 10 variables for Production

5. [ ] **Deploy**:
   - Push: `git push origin main`
   - Monitor: Check Vercel Deployments tab

6. [ ] **Test**:
   - Visit: `https://quantumpiforge.com/api/health`
   - Should return: `{"status":"healthy",...}`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Project not found" | Make sure you're linking to the correct Vercel project |
| "Environment variable missing" | Check Vercel dashboard Settings → Environment Variables |
| "Build fails with TypeScript errors" | Run locally: `pnpm build` to see errors |
| "404 on /api/health" | Ensure routes are in `app/api/` not `pages/api/` |
| "Can't connect to Supabase" | Verify URL and keys are correct in Vercel env vars |

---

## 📚 Resources

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Pi Network Developers: https://developers.minepi.com/
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

---

**Status**: 🟡 Ready for Configuration
**Next Action**: Identify your Vercel project serving `quantumpiforge.com`
**Estimated Time**: 15-30 minutes to complete all steps
