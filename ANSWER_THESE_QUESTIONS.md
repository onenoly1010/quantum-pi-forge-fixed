# ❓ ANSWER THESE 3 QUESTIONS TO DEPLOY

## Question 1: Which Vercel Project?

Go to: https://vercel.com/dashboard

Find the project with domain: `quantumpiforge.com`

**What is the project name?**

```
Answer: _________________________________
```

(Probably one of these: `pi-forge-quantum-genesis`, `quantum-pi-forge-fixed`, etc.)

---

## Question 2: Ready with Credentials?

You need these 7 values:

### From Supabase (https://supabase.com/dashboard)
- [ ] SUPABASE_URL - Copy from: Settings → API → Project URL
- [ ] SUPABASE_ANON_KEY - Copy from: Settings → API → anon public key
- [ ] SUPABASE_SERVICE_KEY - Copy from: Settings → API → service_role secret key

### From Pi Network (https://developers.minepi.com)
- [ ] PI_NETWORK_APP_ID
- [ ] PI_NETWORK_API_KEY
- [ ] PI_NETWORK_WEBHOOK_SECRET

### Generate JWT Secret
```powershell
openssl rand -base64 32
```
- [ ] JWT_SECRET - (32-character random string from above)

**Have all 7 values ready?**

```
Answer: Yes ☐  No ☐
```

---

## Question 3: Ready to Deploy?

Once you have:
1. ✅ Identified your Vercel project
2. ✅ Gathered all 7 credentials
3. ✅ Added them to Vercel dashboard (Settings → Environment Variables)

**Are you ready to push code to main?**

```
Answer: Yes ☐  No ☐
```

---

## 🚀 Once You Answer These 3 Questions

I will give you the **exact deployment commands** for your specific setup:

```bash
git add .
git commit -m "✨ Deploy Vercel serverless backend"
git push origin main
```

Then Vercel auto-deploys and your backend goes **LIVE** in 2-5 minutes! 🎉

---

## 📋 Your Quick Checklist

- [ ] Q1: Identified your Vercel project name
- [ ] Q2: Have all 7 credentials gathered
- [ ] Q3: Ready to execute deployment

**Reply with your answers above and I'll complete your deployment!** ✅
