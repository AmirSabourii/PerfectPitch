# Scripts Directory

## Credit Management Scripts

### Prerequisites

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Set up Firebase credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

## Available Scripts

### 1. migrate-to-credits.js

Migrates all users from plan-based to credit-based system.

**Usage:**
```bash
node scripts/migrate-to-credits.js
```

**What it does:**
- Finds all users in Firestore
- Adds credit structure to each user
- Removes old plan and usage fields
- Grants bonus credits to Pro users (5 credits)
- Logs all operations and errors

**Output:**
```
🚀 Starting migration from plan-based to credit-based system...

📊 Found 10 users to migrate

Processing user: abc123
  Old data: { plan: 'pro', usage: { analysisCount: 5 } }
  ✅ Migrated successfully (5 credits granted)

...

📈 Migration Summary:
✅ Successfully migrated: 10 users
❌ Failed: 0 users
📊 Total: 10 users

✨ Migration complete!
```

### 2. manage-credits.js

Admin tool for managing user credits.

**Commands:**

#### View user credits
```bash
node scripts/manage-credits.js view user@example.com
```

Output:
```
============================================================
👤 User: user@example.com
🆔 ID: abc123
============================================================
💰 Total Credits: 10
✅ Used Credits: 3
🎯 Remaining Credits: 7
============================================================
```

#### Add credits
```bash
node scripts/manage-credits.js add user@example.com 10
```

Output:
```
✅ Added 10 credits to user@example.com

[Shows updated credit balance]
```

#### Remove credits
```bash
node scripts/manage-credits.js remove user@example.com 5
```

Output:
```
✅ Removed 5 credits from user@example.com

[Shows updated credit balance]
```

#### List all users
```bash
node scripts/manage-credits.js list
```

Output:
```
================================================================================
📊 All Users Credits
================================================================================

1. user1@example.com
   ID: abc123
   Total: 20 | Used: 5 | Remaining: 15

2. user2@example.com
   ID: def456
   Total: 10 | Used: 10 | Remaining: 0

...

================================================================================
Total Users: 10
================================================================================
```

## Common Use Cases

### Give free credits to a user
```bash
node scripts/manage-credits.js add user@example.com 5
```

### Check if user has credits
```bash
node scripts/manage-credits.js view user@example.com
```

### Refund credits
```bash
node scripts/manage-credits.js add user@example.com 1
```

### Remove test credits
```bash
node scripts/manage-credits.js remove test@example.com 100
```

### See who has the most credits
```bash
node scripts/manage-credits.js list
# Users are sorted by remaining credits (highest first)
```

## Error Handling

### "User not found with email"
- Check that the email is correct
- Verify user exists in Firebase Auth

### "Insufficient credits"
- User doesn't have enough credits to remove
- Check current balance first with `view` command

### "Firebase Admin not initialized"
- Set GOOGLE_APPLICATION_CREDENTIALS environment variable
- Make sure service account key file exists

## Security Notes

⚠️ **Important:**
- These scripts have full admin access
- Only run on trusted machines
- Keep service account key secure
- Don't commit credentials to git

## Logging

All credit operations are logged to Firestore:

- **creditPurchases** collection: Records all credit additions
- **creditUsage** collection: Records all credit deductions

You can query these collections to audit credit operations.

## Testing

Before running on production:

1. Test on a single user first
2. Verify the changes in Firebase Console
3. Check that the user can still login and use the app
4. Monitor logs for any errors

## Rollback

If something goes wrong:

1. Restore from Firestore backup
2. Or manually fix affected users:
   ```bash
   node scripts/manage-credits.js add user@example.com 10
   ```

## Support

For issues or questions, check:
- FIREBASE_CREDIT_STRUCTURE.md - Complete Firebase structure
- CREDIT_MIGRATION_GUIDE_FA.md - Persian migration guide
- CREDIT_SYSTEM_CHANGES.md - All changes made
