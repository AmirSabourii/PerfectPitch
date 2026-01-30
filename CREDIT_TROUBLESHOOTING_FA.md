# راهنمای عیب‌یابی سیستم کردیت

## مشکل: کردیت در Firebase هست ولی در سایت کار نمی‌کنه

### علت‌های احتمالی

1. **کردیت در collection اشتباه اضافه شده**
2. **ساختار داده اشتباه است**
3. **Firebase Admin درست initialize نشده**
4. **مشکل در authentication**

---

## راه‌حل گام به گام

### گام 1: بررسی ساختار Firebase

سیستم کردیت از این collections استفاده می‌کنه:

```
userCredits/
  {userId}/
    - userId: string
    - totalCredits: number
    - usedCredits: number
    - remainingCredits: number
    - purchaseHistory: array
    - usageHistory: array
    - createdAt: timestamp
    - lastUpdated: timestamp

creditPurchases/
  {purchaseId}/
    - userId: string
    - credits: number
    - source: string
    - metadata: object
    - timestamp: timestamp

creditUsage/
  {usageId}/
    - userId: string
    - action: string
    - credits: number
    - metadata: object
    - timestamp: timestamp
```

### گام 2: استفاده از اسکریپت تست

```bash
# نصب dependencies (اگر نصب نکردی)
npm install

# بررسی وضعیت کردیت کاربر
node scripts/test-credits.js YOUR_USER_ID check

# مشاهده موجودی
node scripts/test-credits.js YOUR_USER_ID view

# اضافه کردن 10 کردیت
node scripts/test-credits.js YOUR_USER_ID add 10
```

**نکته مهم:** قبل از اجرا باید متغیر محیطی `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` رو ست کنی:

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/serviceAccountKey.json
node scripts/test-credits.js YOUR_USER_ID check
```

### گام 3: بررسی Console Logs

وقتی از سایت استفاده می‌کنی، logs رو چک کن:

```bash
# اگر locally اجرا می‌کنی
npm run dev

# اگر روی Netlify هست
netlify dev
```

در console دنبال این پیام‌ها بگرد:

```
[Credits] User {uid} has X credits, needs Y for {action}
```

### گام 4: بررسی Firebase Console

1. برو به Firebase Console
2. Firestore Database رو باز کن
3. Collection `userCredits` رو پیدا کن
4. Document با ID کاربرت رو باز کن
5. مطمئن شو این فیلدها وجود دارن:
   - `totalCredits`
   - `usedCredits`
   - `remainingCredits`

### گام 5: اضافه کردن کردیت دستی در Firebase Console

اگر می‌خوای مستقیم از Firebase Console کردیت اضافه کنی:

1. برو به `userCredits` collection
2. اگر document کاربرت نیست، یکی بساز با ID کاربر
3. این فیلدها رو اضافه کن:

```json
{
  "userId": "YOUR_USER_ID",
  "totalCredits": 10,
  "usedCredits": 0,
  "remainingCredits": 10,
  "purchaseHistory": [],
  "usageHistory": [],
  "createdAt": "CURRENT_TIMESTAMP",
  "lastUpdated": "CURRENT_TIMESTAMP"
}
```

---

## مشکلات رایج و راه‌حل

### مشکل 1: "No credits available"

**علت:** Document کاربر در `userCredits` وجود نداره

**راه‌حل:**
```bash
node scripts/test-credits.js YOUR_USER_ID add 10
```

### مشکل 2: "Insufficient credits" با اینکه کردیت دارم

**علت:** کردیت در collection قدیمی (`users`) هست نه `userCredits`

**راه‌حل:**
1. کردیت رو از `users/{userId}/credits` کپی کن
2. با اسکریپت به `userCredits` اضافه کن:
```bash
node scripts/test-credits.js YOUR_USER_ID add AMOUNT
```

### مشکل 3: "Service temporarily unavailable"

**علت:** Firebase Admin initialize نشده

**راه‌حل:**
1. چک کن `.env.local` این متغیرها رو داره:
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/key.json
```

2. مطمئن شو service account key معتبره

### مشکل 4: کردیت کسر نمی‌شه بعد از استفاده

**علت:** خطا در `useCredits` function

**راه‌حل:**
1. Server logs رو چک کن
2. دنبال error messages بگرد
3. مطمئن شو Firestore rules اجازه write به server رو میده

---

## تست کامل سیستم

### تست 1: اضافه کردن کردیت

```bash
# اضافه کردن 5 کردیت
node scripts/test-credits.js YOUR_USER_ID add 5

# بررسی موجودی
node scripts/test-credits.js YOUR_USER_ID view
```

باید ببینی:
```
Total Credits: 5
Used Credits: 0
Remaining Credits: 5
```

### تست 2: استفاده از API

```bash
# از Postman یا curl استفاده کن
curl -X POST http://localhost:3000/api/credits/check \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID", "action": "pitch_analysis"}'
```

باید response موفق بگیری:
```json
{
  "hasEnoughCredits": true,
  "message": "موجودی کافی است"
}
```

### تست 3: تحلیل Pitch

1. لاگین کن به سایت
2. یک pitch ضبط کن یا آپلود کن
3. دکمه Analyze رو بزن
4. بعد از تحلیل، موجودی رو چک کن:

```bash
node scripts/test-credits.js YOUR_USER_ID view
```

باید ببینی:
```
Total Credits: 5
Used Credits: 1
Remaining Credits: 4
```

---

## هزینه هر عملیات

```javascript
pitch_analysis: 1 credit    // تحلیل pitch
deep_research: 2 credits    // تحقیق عمیق
realtime_session: 1 credit  // جلسه realtime
```

---

## Firestore Security Rules

مطمئن شو این rules رو در Firestore تنظیم کردی:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Credits Collection
    match /userCredits/{userId} {
      // فقط کاربر خودش می‌تواند credit خود را ببیند
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // فقط سرور می‌تواند credit را تغییر دهد
      allow write: if false;
    }
    
    // Credit Purchases Collection
    match /creditPurchases/{purchaseId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow write: if false;
    }
    
    // Credit Usage Collection
    match /creditUsage/{usageId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow write: if false;
    }
  }
}
```

---

## دریافت User ID

برای پیدا کردن User ID خودت:

### روش 1: از Firebase Console
1. برو به Authentication
2. پیدا کن کاربرت رو
3. User UID رو کپی کن

### روش 2: از Browser Console
1. لاگین کن به سایت
2. Browser Console رو باز کن (F12)
3. این کد رو اجرا کن:
```javascript
firebase.auth().currentUser.uid
```

### روش 3: از Network Tab
1. لاگین کن
2. Network tab رو باز کن
3. یک API call بزن
4. در Authorization header دنبال Bearer token بگرد
5. Token رو decode کن در jwt.io
6. فیلد `uid` رو پیدا کن

---

## پشتیبانی

اگر هنوز مشکل داری:

1. Output کامل `check` command رو بگیر:
```bash
node scripts/test-credits.js YOUR_USER_ID check > debug.txt
```

2. Server logs رو بگیر

3. Screenshot از Firebase Console بگیر

4. این اطلاعات رو برای debug بفرست
