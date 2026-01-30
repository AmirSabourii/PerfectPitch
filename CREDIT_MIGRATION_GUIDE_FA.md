# راهنمای مهاجرت به سیستم Credit

## 🎯 خلاصه تغییرات

سیستم از **plan-based** (starter/pro) به **credit-based** تبدیل شد.

### قبل:
- کاربران plan داشتند (starter یا pro)
- محدودیت ماهانه وجود داشت
- ارور: "Monthly analysis limit reached for pro plan"

### بعد:
- کاربران credit دارند
- هیچ محدودیت ماهانه‌ای نیست
- فقط موجودی credit مهم است

## 📊 ساختار جدید Firebase

### Collection: users
```javascript
{
  "credits": {
    "total": 10,      // مجموع خریداری شده
    "used": 3,        // استفاده شده
    "remaining": 7    // باقیمانده
  },
  "email": "user@example.com",
  "createdAt": "...",
  "lastUpdated": "..."
}
```

**توجه:** فیلدهای `plan` و `usage` دیگر وجود ندارند!

## 💰 هزینه عملیات‌ها

| عملیات | Credit | قیمت |
|--------|--------|------|
| Pitch Analysis | 1 | $3 |
| Deep Research | 2 | $6 |
| Realtime Session | 1 | $3 |

## 🚀 مراحل مهاجرت

### 1. اجرای اسکریپت مهاجرت

```bash
# نصب Firebase Admin SDK (اگر نصب نیست)
npm install firebase-admin

# اجرای اسکریپت مهاجرت
node scripts/migrate-to-credits.js
```

این اسکریپت:
- تمام کاربران را پیدا می‌کند
- ساختار credit را اضافه می‌کند
- فیلدهای قدیمی (plan, usage) را حذف می‌کند
- به کاربران Pro یک هدیه 5 credit می‌دهد

### 2. آپدیت Firebase Rules

در Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // فقط از Admin SDK
    }
    
    match /creditUsage/{usageId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false;
    }
    
    match /creditPurchases/{purchaseId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

### 3. دیپلوی کد جدید

```bash
# بیلد پروژه
npm run build

# دیپلوی
npm run deploy
# یا
netlify deploy --prod
```

## 🛠️ مدیریت Credit ها

### مشاهده credit کاربر:
```bash
node scripts/manage-credits.js view user@example.com
```

### اضافه کردن credit:
```bash
node scripts/manage-credits.js add user@example.com 10
```

### کم کردن credit:
```bash
node scripts/manage-credits.js remove user@example.com 5
```

### لیست تمام کاربران:
```bash
node scripts/manage-credits.js list
```

## 🔍 تست سیستم جدید

### 1. تست با کاربر بدون credit:

```bash
# ایجاد کاربر جدید و لاگین
# سپس تست pitch analysis
# باید ارور "Insufficient credits" بگیرید
```

### 2. اضافه کردن credit و تست:

```bash
node scripts/manage-credits.js add test@example.com 5
# حالا pitch analysis باید کار کند
```

### 3. بررسی کسر credit:

```bash
# بعد از یک analysis
node scripts/manage-credits.js view test@example.com
# باید remaining کم شده باشد
```

## 📱 تغییرات در UI

کامپوننت `CreditIndicator` موجودی credit کاربر را نشان می‌دهد:

```typescript
// در هر صفحه
import { CreditIndicator } from '@/components/CreditIndicator'

<CreditIndicator />
```

## ⚠️ نکات مهم

1. **بکاپ بگیرید!** قبل از مهاجرت حتماً از Firestore بکاپ بگیرید
2. **تست کنید!** ابتدا روی یک کاربر تست کنید
3. **مانیتور کنید!** بعد از مهاجرت لاگ‌ها را چک کنید

## 🐛 عیب‌یابی

### ارور: "Firebase Admin not initialized"
```bash
# مطمئن شوید که GOOGLE_APPLICATION_CREDENTIALS تنظیم شده
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### ارور: "User not found"
```bash
# بررسی کنید که کاربر در Firebase Auth وجود دارد
firebase auth:export users.json
```

### credit کسر نمی‌شود
```bash
# چک کردن لاگ‌های سرور
# باید پیام "[Credits] Used X credit(s)" را ببینید
```

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ‌های سرور را چک کنید
2. Firebase Console را بررسی کنید
3. اسکریپت manage-credits را برای بررسی استفاده کنید

## ✅ چک‌لیست نهایی

- [ ] بکاپ از Firestore گرفته شد
- [ ] اسکریپت مهاجرت اجرا شد
- [ ] Firebase Rules آپدیت شد
- [ ] کد جدید دیپلوی شد
- [ ] تست با کاربر نمونه انجام شد
- [ ] لاگ‌ها بررسی شد
- [ ] همه چیز کار می‌کند! 🎉
