# حل مشکل Firebase Connection

## مشکلات شناسایی شده

### 1. Firebase Offline Error
```
Could not reach Cloud Firestore backend. Backend didn't respond within 10 seconds.
The client will operate in offline mode.
```

### 2. Undefined Values Error (حل شد ✅)
```
Cannot use "undefined" as a Firestore value (found in field "metadata.organizationId")
```

## راه‌حل‌ها

### ✅ مشکل 1: Undefined Values - حل شد

**تغییرات در `app/api/analyze-pitch/route.ts`:**

```typescript
// قبل (اشتباه):
metadata: {
  userId: uid,
  organizationId: organizationId || undefined,  // ❌ undefined نباید باشد
  programId: programId || undefined,            // ❌ undefined نباید باشد
}

// بعد (درست):
const metadata: any = {
  userId: uid,
}
// فقط اگر مقدار داشت اضافه کن
if (organizationId) metadata.organizationId = organizationId
if (programId) metadata.programId = programId
```

### ⏳ مشکل 2: Firebase Connection - نیاز به بررسی

**علل احتمالی:**

1. **Dev Server نیاز به Restart دارد**
   ```bash
   # توقف server
   Ctrl+C
   
   # شروع مجدد
   npm run dev
   ```

2. **مشکل Network/Internet**
   - اتصال اینترنت را بررسی کنید
   - VPN را خاموش/روشن کنید
   - Firewall را بررسی کنید

3. **Firebase Credentials اشتباه است**
   - فایل `.env.local` را بررسی کنید
   - مطمئن شوید تمام متغیرها مقدار دارند:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     ```

4. **Firebase Project مشکل دارد**
   - به Firebase Console بروید
   - مطمئن شوید project فعال است
   - Firestore Database را بررسی کنید

## چک‌لیست عیب‌یابی

### مرحله 1: بررسی Environment Variables
```bash
# در terminal بزنید:
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

اگر خالی بود:
- فایل `.env.local` را باز کنید
- مطمئن شوید متغیرها درست هستند
- Dev server را restart کنید

### مرحله 2: Restart Dev Server
```bash
# توقف
Ctrl+C

# پاک کردن cache
rm -rf .next

# شروع مجدد
npm run dev
```

### مرحله 3: بررسی Firebase Console
1. به https://console.firebase.google.com بروید
2. project خود را باز کنید
3. به Firestore Database بروید
4. مطمئن شوید database ساخته شده است

### مرحله 4: بررسی Network
```bash
# تست connection به Google
ping google.com

# تست connection به Firebase
ping firestore.googleapis.com
```

### مرحله 5: بررسی Browser Console
1. F12 را بزنید
2. به Console tab بروید
3. خطاهای Firebase را ببینید
4. به Network tab بروید
5. ببینید آیا request به Firebase می‌رود

## مشکل History (تاریخچه)

### علت:
اگر Firebase offline است، تاریخچه ذخیره نمی‌شود.

### بررسی:
1. آیا analysis موفق است؟ ✅ (بله، 101 ثانیه طول کشید)
2. آیا به Firebase می‌رود? ❌ (خیر، offline است)

### راه‌حل:
1. مشکل Firebase connection را حل کنید (بالا)
2. بعد از حل مشکل، تاریخچه باید کار کند

## تست کردن

### تست 1: بررسی Firebase Connection
```typescript
// در browser console بزنید:
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

getDocs(collection(db, 'users')).then(snap => {
  console.log('Connected! Documents:', snap.size)
}).catch(err => {
  console.error('Connection failed:', err)
})
```

### تست 2: بررسی API
```bash
# تست credit balance
curl http://localhost:3000/api/credits/balance?userId=YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تست 3: بررسی History
1. یک pitch تحلیل کنید
2. به Firebase Console بروید
3. به collection `pitchAnalyses` بروید
4. ببینید آیا document جدید اضافه شده

## راه‌حل سریع (Quick Fix)

```bash
# 1. توقف server
Ctrl+C

# 2. پاک کردن cache و node_modules
rm -rf .next
rm -rf node_modules

# 3. نصب مجدد
npm install

# 4. شروع مجدد
npm run dev
```

## اگر هنوز کار نکرد

### گزینه 1: بررسی Firestore Rules
```javascript
// در Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### گزینه 2: استفاده از Emulator (برای تست)
```bash
# نصب Firebase CLI
npm install -g firebase-tools

# شروع emulator
firebase emulators:start
```

### گزینه 3: بررسی Logs
```bash
# در terminal که dev server دارد اجرا می‌شود
# خطاهای Firebase را ببینید
```

## وضعیت فعلی

- ✅ مشکل undefined values حل شد
- ⏳ مشکل Firebase connection نیاز به restart دارد
- ⏳ History بعد از حل connection کار می‌کند

## مرحله بعدی

1. **Dev server را restart کنید**
2. **دوباره تست کنید**
3. **اگر هنوز مشکل دارد، environment variables را بررسی کنید**

---

**تاریخ**: 2026-01-30  
**وضعیت**: Undefined values حل شد ✅ | Connection نیاز به restart ⏳
