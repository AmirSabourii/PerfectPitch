# سیستم کردیت - رفع مشکلات و یکپارچه‌سازی

## مشکلاتی که رفع شد

### 1. دو سیستم موازی و متناقض ❌ → ✅
**قبل:**
- `lib/limits.ts` با collection `users` کار می‌کرد
- `lib/services/creditService.ts` با collection `userCredits` کار می‌کرد
- API routes از سیستم اشتباه استفاده می‌کردن

**بعد:**
- همه چیز یکپارچه شد
- فقط از collection `userCredits` استفاده می‌شه
- ساختار واحد در همه جا

### 2. ساختار داده نامتناسب ❌ → ✅
**قبل:**
```javascript
// در users collection
{
  credits: {
    total: 10,
    used: 2,
    remaining: 8
  }
}
```

**بعد:**
```javascript
// در userCredits collection
{
  userId: "abc123",
  totalCredits: 10,
  usedCredits: 2,
  remainingCredits: 8,
  purchaseHistory: [],
  usageHistory: [],
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

### 3. فایل‌های قدیمی Plan ❌ → ✅
**قبل:**
- `lib/planLimits.ts` و `lib/planLimits_simple.ts` وجود داشتن
- احتمال استفاده اشتباهی از plan system

**بعد:**
- فایل‌ها rename شدن به `.deprecated`
- سیستم فقط با credit کار می‌کنه

---

## تغییرات اعمال شده

### 1. `lib/limits.ts` - یکپارچه‌سازی کامل

#### تغییر در `getUserCredits()`
```typescript
// قبل: از users collection
adminDb.collection('users').doc(uid).get()

// بعد: از userCredits collection
adminDb.collection('userCredits').doc(uid).get()
```

#### تغییر در `checkCredits()`
```typescript
// اضافه شد: logging برای debug
console.log(`[Credits] User ${uid} has ${credits.remaining} credits, needs ${requiredCredits} for ${action}`)

// تغییر: از userCredits collection استفاده می‌کنه
// تغییر: ساختار داده جدید (totalCredits, usedCredits, remainingCredits)
```

#### تغییر در `useCredits()`
```typescript
// قبل: 
userRef.update({
  'credits.used': FieldValue.increment(creditsToUse),
  'credits.remaining': FieldValue.increment(-creditsToUse)
})

// بعد:
userRef.update({
  usedCredits: FieldValue.increment(creditsToUse),
  remainingCredits: FieldValue.increment(-creditsToUse)
})
```

#### تغییر در `addCredits()`
```typescript
// اضافه شد: ایجاد خودکار user اگر وجود نداشته باشه
if (!userDoc.exists) {
  await userRef.set({
    userId: uid,
    totalCredits: amount,
    usedCredits: 0,
    remainingCredits: amount,
    // ...
  })
}
```

### 2. اسکریپت تست جدید

فایل: `scripts/test-credits.js`

قابلیت‌ها:
- ✅ مشاهده موجودی کردیت
- ✅ اضافه کردن کردیت
- ✅ بررسی کامل سیستم (check)
- ✅ نمایش تاریخچه خرید و استفاده
- ✅ مقایسه با سیستم قدیمی

### 3. مستندات فارسی

فایل: `CREDIT_TROUBLESHOOTING_FA.md`

شامل:
- ✅ راهنمای گام به گام عیب‌یابی
- ✅ مشکلات رایج و راه‌حل
- ✅ دستورات تست
- ✅ ساختار Firebase
- ✅ Security Rules

---

## Checklist تست

### تست 1: بررسی ساختار Firebase ✓

```bash
node scripts/test-credits.js YOUR_USER_ID check
```

باید ببینی:
- ✅ وضعیت `userCredits` collection
- ✅ وضعیت `users` collection (قدیمی)
- ✅ تاریخچه استفاده
- ✅ تاریخچه خرید

### تست 2: اضافه کردن کردیت ✓

```bash
# اضافه کردن 10 کردیت
node scripts/test-credits.js YOUR_USER_ID add 10

# بررسی موجودی
node scripts/test-credits.js YOUR_USER_ID view
```

باید ببینی:
```
✅ Successfully added 10 credits

Current balance:
✅ User found
Total Credits: 10
Used Credits: 0
Remaining Credits: 10
```

### تست 3: API Endpoint ✓

```bash
# تست check endpoint
curl -X POST http://localhost:3000/api/credits/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": "YOUR_USER_ID", "action": "pitch_analysis"}'
```

Response موفق:
```json
{
  "hasEnoughCredits": true,
  "message": "موجودی کافی است"
}
```

### تست 4: تحلیل Pitch واقعی ✓

1. لاگین کن به سایت
2. یک pitch آپلود کن
3. Analyze رو بزن
4. چک کن که کردیت کسر شده:

```bash
node scripts/test-credits.js YOUR_USER_ID view
```

باید ببینی:
```
Total Credits: 10
Used Credits: 1      ← کسر شده
Remaining Credits: 9  ← کاهش یافته
```

### تست 5: بررسی Logs ✓

در server logs باید ببینی:
```
[Credits] User abc123 has 9 credits, needs 1 for pitch_analysis
[Credits] Used 1 credit(s) for pitch_analysis by user abc123
```

---

## Firebase Collections Structure

### Collection: `userCredits`
```
userCredits/
  {userId}/
    userId: string
    totalCredits: number        ← مجموع کل خریداری شده
    usedCredits: number         ← مجموع استفاده شده
    remainingCredits: number    ← باقیمانده (total - used)
    purchaseHistory: array      ← تاریخچه خرید (deprecated - از collection جدا استفاده کن)
    usageHistory: array         ← تاریخچه استفاده (deprecated - از collection جدا استفاده کن)
    createdAt: timestamp
    lastUpdated: timestamp
```

### Collection: `creditPurchases`
```
creditPurchases/
  {purchaseId}/
    userId: string
    credits: number
    source: string              ← 'purchase', 'admin_grant', 'admin_script', etc.
    metadata: object
    timestamp: timestamp
```

### Collection: `creditUsage`
```
creditUsage/
  {usageId}/
    userId: string
    action: string              ← 'pitch_analysis', 'deep_research', 'realtime_session'
    credits: number
    metadata: object
    timestamp: timestamp
```

---

## هزینه عملیات‌ها

از `lib/creditSystem.ts`:

```typescript
export const CREDIT_COSTS = {
  pitch_analysis: 1,    // 1 credit = $3
  deep_research: 2,     // 2 credits = $6
  realtime_session: 1,  // 1 credit = $3
}
```

---

## نکات مهم

### 1. Collection درست رو استفاده کن
- ✅ استفاده کن: `userCredits`
- ❌ استفاده نکن: `users` (قدیمی)

### 2. ساختار فیلد درست
- ✅ استفاده کن: `totalCredits`, `usedCredits`, `remainingCredits`
- ❌ استفاده نکن: `credits.total`, `credits.used`, `credits.remaining`

### 3. همیشه از Admin SDK استفاده کن
- Client-side نمی‌تونه مستقیم credit رو تغییر بده
- همه تغییرات باید از API endpoints باشه

### 4. Atomic Operations
- همیشه از `FieldValue.increment()` استفاده کن
- از transaction استفاده کن برای consistency

---

## مهاجرت از سیستم قدیمی

اگر کاربرانی دارن که کردیت در `users` collection دارن:

### اسکریپت مهاجرت (اختیاری)

```javascript
// scripts/migrate-old-credits.js
const admin = require('firebase-admin');

async function migrateUser(userId) {
  const oldRef = admin.firestore().collection('users').doc(userId);
  const newRef = admin.firestore().collection('userCredits').doc(userId);
  
  const oldDoc = await oldRef.get();
  if (!oldDoc.exists || !oldDoc.data().credits) {
    console.log(`No credits found for ${userId}`);
    return;
  }
  
  const oldCredits = oldDoc.data().credits;
  
  await newRef.set({
    userId: userId,
    totalCredits: oldCredits.total || 0,
    usedCredits: oldCredits.used || 0,
    remainingCredits: oldCredits.remaining || 0,
    purchaseHistory: [],
    usageHistory: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`✅ Migrated ${userId}: ${oldCredits.remaining} credits`);
}
```

---

## دستورات مفید

```bash
# نصب dependencies
npm install

# تست سیستم کردیت
node scripts/test-credits.js USER_ID check

# اضافه کردن کردیت
node scripts/test-credits.js USER_ID add 10

# مشاهده موجودی
node scripts/test-credits.js USER_ID view

# اجرای سرور local
npm run dev

# اجرای سرور Netlify
netlify dev

# بررسی logs
# در terminal که npm run dev اجرا شده
```

---

## مشکلات احتمالی و راه‌حل

### "Service temporarily unavailable"
- چک کن: Firebase Admin initialize شده؟
- چک کن: `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` ست شده؟

### "No credits available"
- چک کن: Document در `userCredits` وجود داره؟
- اضافه کن: `node scripts/test-credits.js USER_ID add 10`

### "Insufficient credits" با اینکه کردیت دارم
- چک کن: کردیت در `userCredits` هست یا `users`?
- مهاجرت کن: از `users` به `userCredits`

### کردیت کسر نمی‌شه
- چک کن: Server logs
- چک کن: Firestore rules
- چک کن: `useCredits()` بدون error اجرا میشه؟

---

## پشتیبانی

برای debug کامل:

```bash
# 1. بررسی کامل سیستم
node scripts/test-credits.js YOUR_USER_ID check > debug-output.txt

# 2. تست اضافه کردن کردیت
node scripts/test-credits.js YOUR_USER_ID add 5

# 3. تست API
# در یک terminal:
npm run dev

# در terminal دیگه:
curl -X POST http://localhost:3000/api/credits/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": "YOUR_USER_ID", "action": "pitch_analysis"}'

# 4. بررسی Firebase Console
# برو به: https://console.firebase.google.com
# Firestore Database > userCredits > YOUR_USER_ID
```

---

## خلاصه تغییرات

✅ سیستم کردیت یکپارچه شد  
✅ همه از `userCredits` collection استفاده می‌کنن  
✅ ساختار داده استاندارد شد  
✅ فایل‌های قدیمی plan غیرفعال شدن  
✅ اسکریپت تست اضافه شد  
✅ مستندات فارسی کامل  
✅ Logging برای debug  
✅ Error handling بهتر  

**سیستم الان آماده استفاده است! 🚀**
