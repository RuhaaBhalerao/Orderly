# ProcureAI Full System Test Guide

## ✅ System Status
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3000
- ✅ Database connected and working
- ✅ All authentication endpoints functional

---

## 📋 Test Plan

### Test 1: User Registration with New Email

**Steps:**
1. Open browser to http://localhost:3000
2. Click "Sign Up" or go to registration page
3. Fill in form:
   - **Name:** `Alice Smith`
   - **Email:** `alice.smith@example.com`
   - **Password:** `SecurePass123!`
4. Click "Sign Up"

**Expected Results:**
- ✅ Registration succeeds
- ✅ Redirected to dashboard
- ✅ Header shows: "Welcome back, Alice 👋"
- ✅ Sidebar shows: `Alice Smith` (user name)
- ✅ Sidebar shows: `alice.smith@example.com` (user email)
- ✅ **NO hardcoded "Sarah Johnson" appears anywhere**

**Verification Checklist:**
- [ ] Header greeting shows "Alice" not "Sarah"
- [ ] Sidebar name shows "Alice Smith" not "Sarah Johnson"
- [ ] Sidebar email shows "alice.smith@example.com" not hardcoded email
- [ ] Avatar shows initials "AS" not "SJ"
- [ ] Browser console (F12) has NO auth errors

---

### Test 2: User Logout & Login with Different User

**Steps:**
1. From the Dashboard, click Settings (sidebar)
2. Find Gmail section or Account settings
3. Click "Logout" button
4. You should be redirected to login page
5. Register new user:
   - **Name:** `Bob Johnson`
   - **Email:** `bob.johnson@example.com`
   - **Password:** `SecurePass456!`

**Expected Results:**
- ✅ You are logged out completely
- ✅ New user registration succeeds
- ✅ Dashboard shows new user's data (Bob, not Alice)
- ✅ Header shows: "Welcome back, Bob 👋"
- ✅ Sidebar shows: `Bob Johnson`
- ✅ Sidebar shows: `bob.johnson@example.com`

**Verification Checklist:**
- [ ] Logout works without errors
- [ ] Login page loads correctly
- [ ] New user registration creates separate account
- [ ] Dashboard shows new user info (not Alice's data)
- [ ] No data leakage between users

---

### Test 3: Page Refresh Persistence

**Steps:**
1. Log in as User A (Alice)
2. Go to Dashboard
3. Verify it shows "Alice Smith" + "alice.smith@example.com"
4. Press F5 to refresh the page
5. Wait 2 seconds for page to load

**Expected Results:**
- ✅ Page refreshes successfully
- ✅ Dashboard still shows "Alice Smith" (not "Sarah Johnson")
- ✅ User remains authenticated
- ✅ No login redirect

**Verification Checklist:**
- [ ] Page refreshes without logout
- [ ] User data persists (localStorage working)
- [ ] Auth token is still valid
- [ ] Same user data shows after refresh

---

### Test 4: Protected Route Access

**Steps:**
1. Open a new incognito/private browser window
2. Try to access http://localhost:3000/dashboard directly
3. You should be redirected to login

**Expected Results:**
- ✅ Redirected to http://localhost:3000 (login page)
- ✅ Dashboard is not accessible without authentication
- ✅ No sensitive data leaks

**Verification Checklist:**
- [ ] Cannot access /dashboard without login
- [ ] Redirects to login page
- [ ] No error messages in console

---

### Test 5: Settings Page User Email Display

**Steps:**
1. Log in as any user
2. Click Settings in sidebar
3. Scroll to "Gmail Connection" or account section
4. Check the email displayed

**Expected Results:**
- ✅ Shows the authenticated user's email
- ✅ NOT hardcoded "sarah@acme.com" or "sarah.johnson@acme.com"
- ✅ Shows the email you registered with

**Verification Checklist:**
- [ ] Email matches registered email
- [ ] No hardcoded emails visible
- [ ] Email field reflects actual user

---

## 🔍 Browser Console Checks

Open DevTools (F12) and check the Console tab. You should see:

**✅ Good Signs:**
- Clean console (or only non-critical warnings)
- No "Cannot read property" errors
- No "AuthContext undefined" errors
- No "user is null/undefined" errors related to display

**❌ Bad Signs (if you see these, report):**
- `TypeError: Cannot read property 'name' of null`
- `AuthContext is undefined`
- `user.email is undefined`
- Multiple API 401 errors

---

## 🧪 API Testing (Optional - Advanced)

### Register a User via API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test.user@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "cmt9wel1g0000pb3q8o58ok3a",
    "name": "Test User",
    "email": "test.user@example.com"
  }
}
```

### Login User via API

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "TestPass123!"
  }'
```

### Get Current User (requires token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Test Results Summary

After running all tests, fill in:

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Registration | ☐ PASS ☐ FAIL | |
| Test 2: Logout & New User | ☐ PASS ☐ FAIL | |
| Test 3: Refresh Persistence | ☐ PASS ☐ FAIL | |
| Test 4: Protected Routes | ☐ PASS ☐ FAIL | |
| Test 5: Settings Display | ☐ PASS ☐ FAIL | |

---

## 🐛 Troubleshooting

### Issue: Still seeing "Sarah Johnson"
- **Solution:** Clear browser cache and localStorage
  1. Open DevTools (F12)
  2. Console tab
  3. Type: `localStorage.clear()` and press Enter
  4. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
  5. Try login again

### Issue: 401 errors on API calls
- **Solution:** Token may be expired
  1. Clear localStorage
  2. Log in again
  3. Check DevTools → Application → LocalStorage
  4. Look for `authToken` key

### Issue: Cannot reach backend
- **Solution:** Backend not running
  1. Open terminal
  2. `cd backend`
  3. `npm run dev`
  4. Wait for "Server running on port 5000"

### Issue: Frontend not loading
- **Solution:** Frontend not running
  1. Open new terminal window
  2. `cd frontend`
  3. `npm run dev`
  4. Wait for "Ready in X.Xs"

---

## ✅ Success Criteria

All of the following must be true:

1. ✅ New users can register with their own email
2. ✅ Each user sees their own profile (not hardcoded "Sarah")
3. ✅ User data persists after page refresh
4. ✅ Dashboard is protected (can't access without login)
5. ✅ Settings page shows authenticated user's email
6. ✅ Multiple users can log in/out without data leakage
7. ✅ No errors in browser console related to auth
8. ✅ Avatar initials match user's name

---

## 📝 Files Modified (This Session)

- ✅ `frontend/components/layout/Header.tsx` - Uses `useAuth()` hook, dynamic name/initials
- ✅ `frontend/components/layout/Sidebar.tsx` - Uses `useAuth()` hook, dynamic user info
- ✅ `frontend/app/(dashboard)/settings/page.tsx` - Uses `useAuth()` hook for email display
- ✅ `frontend/app/(dashboard)/layout.tsx` - Added auth protection & redirect to login

All hardcoded "Sarah Johnson" references removed ✓

---

## 🎯 Next Steps After Testing

1. **If all tests pass:** ✅ Authentication fix is complete!
2. **If some tests fail:** 
   - Check browser console for errors
   - Review the troubleshooting section
   - Report the specific test that failed

3. **Git Commit (when tests pass):**
   ```bash
   git add frontend/components/layout/Header.tsx \
           frontend/components/layout/Sidebar.tsx \
           frontend/app/\(dashboard\)/settings/page.tsx \
           frontend/app/\(dashboard\)/layout.tsx
   
   git commit -m "fix: resolve hardcoded profile issue - use authenticated user from AuthContext"
   git push -u origin fix/hardcoded-profile
   ```

---

## 📞 Questions?

If you run into issues:
1. Check browser console (F12) for error messages
2. Check backend terminal for connection errors
3. Verify both servers are running (ports 3000 and 5000)
4. Clear localStorage and try again
