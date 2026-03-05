# Debugging Loading Issue - Step by Step

## Current Situation
The page is stuck on "Loading..." after login. This is likely because:
1. The old JWT token in localStorage doesn't have the `phoneNumber` field
2. The backend needs to be restarted to generate new tokens with the updated format

## Quick Fix Steps

### Step 1: Clear Browser Storage

**Option A - Using Browser DevTools:**
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. In the left sidebar, find "Local Storage"
4. Click on `http://localhost:5173`
5. Right-click and select "Clear"
6. Also clear "Session Storage" if present

**Option B - Using the Clear Storage Page:**
1. Navigate to: `http://localhost:5173/clear-storage.html`
2. Click "Clear Storage" button
3. Click "Go to Login" button

**Option C - Using Console:**
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Type: `localStorage.clear()`
4. Press Enter

### Step 2: Restart Backend Server

The backend needs to be restarted to use the updated token generation code.

```bash
# Stop the current backend server (Ctrl+C)
# Then restart:
cd wall-decor-visualizer/backend
npm run dev
```

Wait for the message: `Server running on http://localhost:3000`

### Step 3: Verify Frontend is Running

```bash
# In a separate terminal:
cd wall-decor-visualizer/frontend
npm run dev
```

Wait for the message: `Local: http://localhost:5173/`

### Step 4: Test Login Again

1. Navigate to `http://localhost:5173`
2. Enter phone number: `1234567890`
3. Click "Send OTP"
4. Enter OTP: `2213`
5. Click "Verify OTP"
6. Should now redirect to upload page successfully

## Checking Console Logs

Open browser DevTools (F12) and go to Console tab. You should see logs like:

```
UploadPage: Checking authentication { hasToken: true, hasUserId: true }
UploadPage: Token decoded { decoded: { userId: "...", phoneNumber: "1234567890", exp: ... } }
UploadPage: Authentication successful { userId: "...", phoneNumber: "1234567890" }
```

## If Still Stuck on Loading

### Check 1: Verify Token Structure
In browser console, type:
```javascript
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

You should see:
```javascript
{
  userId: "some-id",
  phoneNumber: "1234567890",
  exp: 1234567890,
  iat: 1234567890
}
```

If `phoneNumber` is missing, the backend wasn't restarted or you're using an old token.

### Check 2: Verify Backend is Running
In a new terminal:
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

### Check 3: Check Backend Logs
Look at the backend terminal for any errors during OTP verification.

### Check 4: Check Frontend Console for Errors
Look for any red error messages in the browser console.

## Common Issues

### Issue 1: "Token missing phoneNumber"
**Cause:** Old token in localStorage
**Fix:** Clear localStorage and login again

### Issue 2: Backend not responding
**Cause:** Backend server not running or crashed
**Fix:** Restart backend server

### Issue 3: MongoDB connection error
**Cause:** MongoDB not running or connection string incorrect
**Fix:** Check backend logs, verify MongoDB connection string in `.env.local`

### Issue 4: Port already in use
**Cause:** Another process using port 3000 or 5173
**Fix:** 
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Verification Checklist

After following the steps above:

- [ ] Backend server is running on port 3000
- [ ] Frontend server is running on port 5173
- [ ] Browser localStorage is cleared
- [ ] Can access login page at `http://localhost:5173`
- [ ] Can submit phone number and receive OTP
- [ ] Can verify OTP with code 2213
- [ ] Redirects to upload page successfully
- [ ] Upload page shows header with phone number
- [ ] Upload options are visible
- [ ] No console errors

## Still Having Issues?

If you're still stuck after following all steps:

1. **Check browser console** - Copy any error messages
2. **Check backend logs** - Copy any error messages from terminal
3. **Check network tab** - Look for failed API requests
4. **Verify environment variables** - Check `.env.local` files exist and have correct values

## Next Steps After Fix

Once the upload page loads successfully:
1. Continue with manual testing from `MANUAL_TESTING_GUIDE.md`
2. Test file upload functionality
3. Test camera capture functionality
4. Document any issues found
