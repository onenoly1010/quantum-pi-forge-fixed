# 🚀 Pi Forge Quantum Genesis - Deployment Checklist

## Current Deployment Status

### **Backend (Vercel Serverless)** 🚀 MIGRATING

- **Service**: Next.js API Routes (TypeScript)
- **Platform**: Vercel Functions (auto-scaling)
- **URL**: `https://quantumpiforge.com/api/*`
- **Status**: 🔄 **MIGRATING** - Routes created, deploying to production
- **Health**: `https://quantumpiforge.com/api/health`
- **Created Routes**:
  - `GET /api/health` - Health check
  - `GET /api/pi-network/status` - Network status
  - `POST /api/payments/approve` - Payment approval
  - `POST /api/payments/complete` - Payment completion
  - `POST /api/pi-webhooks/payment` - Webhook receiver
  - `GET /api/supabase/status` - Database connectivity

### **Frontend (Vercel)** ✅

- **Service**: Next.js application
- **URL**: `https://quantumpiforge.com`
- **Status**: ✅ **LIVE (HTTP 200)**

### **Database (Supabase)**

- **Connection**: PostgreSQL via environment variables
- **Status**: ⏳ Awaiting environment variable configuration
- **Endpoint**: `GET /api/supabase/status`

### **Blockchain (Pi Network Mainnet)**

- **Integration**: Payment approval & completion endpoints
- **Webhook URL**: `https://quantumpiforge.com/api/pi-webhooks/payment`
- **Status**: Ready for testing once env vars configured

---

## Verification Steps

### 1️⃣ Test Railway Backend

```powershell
# Health check
curl https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/health

# Expected response:
# {"status": "healthy", "version": "1.0.0"}
```

**If fails**: Check Railway dashboard → Logs

### 2️⃣ Test Vercel Frontend

```powershell
# Frontend load
curl https://quantumpiforge.com/

# Should return HTML (200 OK)
```

**If fails**: Check Vercel deployment → Build logs

### 3️⃣ Verify Environment Variables in Railway

Required in Railway dashboard:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
PI_NETWORK_MODE=mainnet
PI_NETWORK_APP_ID=your-app-id
PI_NETWORK_API_KEY=your-api-key
PI_NETWORK_WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGINS=https://quantumpiforge.com,http://localhost:3000
```

**How to check**:
1. Go to https://railway.app/dashboard
2. Select `pi-forge-quantum-genesis` project
3. Click on the service
4. Go to **Variables** tab

### 4️⃣ Test Payment Integration

```powershell
# This requires Pi Browser - test locally first
# Open browser console at https://quantumpiforge.com
# And run: PiForge.initializePayment()
```

### 5️⃣ Check Supabase Connection

```powershell
# Test from Railway
curl https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/api/supabase/status
```

---

## 🔴 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 503 Service Unavailable | Railway service crashed | Check Railway logs, restart service |
| CORS Error | Frontend → Backend blocked | Add CORS_ORIGINS to Railway env |
| 404 on /health | Wrong Railway URL | Verify URL in Vercel config |
| Payment fails | Pi Network env vars missing | Set all PI_NETWORK_* vars in Railway |
| Supabase connection timeout | DB credentials wrong | Verify SUPABASE_URL & SUPABASE_KEY |

---

## Next Actions

- [ ] **CRITICAL**: Deploy Railway backend service
  - Go to https://railway.app/dashboard
  - Select `pi-forge-quantum-genesis` project
  - Check if service is running
  - If stopped, click "Deploy" or "Restart"
  
- [ ] Verify all env vars in Railway (once deployed)
  - SUPABASE_URL, SUPABASE_KEY
  - PI_NETWORK_MODE, PI_NETWORK_APP_ID, PI_NETWORK_API_KEY
  - PI_NETWORK_WEBHOOK_SECRET
  - CORS_ORIGINS
  
- [ ] Test health endpoint after Railway is live
  ```powershell
  curl https://pi-forge-quantum-genesis-production-4fc8.up.railway.app/health
  ```

- [ ] Test payment integration with Pi Browser
- [ ] Monitor logs for errors

---

**Last Updated**: 2025-12-15  
**Status**: Frontend live, backend needs deployment
