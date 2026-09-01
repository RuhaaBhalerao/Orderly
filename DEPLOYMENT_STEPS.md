# Orderly Deployment Steps

## FINAL REDEPLOYMENT CHECKLIST

### Step 1: Verify Render Backend Environment Variables ⚠️ CRITICAL
**Go to:** https://dashboard.render.com → Your Orderly Backend Service → Settings → Environment

**Verify/Add these variables:**

```
DATABASE_URL = [your database URL]
JWT_SECRET = [your JWT secret, 16+ characters]
FRONTEND_URL = https://orderly-procurement.vercel.app
NODE_ENV = production
```

**IMPORTANT:** The `FRONTEND_URL` must be set to `https://orderly-procurement.vercel.app` to allow CORS from the frontend.

**Action:** If you made changes, click "Save" and the backend will auto-redeploy.

---

### Step 2: Verify Vercel Frontend Environment Variables
**Go to:** https://vercel.com → orderly-procurement project → Settings → Environment Variables

**Verify/Add:**

```
NEXT_PUBLIC_API_URL = https://orderly-7x4s.onrender.com/api
```

**Scope:** Production

---

### Step 3: Trigger Vercel Redeployment
**Option A - Automatic (Recommended):**
1. Go to https://vercel.com → orderly-procurement
2. Go to "Deployments" tab
3. Click "Redeploy" button on the latest deployment

**Option B - Via Git Push:**
```bash
git push origin main
```
This will automatically trigger a redeployment.

---

### Step 4: Wait for Build to Complete
- Frontend build takes ~2-3 minutes
- Watch the build logs for:
  - ✓ "Route (app)" section showing all routes
  - ✓ "Build completed successfully"
  - ✓ "Deployment complete"

---

### Step 5: Test Production Deployment

**Test URL:** https://orderly-procurement.vercel.app/

**Try logging in with:**
- Email: `sneha@example.com`
- Password: `Password@123`

**Expected results:**
- ✓ Login page loads without 404
- ✓ Login succeeds
- ✓ Redirects to dashboard
- ✓ All features work

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `vercel.json` | Created | Tells Vercel to deploy from frontend directory |
| `frontend/.env.local` | Updated | Local dev config (NOT committed) |
| Backend | No changes | Configured on Render dashboard |

---

## Troubleshooting

### If still getting 404:
1. Check Vercel build logs - look for "Route (app)" section
2. Verify vercel.json exists in repository root
3. Hard refresh browser (Ctrl+Shift+R)

### If getting "Failed to fetch":
1. Check CORS: Render's `FRONTEND_URL` must be `https://orderly-procurement.vercel.app`
2. Verify `NEXT_PUBLIC_API_URL` in Vercel is `https://orderly-7x4s.onrender.com/api`
3. Test backend directly: https://orderly-7x4s.onrender.com/api/health

### If login fails:
1. Check backend is running on Render
2. Test login via Postman: POST to `https://orderly-7x4s.onrender.com/api/auth/login`
3. Verify JWT_SECRET is set on Render

---

## Local Development

To run locally:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Frontend will be at http://localhost:3000
Backend will be at http://localhost:5000
