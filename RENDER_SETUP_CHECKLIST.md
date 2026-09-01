# Render Backend Environment Variables Setup

## Quick Reference

Go to: https://dashboard.render.com → Orderly Backend → Settings → Environment

### Add These Variables:

#### 1️⃣ DATABASE_URL
```
postgresql://neondb_owner:npg_njC7uNYK6kAl@ep-steep-cherry-az4xwwg7-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 2️⃣ FRONTEND_URL
```
https://orderlyprocure.vercel.app/
```

#### 3️⃣ JWT_SECRET
```
orderly-jwt-secret-key-2026-secure-token
```

#### 4️⃣ NODE_ENV
```
production
```

#### 5️⃣ GEMINI_API_KEY
```
AIzaSyBTLSRFVBRHc9QbdIW33EPu859rOOy7Apk
```

---

## Steps to Complete

1. ✅ Open https://dashboard.render.com
2. ✅ Click on "Orderly Backend" service
3. ✅ Go to "Settings" tab
4. ✅ Scroll to "Environment" section
5. ✅ Add each variable from above
6. ✅ Click "Save"
7. ✅ Wait for auto-redeploy (2-3 minutes)
8. ✅ Test at https://orderlyprocure.vercel.app/

---

## Test Login After Deployment

**URL:** https://orderlyprocure.vercel.app/

**Credentials:**
- Email: `sneha@example.com`
- Password: `Password@123`

**Expected Result:**
- Login succeeds ✓
- Redirects to dashboard ✓
- All features work ✓

---

## If Something Goes Wrong

### "Failed to fetch" error
**Cause:** DATABASE_URL or FRONTEND_URL not set  
**Fix:** Check all 5 variables are added correctly in Render

### Login fails with "Invalid email or password"
**Cause:** Database not initialized  
**Fix:** Run Prisma seed on Neon database

### 504 Gateway Timeout
**Cause:** Backend still starting up  
**Fix:** Wait a few minutes and refresh

### Connection refused
**Cause:** FRONTEND_URL not set to `https://orderlyprocure.vercel.app/`  
**Fix:** Update FRONTEND_URL in Render Environment Variables

---

## Completed Setup

- ✅ Vercel frontend deployed
- ✅ vercel.json configured
- ✅ Neon PostgreSQL database
- ✅ Render backend ready for environment variables
- ⏳ **Waiting:** You to add environment variables to Render

**Your Next Action:** Add the 5 environment variables above to Render dashboard.
