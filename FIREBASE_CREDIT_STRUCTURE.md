# Firebase Credit System Structure

## ساختار دیتابیس کاربران (Users Collection)

هر کاربر در Firebase باید این ساختار را داشته باشد:

```javascript
{
  "users": {
    "[userId]": {
      "credits": {
        "total": 0,        // مجموع کل credit های خریداری شده
        "used": 0,         // تعداد credit های استفاده شده
        "remaining": 0     // credit های باقیمانده (total - used)
      },
      "email": "user@example.com",
      "displayName": "User Name",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Collections جدید برای Tracking

### 1. creditUsage Collection
برای ثبت استفاده از credit ها:

```javascript
{
  "creditUsage": {
    "[usageId]": {
      "userId": "user123",
      "action": "pitch_analysis",  // یا "deep_research" یا "realtime_session"
      "credits": 1,
      "metadata": {
        "pitchId": "pitch123",
        "processingTime": 5000
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. creditPurchases Collection
برای ثبت خریدهای credit:

```javascript
{
  "creditPurchases": {
    "[purchaseId]": {
      "userId": "user123",
      "credits": 10,
      "source": "purchase",  // یا "admin_grant" یا "promotion"
      "metadata": {
        "amount": 30,
        "paymentMethod": "stripe",
        "transactionId": "txn_123"
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## هزینه هر عملیات (Credit Costs)

```javascript
{
  "pitch_analysis": 1,      // 1 credit = $3
  "deep_research": 2,       // 2 credits = $6
  "realtime_session": 1     // 1 credit = $3
}
```

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - فقط خود کاربر می‌تواند بخواند
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // فقط از طریق Admin SDK
    }
    
    // Credit usage - فقط خواندن برای خود کاربر
    match /creditUsage/{usageId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // فقط از طریق Admin SDK
    }
    
    // Credit purchases - فقط خواندن برای خود کاربر
    match /creditPurchases/{purchaseId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // فقط از طریق Admin SDK
    }
  }
}
```

## مهاجرت از سیستم قدیمی (Plan-based) به Credit-based

### اسکریپت مهاجرت:

```javascript
// این اسکریپت را در Firebase Console > Firestore > Run Query اجرا کنید

const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateToCredits() {
  const usersSnapshot = await db.collection('users').get();
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // حذف فیلدهای قدیمی plan و usage
    const updates = {
      credits: {
        total: 0,
        used: 0,
        remaining: 0
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // حذف فیلدهای قدیمی
    batch.update(doc.ref, updates);
    batch.update(doc.ref, {
      plan: admin.firestore.FieldValue.delete(),
      usage: admin.firestore.FieldValue.delete()
    });
    
    count++;
    
    // Commit هر 500 تا
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} users...`);
    }
  }
  
  // Commit باقیمانده
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Migration complete! Total users: ${count}`);
}

migrateToCredits();
```

## دستورات مدیریت Credit از Firebase Console

### اضافه کردن Credit به کاربر:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function addCreditsToUser(userId, amount) {
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const currentCredits = userDoc.data().credits || { total: 0, used: 0, remaining: 0 };
    
    transaction.update(userRef, {
      'credits.total': admin.firestore.FieldValue.increment(amount),
      'credits.remaining': admin.firestore.FieldValue.increment(amount),
      'lastUpdated': admin.firestore.FieldValue.serverTimestamp()
    });
    
    // ثبت در creditPurchases
    transaction.set(db.collection('creditPurchases').doc(), {
      userId,
      credits: amount,
      source: 'admin_grant',
      metadata: {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  console.log(`Added ${amount} credits to user ${userId}`);
}

// مثال: اضافه کردن 10 credit به کاربر
addCreditsToUser('USER_ID_HERE', 10);
```

### کم کردن Credit از کاربر:

```javascript
async function removeCreditsFromUser(userId, amount) {
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const currentCredits = userDoc.data().credits || { total: 0, used: 0, remaining: 0 };
    
    if (currentCredits.remaining < amount) {
      throw new Error('Insufficient credits');
    }
    
    transaction.update(userRef, {
      'credits.remaining': admin.firestore.FieldValue.increment(-amount),
      'lastUpdated': admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  console.log(`Removed ${amount} credits from user ${userId}`);
}
```

### مشاهده Credit های کاربر:

```javascript
async function getUserCredits(userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    console.log('User not found');
    return;
  }
  
  const credits = userDoc.data().credits;
  console.log('User Credits:', credits);
  return credits;
}
```

## تغییرات در کد

### قبل (Plan-based):
```typescript
const limitCheck = await checkUsage(uid, 'analysis')
if (!limitCheck.allowed) {
  return { error: 'Monthly analysis limit reached for pro plan.' }
}
```

### بعد (Credit-based):
```typescript
const creditCheck = await checkCredits(uid, 'pitch_analysis')
if (!creditCheck.allowed) {
  return { 
    error: 'Insufficient credits',
    required: creditCheck.required,
    available: creditCheck.credits?.remaining || 0
  }
}
```

## نکات مهم

1. **دیگر نیازی به plan نیست** - همه چیز بر اساس credit است
2. **محدودیت ماهانه وجود ندارد** - فقط موجودی credit مهم است
3. **کاربران می‌توانند هر زمان credit بخرند** - بین 5 تا 50 credit
4. **هر credit = $3** - قیمت ثابت بدون تخفیف
5. **تمام عملیات از Admin SDK انجام می‌شود** - امنیت بالا
