# Netlify Timeout Fixes Applied

## Problem
The application was experiencing 504 timeout errors within the first second on the `/api/analyze-pitch` endpoint across all three modes (audio, file, realtime). The root cause was that the code was configured for Vercel's timeout limits (300 seconds) but deployed on Netlify which has much shorter limits:
- **Netlify Free Tier**: 10 seconds
- **Netlify Pro Tier**: 26 seconds

## Changes Applied

### 1. Updated `netlify.toml`
- Added explicit function configuration
- Added node_bundler setting for better performance
- Added redirect configuration for API routes
- **Note**: The timeout increase requires Netlify Pro plan

### 2. Updated `lib/timeout.ts`
**Reduced all timeout values to fit within Netlify's limits:**
- `OPENAI_TRANSCRIBE`: 300s → 20s
- `OPENAI_CHAT`: 120s → 15s
- `OPENAI_ANALYSIS`: 300s → 20s
- `OPENAI_REALTIME_SESSION`: 60s → 8s
- `PDF_PARSE`: 120s → 15s
- `FIREBASE_OPERATION`: 30s → 5s
- `MAX_CONTENT_LENGTH`: 30,000 → 15,000 characters

### 3. Updated `app/api/analyze-pitch/route.ts`
**Added comprehensive logging and timing:**
- Added timestamp tracking for all operations
- Added `[analyze-pitch]` prefix to all logs for easy filtering
- Added elapsed time logging at key points
- Improved error messages with context
- Added early validation checks
- Added comment about Netlify vs Vercel timeout differences

### 4. Updated `lib/aiAnalyzer.ts`
**Optimized for speed:**
- Reduced `MAX_TRANSCRIPT_LENGTH`: 30,000 → 15,000 characters
- Reduced `MAX_SLIDES_LENGTH`: 30,000 → 15,000 characters
- Reduced `max_tokens`: 2,500 → 2,000 tokens
- Added comprehensive logging with timestamps
- Added `[analyzePitchDeck]` prefix to all logs
- Set OpenAI timeout to leave 2-second buffer for processing

## Testing the Fixes

### 1. Check the Logs
After deploying, check Netlify function logs to see timing information:
```
[analyze-pitch] Request started
[analyze-pitch] Starting token verification
[analyze-pitch] Token verified in XXXms
[analyze-pitch] Checking usage limits
[analyze-pitch] Parsing request body
[analyze-pitch] Starting AI analysis (elapsed: XXXms)
[analyzePitchDeck] Starting analysis
[analyzePitchDeck] Calling OpenAI (elapsed: XXXms)
[analyzePitchDeck] OpenAI responded in XXXms
[analyzePitchDeck] Analysis complete in XXXms
[analyze-pitch] Analysis complete in XXXms
```

### 2. Monitor for Specific Issues
- **If timeout happens < 5s**: Firebase Admin initialization issue
- **If timeout happens 5-10s**: OpenAI API call taking too long
- **If timeout happens at 10s exactly**: Netlify free tier limit hit

### 3. Upgrade Path
If you continue to see timeouts, you have two options:

**Option A: Upgrade to Netlify Pro**
- Increases timeout to 26 seconds
- Should be sufficient for most analysis requests

**Option B: Implement Async Processing**
- Accept request immediately
- Process in background
- Return results via polling or webhook
- More complex but works on free tier

## Next Steps

1. **Deploy the changes** to Netlify
2. **Test all three modes**:
   - Audio recording mode
   - File upload mode
   - Realtime conversation mode
3. **Monitor the logs** in Netlify dashboard
4. **If still timing out**, consider:
   - Upgrading to Netlify Pro
   - Further reducing content length limits
   - Implementing async processing pattern

## Important Notes

- The `maxDuration = 300` setting in the API routes **only works on Vercel**, not Netlify
- Netlify free tier has a hard 10-second limit that cannot be changed
- Content is now truncated more aggressively (15k chars instead of 30k)
- OpenAI responses are limited to 2000 tokens instead of 2500
- All operations have shorter timeouts to fail fast and provide better error messages
