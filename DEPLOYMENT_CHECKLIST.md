# ✅ VERCEL DEPLOYMENT CHECKLIST

## 🎯 Your Repository
- **Project**: quantum-pi-forge-v2
- **GitHub**: onenoly1010/quantum-pi-forge-fixed
- **Branch**: main (default), infra/ledger-api-v1 (current)
- **Target Domain**: quantumpiforge.com

---

## PHASE 1: Identify Your Vercel Project (5 min)

### Task 1.1: Check Vercel Dashboard
- [ ] Open: https://vercel.com/dashboard
- [ ] Look at all 6 projects
- [ ] Find the one with **Domain: quantumpiforge.com**
- [ ] Write down the **Project Name**: ___________________________

### Task 1.2: Document the Setup
Once you find the project, verify:
- [ ] Project is connected to a GitHub repository
- [ ] Repository is either:
  - [ ] onenoly1010/quantum-pi-forge-fixed, OR
  - [ ] onenoly1010/pi-forge-quantum-genesis, OR
  - [ ] Other: ___________________________
- [ ] Domain is: quantumpiforge.com ✅
- [ ] Project is active (not archived)

---

## PHASE 2: Gather Credentials (10 min)

### Task 2.1: Supabase Credentials
Go to: https://supabase.com/dashboard

- [ ] Copy: `Project URL` → Paste below
  ```
  NEXT_PUBLIC_SUPABASE_URL = ____________________________________
  ```

- [ ] Go to: Settings → API → Project API Keys
- [ ] Copy: `anon public` key → Paste below
  ```
  NEXT_PUBLIC_SUPABASE_ANON_KEY = ____________________________________
  ```

- [ ] Copy: `service_role secret` key → Paste below
  ```
  SUPABASE_SERVICE_ROLE_KEY = ____________________________________
  ```

### Task 2.2: Pi Network Credentials
Go to: https://dashboards.minepi.com/ (or where you have your app)

- [ ] Copy: `App ID` → Paste below
  ```
  PI_NETWORK_APP_ID = ____________________________________
  ```

- [ ] Copy: `API Key` → Paste below
  ```
  PI_NETWORK_API_KEY = ____________________________________
  ```

- [ ] Copy: `Webhook Secret` → Paste below
  ```
  PI_NETWORK_WEBHOOK_SECRET = ____________________________________
  ```

### Task 2.3: Generate JWT Secret
In PowerShell or terminal, run:
```bash
openssl rand -base64 32
```

Copy the output → Paste below:
```
JWT_SECRET = ____________________________________
```

---

## PHASE 3: Configure Vercel Project (10 min)

### Task 3.1: Link Project (if not already linked)
```bash
cd c:\Users\Colle\Downloads\quantum-pi-forge-fixed

npm install -g vercel

vercel login

vercel link
```

When prompted:
- [ ] Select your scope (usually "personal")
- [ ] Project name: (the one serving quantumpiforge.com)
- [ ] Confirm settings

### Task 3.2: Add Environment Variables
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

For EACH variable below:
1. Click "Add"
2. Paste the name and value from Phase 2
3. Check: Production, Preview, Development
4. Click "Save"

Variables to add:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (from 2.1)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from 2.1)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (from 2.1)
- [ ] `PI_NETWORK_APP_ID` = (from 2.2)
- [ ] `PI_NETWORK_API_KEY` = (from 2.2)
- [ ] `PI_NETWORK_WEBHOOK_SECRET` = (from 2.2)
- [ ] `JWT_SECRET` = (from 2.3)
- [ ] `PI_NETWORK_MODE` = `mainnet` (static value)
- [ ] `PI_NETWORK_API_ENDPOINT` = `https://api.minepi.com` (static value)
- [ ] `NEXT_PUBLIC_CORS_ORIGINS` = `https://quantumpiforge.com` (static value)

**Verify:**
- [ ] All 10 environment variables show in dashboard
- [ ] Status shows "Added" for each
- [ ] All are scoped to "Production"

---

## PHASE 4: Deploy (5 min)

### Task 4.1: Commit Changes
```bash
cd c:\Users\Colle\Downloads\quantum-pi-forge-fixed

git add .

git commit -m "feat: Configure Vercel serverless backend with environment variables"

git push origin main
```

- [ ] Changes committed
- [ ] Push to origin/main completed
- [ ] No git conflicts

### Task 4.2: Monitor Deployment
Go to: Vercel Dashboard → Your Project → Deployments

- [ ] You should see a new deployment starting
- [ ] Status changes from "Building" → "Running" → "Ready"
- [ ] Watch the logs for any errors
- [ ] Once "Ready", deployment is complete

**How long:** Usually 2-5 minutes

---

## PHASE 5: Verify (5 min)

### Task 5.1: Test Endpoints
In PowerShell, run:

```powershell
# Test 1: Health Check
$response = Invoke-WebRequest -Uri "https://quantumpiforge.com/api/health"
Write-Host "Status: $($response.StatusCode)"
$response.Content | ConvertFrom-Json | Format-Table

# Test 2: Pi Network Status
$response = Invoke-WebRequest -Uri "https://quantumpiforge.com/api/pi-network/status"
$response.Content | ConvertFrom-Json | Format-Table

# Test 3: Supabase Status
$response = Invoke-WebRequest -Uri "https://quantumpiforge.com/api/supabase/status"
$response.Content | ConvertFrom-Json | Format-Table
```

Expected results:
- [ ] `/api/health` returns `{"status":"healthy",...}` (200 OK)
- [ ] `/api/pi-network/status` returns integration status (200 OK)
- [ ] `/api/supabase/status` returns connection status (200 OK)

### Task 5.2: Check Vercel Logs
Go to: Vercel Dashboard → Deployments → Latest → Logs

- [ ] No critical errors in logs
- [ ] See request logs from your tests above
- [ ] Build logs show success

---

## PHASE 6: Monitor (Ongoing)

### Task 6.1: Set Up Monitoring
- [ ] Bookmark: https://vercel.com/dashboard/[your-project]
- [ ] Enable Vercel Analytics (optional)
- [ ] Configure error notifications (optional)

### Task 6.2: Test Payment Flow (Next 24 hours)
- [ ] Test full payment approval flow
- [ ] Verify webhook receives payment updates
- [ ] Check Supabase logs for database operations

---

## 📊 Summary

| Phase | Status | Time | Notes |
|-------|--------|------|-------|
| 1. Identify Project | ⏳ TODO | 5 min | Find which project serves quantumpiforge.com |
| 2. Gather Credentials | ⏳ TODO | 10 min | Collect from Supabase & Pi Network |
| 3. Configure Vercel | ⏳ TODO | 10 min | Add env vars to Vercel dashboard |
| 4. Deploy | ⏳ TODO | 5 min | Push to main, auto-deploys |
| 5. Verify | ⏳ TODO | 5 min | Test endpoints work |
| 6. Monitor | ⏳ TODO | Ongoing | Watch logs & test payment flow |

**Total Time**: ~35-45 minutes

---

## 🆘 Help Section

### "I can't find quantumpiforge.com in my Vercel projects"
→ It might be in a different Vercel account
→ Check if you have multiple Vercel accounts
→ Check if the domain is on a custom domain provider

### "Environment variables not showing"
→ Refresh Vercel dashboard
→ Make sure you're in the right project
→ Verify they're saved (look for green checkmark)

### "Deployment fails"
→ Check Vercel build logs for error details
→ Common issue: Missing environment variable
→ Try re-deploying: Vercel Dashboard → Deployments → Redeploy

### "Endpoint returns 404"
→ Make sure deployment is "Ready" (green checkmark)
→ Verify the API route file exists: `app/api/health.ts`
→ Try: https://quantumpiforge.com/api/health (note: exact URL)

### "Endpoint returns 500 error"
→ Check Vercel logs: Deployments → Logs
→ Usually indicates missing environment variable
→ Verify all 10 env vars are set in dashboard

---

## ✨ Next Steps After Deployment

Once everything is working:

1. **Test full payment flow**: Create test payment in Pi Network
2. **Configure webhooks**: Add webhook URL to Pi Network dashboard
3. **Monitor for 24 hours**: Watch for any issues
4. **Load test** (optional): Send multiple requests to test scaling
5. **Document in wiki** (optional): Create runbook for team

---

**Start here**: Check your Vercel dashboard and identify which project serves `quantumpiforge.com` → Continue with Phase 2 ➡️
