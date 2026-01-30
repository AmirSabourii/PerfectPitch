# Credit System Implementation - Complete Changes

## 🎯 Summary

Successfully migrated from **plan-based** system to **credit-based** system. No more monthly limits or plan restrictions!

## 📝 Files Changed

### 1. `lib/limits.ts` - Complete Rewrite
**Before:** Plan-based with monthly limits
**After:** Credit-based with no limits

Key changes:
- Removed `PlanType` and `PLAN_LIMITS`
- Added `UserCredits` interface
- Replaced `getUserPlan()` with `getUserCredits()`
- Replaced `checkUsage()` with `checkCredits()`
- Replaced `incrementUsage()` with `deductCredits()`
- Added `addCredits()` for purchases/grants

### 2. `app/api/analyze-pitch/route.ts`
**Changes:**
```typescript
// Before
import { checkUsage, incrementUsage } from '@/lib/limits'
const limitCheck = await checkUsage(uid, 'analysis')
incrementUsage(uid, 'analysis')

// After
import { checkCredits, deductCredits } from '@/lib/limits'
const creditCheck = await checkCredits(uid, 'pitch_analysis')
deductCredits(uid, 'pitch_analysis', { pitchId, processingTime })
```

### 3. `app/api/realtime/sessions/route.ts`
**Changes:**
```typescript
// Before
import { checkUsage, incrementUsage, getUserPlan } from '@/lib/limits'
const userPlan = await getUserPlan(uid)
const limitCheck = await checkUsage(uid, 'roleplay')
incrementUsage(uid, 'roleplay')

// After
import { checkCredits, deductCredits, getUserCredits } from '@/lib/limits'
const creditCheck = await checkCredits(uid, 'realtime_session')
deductCredits(uid, 'realtime_session', { sessionId, role })
```

### 4. `contexts/AuthContext.tsx`
**Changes:**
- Fixed error handler to use credit structure instead of plan
- Removed plan-based default profile

### 5. `lib/creditSystem.ts` - Already Existed
No changes needed - already had the credit cost definitions

## 🆕 New Files Created

### 1. `FIREBASE_CREDIT_STRUCTURE.md`
Complete Firebase structure documentation including:
- User collection schema
- creditUsage collection
- creditPurchases collection
- Security rules
- Migration scripts
- Management commands

### 2. `scripts/migrate-to-credits.js`
Automated migration script that:
- Finds all users
- Adds credit structure
- Removes old plan/usage fields
- Grants bonus credits to Pro users
- Logs all operations

### 3. `scripts/manage-credits.js`
Admin tool for credit management:
- View user credits
- Add credits
- Remove credits
- List all users

### 4. `CREDIT_MIGRATION_GUIDE_FA.md`
Persian guide covering:
- Migration steps
- Testing procedures
- Troubleshooting
- Management commands

## 🔄 API Response Changes

### Error Responses

**Before:**
```json
{
  "error": "Monthly analysis limit reached for pro plan.",
  "code": "LIMIT_REACHED",
  "requiresUpgrade": true
}
```

**After:**
```json
{
  "error": "Insufficient credits. You need 1 credit(s) but have 0.",
  "code": "INSUFFICIENT_CREDITS",
  "required": 1,
  "available": 0
}
```

## 📊 Firebase Structure Changes

### Before:
```javascript
{
  "users": {
    "userId": {
      "plan": "pro",
      "usage": {
        "analysisCount": 5,
        "roleplayMinutes": 30
      }
    }
  }
}
```

### After:
```javascript
{
  "users": {
    "userId": {
      "credits": {
        "total": 10,
        "used": 3,
        "remaining": 7
      }
    }
  },
  "creditUsage": {
    "usageId": {
      "userId": "...",
      "action": "pitch_analysis",
      "credits": 1,
      "timestamp": "..."
    }
  },
  "creditPurchases": {
    "purchaseId": {
      "userId": "...",
      "credits": 10,
      "source": "purchase",
      "timestamp": "..."
    }
  }
}
```

## 💰 Credit Costs

| Action | Credits | Price |
|--------|---------|-------|
| pitch_analysis | 1 | $3 |
| deep_research | 2 | $6 |
| realtime_session | 1 | $3 |

## ✅ Benefits

1. **No Monthly Limits** - Users can use as much as they have credits for
2. **Simpler Logic** - No complex plan checking
3. **Better Tracking** - Separate collections for usage and purchases
4. **Flexible Pricing** - Easy to adjust credit costs
5. **Admin Control** - Easy to grant/remove credits
6. **Transparent** - Users see exactly what they have

## 🚀 Deployment Steps

1. **Backup Firestore**
   ```bash
   gcloud firestore export gs://your-bucket/backup
   ```

2. **Run Migration**
   ```bash
   node scripts/migrate-to-credits.js
   ```

3. **Update Firebase Rules**
   - Copy rules from FIREBASE_CREDIT_STRUCTURE.md
   - Deploy to Firebase Console

4. **Deploy Code**
   ```bash
   npm run build
   netlify deploy --prod
   ```

5. **Test**
   ```bash
   # Test with a user
   node scripts/manage-credits.js add test@example.com 5
   # Try analysis
   # Check credits deducted
   node scripts/manage-credits.js view test@example.com
   ```

## 🐛 Known Issues Fixed

- ❌ "Monthly analysis limit reached for pro plan" - FIXED
- ❌ Plan-based restrictions - REMOVED
- ❌ Complex usage tracking - SIMPLIFIED
- ✅ Now: Simple credit balance check

## 📞 Support Commands

```bash
# View user credits
node scripts/manage-credits.js view user@example.com

# Add credits
node scripts/manage-credits.js add user@example.com 10

# Remove credits
node scripts/manage-credits.js remove user@example.com 5

# List all users
node scripts/manage-credits.js list
```

## 🎉 Result

The system is now fully credit-based with no plan restrictions. Users can purchase credits and use them as needed without monthly limits!
