# Immediate Fixes for 404 API Route Error

## Changes Made ✅

### 1. Fixed `netlify.toml`
**Removed conflicting redirect** that was interfering with automatic routing:
```diff
- [[redirects]]
-   from = "/api/*"
-   to = "/.netlify/functions/___netlify-server-handler"
-   status = 200
-   force = true
```

The `@netlify/plugin-nextjs` plugin handles routing automatically.

### 2. Added `dynamic` Export to API Routes
Added to ensure routes are treated as serverless functions:
- ✅ `app/api/parse-doc/route.ts`
- ✅ `app/api/analyze-pitch/route.ts`

### 3. Fixed TypeScript Compilation Errors
Fixed variable scope issues in:
- ✅ `app/api/parse-doc/route.ts` - `fileSize` and `fileName` variables
- ✅ `app/api/transcribe/route.ts` - `fileSize` variable

## Deploy Now 🚀

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix Netlify API routing and timeout issues"
git push
```

### Step 2: Clear Netlify Cache
1. Go to https://app.netlify.com/
2. Select your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Clear cache and deploy site**

### Step 3: Monitor Build
Watch the build logs for:
- ✅ "Building Next.js API routes"
- ✅ "Creating serverless functions"
- ❌ Any errors or warnings

### Step 4: Test After Deployment
Test the API endpoint:
```bash
# Replace YOUR_SITE_URL with your Netlify URL
curl -X POST https://YOUR_SITE_URL/api/parse-doc \
  -F "file=@test.pdf"
```

Or test in the browser by uploading a file through your app.

## If Still Getting 404

### Option A: Check Netlify Function Logs
1. Go to Netlify dashboard
2. Click **Functions** tab
3. Look for `___netlify-handler` or similar
4. Click on it to see logs
5. Check for errors

### Option B: Verify Environment Variables
Make sure these are set in Netlify dashboard (Site settings → Environment variables):
- `OPENAI_API_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Option C: Update Netlify Plugin
If the issue persists, try updating the plugin:
```bash
npm install --save-dev @netlify/plugin-nextjs@latest
git add package.json package-lock.json
git commit -m "Update Netlify Next.js plugin"
git push
```

### Option D: Check Next.js Build Output
Look in the build logs for:
```
Route (app)                              Size     First Load JS
┌ ○ /api/parse-doc                       0 B            0 B
```

If you don't see your API routes listed, there might be a build issue.

## Expected Result

After deployment, you should see:
- ✅ Build completes successfully
- ✅ No 404 errors when calling `/api/parse-doc`
- ✅ File upload and parsing works
- ✅ All three modes (audio, file, realtime) work without timeout

## Current Status

**Files Modified:**
- `netlify.toml` - Removed conflicting redirect
- `app/api/parse-doc/route.ts` - Added dynamic export, fixed scope issues
- `app/api/analyze-pitch/route.ts` - Added dynamic export, optimized timeouts
- `app/api/transcribe/route.ts` - Fixed scope issues
- `lib/timeout.ts` - Reduced timeouts for Netlify
- `lib/aiAnalyzer.ts` - Optimized for faster processing

**Ready to Deploy:** ✅ Yes
**TypeScript Errors:** ✅ None
**Build Should Succeed:** ✅ Yes
