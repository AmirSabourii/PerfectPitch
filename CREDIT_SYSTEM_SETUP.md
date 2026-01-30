# راه‌اندازی سریع سیستم Credit

## مراحل نصب و راه‌اندازی

### 1. بررسی فایل‌های ایجاد شده

تمام فایل‌های زیر با موفقیت ایجاد شده‌اند:

#### Core System
- ✅ `lib/creditSystem.ts` - منطق اصلی سیستم
- ✅ `lib/services/creditService.ts` - سرویس Firebase

#### API Endpoints
- ✅ `app/api/credits/check/route.ts` - بررسی موجودی
- ✅ `app/api/credits/use/route.ts` - استفاده از credit
- ✅ `app/api/credits/balance/route.ts` - دریافت موجودی

#### UI Components
- ✅ `components/CreditBalance.tsx` - نمایش موجودی
- ✅ `components/CreditPurchase.tsx` - فرم خرید
- ✅ `components/CreditManagement.tsx` - صفحه مدیریت کامل

#### Hooks
- ✅ `hooks/useCredits.ts` - React hook برای مدیریت

#### Integration
- ✅ `hooks/usePitchAnalysis.ts` - یکپارچگی با تحلیل
- ✅ `components/dashboard/DashboardContent.tsx` - نمایش در dashboard
- ✅ `components/dashboard/DashboardSidebar.tsx` - منوی sidebar
- ✅ `components/PricingView.tsx` - صفحه قیمت‌گذاری
- ✅ `lib/types.ts` - تایپ‌های TypeScript

#### Documentation & Tests
- ✅ `CREDIT_SYSTEM_GUIDE.md` - راهنمای کامل
- ✅ `firestore-credit-rules.txt` - قوانین امنیتی
- ✅ `lib/__tests__/creditSystem.test.ts` - تست‌های واحد

### 2. راه‌اندازی Firebase

#### الف) اضافه کردن Collections

Collections زیر به صورت خودکار ایجاد می‌شوند:
- `userCredits/{userId}`
- `creditPurchases/{purchaseId}`
- `creditUsage/{usageId}`

#### ب) تنظیم Security Rules

محتوای فایل `firestore-credit-rules.txt` را به `firestore.rules` خود اضافه کنید:

```bash
# کپی قوانین
cat firestore-credit-rules.txt >> firestore.rules

# دیپلوی قوانین
firebase deploy --only firestore:rules
```

### 3. تست سیستم

#### الف) تست واحد
```bash
npm test lib/__tests__/creditSystem.test.ts
```

#### ب) تست دستی

1. **ورود به Dashboard**
   - به `/dashboard` بروید
   - روی "Credits" در sidebar کلیک کنید

2. **خرید Credit**
   - تب "خرید Credit" را انتخاب کنید
   - اسلایدر را حرکت دهید (5-50)
   - روی "خرید" کلیک کنید

3. **استفاده از Credit**
   - به تب "Practice" بروید
   - یک تحلیل انجام دهید
   - موجودی باید کاهش یابد

4. **بررسی تاریخچه**
   - به تب "تاریخچه" در Credits بروید
   - خریدها و استفاده‌ها را ببینید

### 4. یکپارچگی با درگاه پرداخت

فعلاً سیستم در حالت تست است. برای اتصال به درگاه واقعی:

#### الف) انتخاب درگاه
- Stripe (بین‌المللی)
- ZarinPal (ایران)
- یا هر درگاه دیگر

#### ب) پیاده‌سازی

در `components/CreditPurchase.tsx`:

```typescript
const handlePurchase = async (credits: number, amount: number) => {
  // TODO: اتصال به درگاه پرداخت
  
  // مثال با Stripe:
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ credits, amount })
  })
  
  const { clientSecret } = await response.json()
  
  // ادامه فرآیند پرداخت...
}
```

### 5. بررسی عملکرد

#### الف) نمایش موجودی در Header
- موجودی credit در header dashboard نمایش داده می‌شود
- با کلیک روی آن به صفحه Credits می‌روید

#### ب) بررسی خودکار قبل از تحلیل
- قبل از هر تحلیل، موجودی بررسی می‌شود
- در صورت کمبود، پیام خطا نمایش داده می‌شود

#### ج) کسر خودکار بعد از تحلیل
- بعد از تحلیل موفق، credit کسر می‌شود
- موجودی به‌روزرسانی می‌شود

### 6. نکات مهم

#### امنیت
- ✅ تمام نوشتن‌ها از طریق API
- ✅ احراز هویت برای تمام endpoints
- ✅ استفاده از Firestore Transactions
- ✅ Validation در سمت سرور

#### عملکرد
- ✅ بارگذاری lazy برای components
- ✅ کش کردن موجودی در کلاینت
- ✅ به‌روزرسانی optimistic UI

#### تجربه کاربری
- ✅ اسلایدر روان برای انتخاب
- ✅ نمایش قیمت real-time
- ✅ هشدارهای موجودی کم
- ✅ تاریخچه کامل

### 7. عیب‌یابی

#### مشکل: موجودی نمایش داده نمی‌شود
```typescript
// بررسی console
console.log('Credits:', credits)
console.log('Loading:', loading)
console.log('Error:', error)
```

#### مشکل: خرید کار نمی‌کند
```typescript
// بررسی Firebase Rules
// بررسی Authentication
// بررسی Network tab در DevTools
```

#### مشکل: Credit کسر نمی‌شود
```typescript
// بررسی usePitchAnalysis hook
// بررسی API endpoint /api/credits/use
// بررسی Firestore transactions
```

### 8. مراحل بعدی

#### فاز 1 (فوری)
- [ ] اتصال به درگاه پرداخت واقعی
- [ ] تست کامل end-to-end
- [ ] مستندسازی API

#### فاز 2 (کوتاه‌مدت)
- [ ] سیستم تخفیف
- [ ] Gift Credits
- [ ] Referral Program

#### فاز 3 (بلندمدت)
- [ ] Analytics پیشرفته
- [ ] Bulk Purchase برای سازمان‌ها
- [ ] API عمومی

## پشتیبانی

اگر مشکلی پیش آمد:
1. ✅ این فایل را بخوانید
2. ✅ `CREDIT_SYSTEM_GUIDE.md` را بررسی کنید
3. ✅ تست‌ها را اجرا کنید
4. ✅ Console و Network را بررسی کنید

## خلاصه

سیستم Credit به صورت کامل پیاده‌سازی شده و آماده استفاده است:

✅ **Backend**: Firebase + API Endpoints  
✅ **Frontend**: React Components + Hooks  
✅ **Integration**: Dashboard + Pitch Analysis  
✅ **Security**: Rules + Validation  
✅ **Testing**: Unit Tests  
✅ **Documentation**: Complete Guide  

**فقط یک قدم باقی مانده: اتصال به درگاه پرداخت واقعی!**
