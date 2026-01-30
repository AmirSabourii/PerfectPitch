# خلاصه پیاده‌سازی سیستم Credit

## ✅ کارهای انجام شده

### 1. ساختار پایه (Core System)

#### `lib/creditSystem.ts`
- تعریف ثابت‌ها: `CREDIT_PRICE = $3`, `MIN_CREDITS = 5`, `MAX_CREDITS = 50`
- تایپ‌های TypeScript: `UserCredits`, `CreditPurchase`, `CreditUsage`
- توابع محاسباتی: `calculateCreditPackage`, `hasEnoughCredits`, `canPerformAction`
- توابع کمکی: `formatPrice`, `formatCredits`, `suggestCreditAmount`

#### `lib/services/creditService.ts`
- کلاس `CreditService` برای مدیریت Firebase
- متدها:
  - `getUserCredits()` - دریافت موجودی
  - `purchaseCredits()` - خرید credit جدید
  - `useCredits()` - استفاده از credit
  - `hasEnoughCredits()` - بررسی موجودی
  - `refundCredits()` - بازگشت credit
- استفاده از Firestore Transactions برای امنیت

### 2. API Endpoints

#### `app/api/credits/check/route.ts`
- بررسی موجودی کافی قبل از عملیات
- Response: `{ hasEnoughCredits, remainingCredits, requiredCredits }`

#### `app/api/credits/use/route.ts`
- کسر credit بعد از عملیات موفق
- Response: `{ success, usage, remainingCredits }`

#### `app/api/credits/balance/route.ts`
- دریافت موجودی فعلی کاربر
- Response: `{ success, credits }`

### 3. React Components

#### `components/CreditBalance.tsx`
- نمایش موجودی فعلی با نمودار
- آمار خریداری شده و استفاده شده
- هشدار موجودی کم
- دکمه خرید سریع

#### `components/CreditPurchase.tsx`
- اسلایدر انتخاب تعداد (5-50)
- دکمه‌های انتخاب سریع (5, 10, 25, 50)
- نمایش قیمت real-time
- خلاصه قیمت و ویژگی‌ها
- دکمه خرید با loading state

#### `components/CreditManagement.tsx`
- صفحه کامل مدیریت با 3 تب:
  - **نمای کلی**: موجودی + استفاده‌های اخیر
  - **خرید Credit**: فرم خرید کامل
  - **تاریخچه**: تاریخچه خرید و استفاده
- یکپارچگی کامل با Firebase

#### `components/CreditIndicator.tsx`
- نمایشگر کوچک موجودی
- رنگ‌بندی بر اساس وضعیت (سبز/نارنجی/قرمز)
- هشدار موجودی کم/تمام
- دکمه سریع برای خرید

### 4. React Hooks

#### `hooks/useCredits.ts`
- مدیریت state موجودی
- توابع:
  - `loadCredits()` - بارگذاری موجودی
  - `checkCredits()` - بررسی موجودی کافی
  - `useCredit()` - استفاده از credit
- Auto-refresh بعد از هر عملیات

### 5. یکپارچگی با سیستم موجود

#### `hooks/usePitchAnalysis.ts`
- ✅ برر