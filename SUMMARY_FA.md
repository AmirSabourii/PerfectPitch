# خلاصه تغییرات: حذف کامل سیستم Plan و جایگزینی با Credit

## ✅ مشکل حل شد!

**مشکل قبلی:**
```
"Monthly analysis limit reached for pro plan."
```

**حل:**
- سیستم plan کاملاً حذف شد
- همه چیز حالا بر اساس credit است
- دیگر محدودیت ماهانه وجود ندارد

## 🔄 تغییرات اصلی

### 1. ساختار Firebase

#### قبل ❌:
```javascript
{
  "plan": "pro",
  "usage": {
    "analysisCount": 5,
    "roleplayMinutes": 30
  }
}
```

#### بعد ✅:
```javascript
{
  "credits": {
    "total": 10,
    "used": 3,
    "remaining": 7
  }
}
```

### 2. کد Backend

#### قبل ❌:
```typescript
const limitCheck = await checkUsage(uid, 'analysis')
if (!limitCheck.allowed) {
  return { error: 'Monthly analysis limit reached for pro plan.' }
}
incrementUsage(uid, 'analysis')
```

#### بعد ✅:
```typescript
const creditCheck = await checkCredits(uid, 'pitch_analysis')
if (!creditCheck.allowed) {
  return { 
    error: 'Insufficient credits',
    required: 1,
    available: 0
  }
}
deductCredits(uid, 'pitch_analysis')
```

## 📁 فایل‌های تغییر یافته

1. ✅ `lib/limits.ts` - بازنویسی کامل
2. ✅ `app/api/analyze-pitch/route.ts` - استفاده از credit
3. ✅ `app/api/realtime/sessions/route.ts` - استفاده از credit
4. ✅ `contexts/AuthContext.tsx` - حذف plan

## 📁 فایل‌های جدید

1. ✅ `FIREBASE_CREDIT_STRUCTURE.md` - مستندات کامل Firebase
2. ✅ `scripts/migrate-to-credits.js` - اسکریپت مهاجرت
3. ✅ `scripts/manage-credits.js` - مدیریت credit ها
4. ✅ `CREDIT_MIGRATION_GUIDE_FA.md` - راهنمای فارسی
5. ✅ `scripts/README.md` - راهنمای اسکریپت‌ها

## 🚀 مراحل اجرا

### مرحله 1: بکاپ
```bash
# بکاپ از Firestore
gcloud firestore export gs://your-bucket/backup
```

### مرحله 2: مهاجرت
```bash
# اجرای اسکریپت مهاجرت
node scripts/migrate-to-credits.js
```

### مرحله 3: آپدیت Rules
در Firebase Console > Firestore > Rules، rules جدید را از `FIREBASE_CREDIT_STRUCTURE.md` کپی کنید.

### مرحله 4: دیپلوی
```bash
npm run build
netlify deploy --prod
```

### مرحله 5: تست
```bash
# اضافه کردن credit به یک کاربر تست
node scripts/manage-credits.js add test@example.com 5

# تست pitch analysis
# بررسی کسر credit
node scripts/manage-credits.js view test@example.com
```

## 💰 هزینه عملیات‌ها

| عملیات | Credit | قیمت |
|--------|--------|------|
| Pitch Analysis | 1 | $3 |
| Deep Research | 2 | $6 |
| Realtime Session | 1 | $3 |

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

### لیست همه کاربران:
```bash
node scripts/manage-credits.js list
```

## 🎯 مزایا

1. ✅ **بدون محدودیت ماهانه** - فقط موجودی credit مهم است
2. ✅ **ساده‌تر** - نیازی به چک کردن plan نیست
3. ✅ **شفاف‌تر** - کاربر دقیقاً می‌داند چقدر credit دارد
4. ✅ **انعطاف‌پذیرتر** - می‌توان هر زمان credit خرید
5. ✅ **قابل مدیریت** - اسکریپت‌های آماده برای مدیریت

## 🔍 تست

### تست 1: کاربر بدون credit
```bash
# لاگین کنید
# سعی کنید pitch analysis انجام دهید
# باید ارور "Insufficient credits" بگیرید
```

### تست 2: اضافه کردن credit
```bash
node scripts/manage-credits.js add your@email.com 5
# حالا pitch analysis باید کار کند
```

### تست 3: بررسی کسر credit
```bash
# بعد از یک analysis
node scripts/manage-credits.js view your@email.com
# remaining باید 1 واحد کم شده باشد
```

## ⚠️ نکات مهم

1. **حتماً بکاپ بگیرید** قبل از مهاجرت
2. **ابتدا تست کنید** روی یک کاربر
3. **لاگ‌ها را چک کنید** بعد از دیپلوی
4. **Firebase Rules را آپدیت کنید** برای امنیت

## 🐛 عیب‌یابی

### اگر هنوز ارور plan می‌گیرید:
1. مطمئن شوید کد جدید دیپلوی شده
2. Cache مرورگر را پاک کنید
3. لاگ‌های سرور را چک کنید

### اگر credit کسر نمی‌شود:
1. لاگ‌های سرور را ببینید
2. بررسی کنید که `deductCredits` فراخوانی می‌شود
3. Firebase Console را چک کنید

### اگر کاربر credit ندارد:
```bash
node scripts/manage-credits.js add user@example.com 10
```

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. `FIREBASE_CREDIT_STRUCTURE.md` را بخوانید
2. `CREDIT_MIGRATION_GUIDE_FA.md` را چک کنید
3. لاگ‌های سرور را بررسی کنید
4. Firebase Console را نگاه کنید

## ✅ چک‌لیست

- [ ] بکاپ گرفته شد
- [ ] اسکریپت مهاجرت اجرا شد
- [ ] Firebase Rules آپدیت شد
- [ ] کد دیپلوی شد
- [ ] تست انجام شد
- [ ] لاگ‌ها بررسی شد
- [ ] همه چیز کار می‌کند! 🎉

## 🎉 نتیجه

سیستم حالا کاملاً credit-based است و دیگر هیچ محدودیت plan یا ماهانه‌ای وجود ندارد!

کاربران می‌توانند:
- هر زمان credit بخرند (5 تا 50 credit)
- بدون محدودیت استفاده کنند
- موجودی خود را ببینند
- شفاف بدانند چقدر هزینه دارند

شما می‌توانید:
- به راحتی credit اضافه/کم کنید
- تمام استفاده‌ها را ببینید
- تمام خریدها را track کنید
- سیستم را مدیریت کنید
