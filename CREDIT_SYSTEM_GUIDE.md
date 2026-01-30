# راهنمای سیستم Credit

## نمای کلی

سیستم Credit یک مدل پرداخت انعطاف‌پذیر است که به کاربران اجازه می‌دهد بدون نیاز به اشتراک ماهانه، فقط برای تحلیل‌هایی که استفاده می‌کنند پرداخت کنند.

## ساختار قیمت‌گذاری

- **هر تحلیل = 1 Credit = $3**
- **محدوده خرید: 5 تا 50 Credit**
- **قیمت کل: $15 تا $150**
- **بدون تاریخ انقضا**

## ویژگی‌های کلیدی

### 1. انعطاف کامل
- کاربران می‌توانند هر تعداد Credit که نیاز دارند خریداری کنند
- بدون تعهد ماهانه یا سالانه
- Credit‌ها هیچ‌وقت منقضی نمی‌شوند

### 2. شفافیت کامل
- قیمت ثابت برای هر تحلیل
- بدون هزینه‌های پنهان
- نمایش موجودی در همه جا

### 3. کنترل هزینه
- کاربران دقیقاً می‌دانند چقدر خرج می‌کنند
- امکان خرید تدریجی
- مناسب برای استفاده‌های متغیر

## معماری فنی

### 1. ساختار داده Firebase

```typescript
// Collection: userCredits/{userId}
{
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  purchaseHistory: CreditPurchase[]
  usageHistory: CreditUsage[]
  lastUpdated: Timestamp
}

// Collection: creditPurchases/{purchaseId}
{
  id: string
  userId: string
  credits: number
  amount: number
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  purchasedAt: Timestamp
  transactionId?: string
}

// Collection: creditUsage/{usageId}
{
  id: string
  userId: string
  credits: number
  action: 'pitch_analysis' | 'deep_research' | 'realtime_session'
  resourceId: string
  usedAt: Timestamp
}
```

### 2. API Endpoints

#### بررسی موجودی
```
POST /api/credits/check
Body: { userId, action }
Response: { hasEnoughCredits, remainingCredits, requiredCredits }
```

#### استفاده از Credit
```
POST /api/credits/use
Body: { userId, action, resourceId }
Response: { success, usage, remainingCredits }
```

#### دریافت موجودی
```
GET /api/credits/balance?userId={userId}
Response: { success, credits }
```

### 3. React Hooks

#### useCredits
```typescript
const {
  credits,           // اطلاعات کامل credit
  loading,           // وضعیت بارگذاری
  error,             // خطاها
  loadCredits,       // بارگذاری مجدد
  checkCredits,      // بررسی موجودی کافی
  useCredit,         // استفاده از credit
  hasCredits,        // آیا credit دارد؟
  remainingCredits   // تعداد credit باقیمانده
} = useCredits()
```

## جریان کاری

### 1. خرید Credit

```
کاربر → صفحه Credits → انتخاب تعداد (اسلایدر) → پرداخت → تایید → به‌روزرسانی موجودی
```

### 2. استفاده از Credit

```
شروع تحلیل → بررسی موجودی → انجام تحلیل → کسر credit → نمایش نتیجه
```

### 3. مدیریت Credit

```
Dashboard → Credits Tab → نمایش موجودی + تاریخچه + خرید جدید
```

## کامپوننت‌های UI

### 1. CreditBalance
نمایش موجودی فعلی با نمودار استفاده

### 2. CreditPurchase
اسلایدر انتخاب تعداد و فرم خرید

### 3. CreditManagement
صفحه کامل مدیریت با تب‌های:
- نمای کلی
- خرید Credit
- تاریخچه

## یکپارچگی با سیستم موجود

### 1. Dashboard
- نمایش موجودی در header
- دکمه سریع برای خرید
- هشدار موجودی کم

### 2. Pitch Analysis
- بررسی خودکار قبل از تحلیل
- کسر خودکار بعد از تحلیل موفق
- پیام خطا در صورت کمبود موجودی

### 3. Sidebar
- منوی جدید "Credits"
- دسترسی سریع به مدیریت

## امنیت

### 1. Transaction Safety
- استفاده از Firestore Transactions
- جلوگیری از race conditions
- Rollback خودکار در صورت خطا

### 2. Validation
- بررسی موجودی قبل از هر عملیات
- محدودیت محدوده خرید (5-50)
- احراز هویت برای تمام APIها

### 3. Error Handling
- مدیریت خطاهای پرداخت
- بازگشت credit در صورت خطا
- لاگ کامل تراکنش‌ها

## تست

### 1. Unit Tests
```bash
npm test lib/creditSystem.test.ts
npm test lib/services/creditService.test.ts
```

### 2. Integration Tests
```bash
npm test hooks/useCredits.test.ts
```

### 3. E2E Tests
- خرید credit
- استفاده از credit
- مدیریت موجودی

## نکات مهم برای توسعه‌دهندگان

### 1. همیشه موجودی را بررسی کنید
```typescript
const hasEnough = await checkCredits('pitch_analysis')
if (!hasEnough) {
  // نمایش پیام خطا
  return
}
```

### 2. از Transaction استفاده کنید
```typescript
await runTransaction(db, async (transaction) => {
  // عملیات‌های atomic
})
```

### 3. خطاها را مدیریت کنید
```typescript
try {
  await useCredit('pitch_analysis', pitchId)
} catch (error) {
  if (error.message === 'Insufficient credits') {
    // هدایت به صفحه خرید
  }
}
```

## Roadmap

### Phase 1 (فعلی)
- ✅ ساختار پایه
- ✅ خرید و استفاده
- ✅ UI کامل
- ✅ یکپارچگی با Dashboard

### Phase 2 (آینده)
- [ ] اتصال به درگاه پرداخت واقعی
- [ ] سیستم تخفیف برای خریدهای بالا
- [ ] Gift Credits
- [ ] Credit Bundles با قیمت ویژه

### Phase 3 (آینده)
- [ ] API برای سازمان‌ها
- [ ] Bulk Purchase
- [ ] Analytics پیشرفته
- [ ] Referral System

## پشتیبانی

برای سوالات یا مشکلات:
1. بررسی این مستند
2. بررسی کد نمونه در `components/CreditManagement.tsx`
3. بررسی تست‌ها
4. تماس با تیم توسعه

## لایسنس

این سیستم بخشی از پلتفرم AI Pitch Analyzer است و تحت لایسنس مشابه قرار دارد.
