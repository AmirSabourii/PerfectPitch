# Netlify 404 API Route Troubleshooting

## Problem
Getting 404 errors when calling `/api/parse-doc` endpoint on Netlify deployment.

## Root Cause
Netlify's Next.js plugin may not be properly detecting or building the API routes.

## Fixes Applied

### 1. Removed Manual Redirects
Removed the manual `[[redirects]]` section from `netlify.toml` that was interfering with the `@netlify/plugin-nextjs` automatic routing.

### 2. Added `dynamic` Export
Added `export const dynamic = 'force-dynamic'` to API routes to ensure they're treated as serverless functions:
- ✅ `app/api/parse-doc/route.ts`
- ✅ `app/api/analyze-pitch/route.ts`
- ✅ `app/api/transcribe/route.ts` (already had it)

### 3. Verified Route Structure
All API routes follow the correct Next.js 14 App Router structure:
```
app/api/[route-name]/route.ts
```

## Deployment Steps

### Step 1: Clear Netlify Cache
Before deploying, clear the Netlify build cache:
1. Go to Netlify dashboard
2. Site settings → Build & deploy → Build settings
3. Click "Clear cache and retry deploy"

### Step 2: Check Build Logs
After deployment, check the build logs for:
- ✅ "Next.js API Routes detected"
- ✅ "Creating serverless functions"
- ✅ Look for `parse-doc` in the function list

### Step 3: Verify Function Deployment
In Netlify dashboard:
1. Go to Functions tab
2. Look for `___netlify-handler` or similar Next.js handler
3. Check if it's deployed successfully

### Step 4: Test Locally with Netlify CLI
Test the build locally before deploying:
```bash
npm install -g netlify-cli
netlify dev
```

Then test the API:
```bash
curl -X POST http://localhost:8888/api/parse-doc \
  -F "file=@test.pdf"
```

## Common Issues & Solutions

### Issue 1: API Routes Not Found (404)
**Symptoms:** All API routes return 404
**Solution:** 
- Ensure `@netlify/plugin-nextjs` is in `package.json` devDependencies
- Clear Netlify cache and redeploy
- Check that `netlify.toml` doesn't have conflicting redirects

### Issue 2: Some Routes Work, Others Don't
**Symptoms:** `/api/transcribe` works but `/api/parse-doc` doesn't
**Solution:**
- Ensure all routes have `export const dynamic = 'force-dynamic'`
- Check for TypeScript errors in the route file
- Verify the route file is named `route.ts` not `index.ts`

### Issue 3: Routes Work Locally but Not on Netlify
**Symptoms:** Works with `npm run dev` but not on Netlify
**Solution:**
- Check Next.js version compatibility with `@netlify/plugin-nextjs`
- Update `@netlify/plugin-nextjs` to latest version
- Ensure `runtime = 'nodejs'` is set in route exports

### Issue 4: Build Succeeds but Functions Don't Deploy
**Symptoms:** Build completes but API returns 404
**Solution:**
- Check Netlify Functions tab for deployed functions
- Look for errors in Function logs
- Verify environment variables are set in Netlify dashboard

## Verification Checklist

After deployment, verify:
- [ ] Build completes successfully
- [ ] No TypeScript errors in build logs
- [ ] Functions are listed in Netlify Functions tab
- [ ] Environment variables are set (OPENAI_API_KEY, Firebase vars)
- [ ] Test each API endpoint:
  - [ ] `/api/parse-doc` - POST with file
  - [ ] `/api/transcribe` - POST with audio
  - [ ] `/api/analyze-pitch` - POST with transcript
  - [ ] `/api/realtime/sessions` - POST for session

## Next Steps

1. **Commit and push** all changes
2. **Clear Netlify cache** in dashboard
3. **Trigger new deployment**
4. **Check build logs** for API route detection
5. **Test API endpoints** after deployment
6. **Check Function logs** if still getting 404s

## Alternative: Manual Function Configuration

If the plugin still doesn't work, you can manually configure functions in `netlify.toml`:

```toml
[functions]
  directory = ".netlify/functions"
  node_bundler = "esbuild"
  
[functions."___netlify-handler"]
  included_files = ["app/**", "lib/**", ".next/**"]
```

## Contact Support

If issues persist after trying all solutions:
1. Check Netlify Community Forums: https://answers.netlify.com/
2. Search for "Next.js 14 API routes 404"
3. Provide build logs and function logs when asking for help
