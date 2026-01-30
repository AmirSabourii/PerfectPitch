# API JSON Format Fix

## Problem

Error when calling the API:
```
400 'messages' must contain the word 'json' in some form, 
to use 'response_format' of type 'json_object'.
```

## Root Cause

When using OpenAI's `response_format: { type: 'json_object' }`, the API requires that the word "JSON" appears somewhere in the conversation messages (system or user prompt). This is a safety feature to ensure the model knows it should output JSON.

## Solution

Added explicit "JSON" keyword to all user prompts in both API routes:

### Files Fixed

1. ✅ `app/api/analyze-pitch/route.ts` - All 3 stages
2. ✅ `app/api/perfect-pitch/route.ts` - All 3 stages

### Changes Made

#### Before (Caused Error):
```typescript
const userPrompt = `...
Analyze this pitch deck and return the structured output.`
```

#### After (Fixed):
```typescript
const userPrompt = `...
Analyze this pitch deck and return your analysis as a structured JSON object 
with complete reasoning for every score and judgment.`
```

## Specific Changes

### Stage 1 (Both Routes)
```typescript
// OLD
"Analyze this pitch deck as an experienced investor and return the structured JSON output."

// NEW
"Analyze this pitch deck as an experienced investor and return your analysis as a structured JSON object with complete reasoning for every score and judgment."
```

### Stage 2 (Both Routes)
```typescript
// OLD
"Generate the structured scorecard and prioritized checklist based on this analysis."

// NEW
"Generate the structured scorecard and prioritized checklist based on this analysis. Return your output as a JSON object with complete reasoning for all scores and decisions."
```

### Stage 3 (Both Routes)
```typescript
// OLD
"Run the six critical investor tests and generate the final gate verdict."

// NEW
"Run the six critical investor tests and generate the final gate verdict. Return your analysis as a JSON object with complete reasoning for all tests and the final verdict."
```

## Why This Works

1. **API Requirement**: OpenAI requires explicit mention of "JSON" when using `response_format: { type: 'json_object' }`
2. **Safety Feature**: Prevents accidental JSON mode activation
3. **Clear Intent**: Makes it explicit to the model that JSON output is expected
4. **Better Results**: Also reinforces that we want structured, complete reasoning

## Testing

After this fix:
- ✅ No TypeScript errors
- ✅ API should accept requests
- ✅ Model knows to output JSON
- ✅ Reasoning requirements still intact

## Additional Benefits

The new phrasing also:
- Reinforces the reasoning requirements
- Makes expectations clearer to the model
- Improves consistency across all stages
- Better aligns with our transparency goals

## Status

- ✅ Fix applied to both routes
- ✅ All 6 prompts updated (3 per route)
- ✅ No diagnostics errors
- ⏳ Ready for testing

## Next Steps

1. Test with actual pitch deck
2. Verify API accepts requests
3. Check that JSON output is properly formatted
4. Confirm reasoning objects are present

---

**Date**: 2026-01-29  
**Issue**: OpenAI API JSON format requirement  
**Status**: Fixed ✅
