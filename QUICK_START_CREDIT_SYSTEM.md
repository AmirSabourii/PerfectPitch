# Quick Start: Credit System

## 🚀 5-Minute Setup

### Step 1: Backup (30 seconds)
```bash
# Backup your Firestore
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

### Step 2: Migrate (2 minutes)
```bash
# Run migration script
node scripts/migrate-to-credits.js
```

### Step 3: Update Firebase Rules (1 minute)
Copy rules from `FIREBASE_CREDIT_STRUCTURE.md` to Firebase Console > Firestore > Rules

### Step 4: Deploy (1 minute)
```bash
npm run build
netlify deploy --prod
```

### Step 5: Test (30 seconds)
```bash
# Add credits to test user
node scripts/manage-credits.js add test@example.com 5

# Try analysis in app
# Check credits deducted
node scripts/manage-credits.js view test@example.com
```

## ✅ Done!

Your system is now credit-based. No more plan limits!

## 📚 Need More Info?

- **Full Guide:** `CREDIT_MIGRATION_GUIDE_FA.md`
- **Firebase Structure:** `FIREBASE_CREDIT_STRUCTURE.md`
- **Testing:** `TEST_CREDIT_SYSTEM.md`
- **Changes:** `CREDIT_SYSTEM_CHANGES.md`
- **Summary (Persian):** `SUMMARY_FA.md`

## 🛠️ Daily Commands

```bash
# View user credits
node scripts/manage-credits.js view user@example.com

# Add credits
node scripts/manage-credits.js add user@example.com 10

# List all users
node scripts/manage-credits.js list
```

## 💰 Credit Costs

- Pitch Analysis: 1 credit ($3)
- Deep Research: 2 credits ($6)
- Realtime Session: 1 credit ($3)

## 🎉 That's it!
