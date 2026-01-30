# حل مشکل JSON Parse Error

## مشکل

```
Unterminated string in JSON at position 9917 (line 179 column 17)
```

### علت:
OpenAI گاهی JSON نامعتبر برمی‌گرداند که:
1. String ها بسته نمی‌شوند (unterminated)
2. پاسخ قطع می‌شود (truncated)
3. max_tokens کافی نیست

## راه‌حل اعمال شده

### 1. افزایش max_tokens ✅

**قبل:**
```typescript
Stage 1: max_tokens: 2500
Stage 2: max_tokens: 2000
Stage 3: max_tokens: 1500
```

**بعد:**
```typescript
Stage 1: max_tokens: 3000  // +500
Stage 2: max_tokens: 3000  // +1000
Stage 3: max_tokens: 2000  // +500
```

### 2. Error Handling پیشرفته ✅

**قبل (خطا می‌داد):**
```typescript
const content = response.choices[0]?.message?.content || '{}'
return JSON.parse(content) as Stage1Output  // ❌ اگر JSON نامعتبر بود crash می‌کرد
```

**بعد (امن):**
```typescript
const content = response.choices[0]?.message?.content || '{}'

try {
  return JSON.parse(content) as Stage1Output
} catch (parseError: any) {
  console.error('[Stage 1] JSON parse error:', parseError.message)
  console.error('[Stage 1] Content length:', content.length)
  
  // تلاش برای fix کردن JSON
  let fixedContent = content
  if (!content.trim().endsWith('}')) {
    const lastCompleteField = content.lastIndexOf('",')
    if (lastCompleteField > 0) {
      fixedContent = content.substring(0, lastCompleteField + 2) + '\n}'
    }
  }
  
  try {
    return JSON.parse(fixedContent) as Stage1Output
  } catch (secondError) {
    // اگر باز هم نشد، error واضح بده
    throw new Error('Stage 1 analysis failed: Invalid JSON response')
  }
}
```

### 3. Fallback برای Stage 2 ✅

Stage 2 اگر JSON نامعتبر بود، یک ساختار minimal برمی‌گرداند:

```typescript
return {
  scorecard: {
    problemValidityUrgency: { score: 5, reasoning: 'Analysis incomplete' },
    // ... بقیه با score 5
  },
  gapDiagnosis: {
    biggestValueGap: 'Analysis incomplete',
    fastestCredibilityWin: 'Please retry',
    dangerousIllusions: [],
  },
  prioritizedChecklist: {
    high: ['Retry analysis'],
    medium: [],
    low: [],
  },
  // ...
} as Stage2Output
```

## فایل‌های تغییر یافته

### ✅ `app/api/analyze-pitch/route.ts`
- Stage 1: max_tokens 2500 → 3000 + error handling
- Stage 2: max_tokens 2000 → 3000 + error handling + fallback
- Stage 3: max_tokens 1500 → 2000 + error handling

### ✅ `app/api/perfect-pitch/route.ts`
- Stage 1: max_tokens 2500 → 3000 + error handling
- Stage 2: max_tokens 2000 → 3000 + error handling + fallback
- Stage 3: max_tokens 1500 → 2000 + error handling

## چگونه کار می‌کند؟

### مرحله 1: تلاش اول
```typescript
try {
  return JSON.parse(content)  // تلاش برای parse کردن
} catch (parseError) {
  // اگر خطا داد، برو به مرحله 2
}
```

### مرحله 2: تلاش برای Fix
```typescript
// اگر JSON با } تمام نشده
if (!content.trim().endsWith('}')) {
  // آخرین field کامل را پیدا کن
  const lastCompleteField = content.lastIndexOf('",')
  // JSON را از آنجا ببر و } اضافه کن
  fixedContent = content.substring(0, lastCompleteField + 2) + '\n}'
}

try {
  return JSON.parse(fixedContent)  // تلاش دوم
} catch (secondError) {
  // اگر باز هم نشد، برو به مرحله 3
}
```

### مرحله 3: Fallback یا Error
```typescript
// Stage 2: برگردان ساختار minimal
return minimalStructure

// Stage 1 & 3: throw error
throw new Error('Analysis failed: Invalid JSON')
```

## مزایا

### 1. Robustness (استحکام)
- دیگر با JSON نامعتبر crash نمی‌کند
- تلاش می‌کند JSON را fix کند
- اگر نشد، error واضح می‌دهد

### 2. Debugging
- Log می‌کند که مشکل کجاست
- طول content را نشان می‌دهد
- می‌توانیم ببینیم چرا fail شد

### 3. User Experience
- Stage 2 حتی با خطا، نتیجه partial می‌دهد
- کاربر می‌تواند retry کند
- پیام خطا واضح است

## تست کردن

### تست 1: با pitch deck کوچک
```bash
# باید بدون خطا کار کند
```

### تست 2: با pitch deck بزرگ
```bash
# اگر JSON قطع شد، باید fix کند یا error واضح بدهد
```

### تست 3: بررسی Logs
```bash
# در terminal ببینید:
# - آیا JSON parse error می‌دهد؟
# - آیا fix می‌کند؟
# - آیا fallback استفاده می‌شود؟
```

## مشکلات احتمالی

### مشکل 1: هنوز JSON نامعتبر است
**علت**: pitch deck خیلی بزرگ است
**راه‌حل**: 
- max_tokens را بیشتر کنید
- یا pitch deck را کوتاه‌تر کنید

### مشکل 2: Fix کار نمی‌کند
**علت**: JSON به شدت خراب است
**راه‌حل**:
- بررسی کنید مدل چه چیزی برگردانده
- شاید نیاز به تغییر prompt باشد

### مشکل 3: Fallback نتیجه ضعیف می‌دهد
**علت**: Stage 2 با ساختار minimal برگشت
**راه‌حل**:
- کاربر باید retry کند
- یا pitch deck را کوتاه‌تر کند

## وضعیت

- ✅ Error handling اضافه شد
- ✅ max_tokens افزایش یافت
- ✅ Fallback برای Stage 2 اضافه شد
- ✅ Logging برای debugging اضافه شد
- ⏳ نیاز به تست با pitch deck واقعی

## مرحله بعدی

1. تست با pitch deck
2. بررسی logs
3. اگر هنوز مشکل دارد، max_tokens را بیشتر کنید

---

**تاریخ**: 2026-01-30  
**وضعیت**: Fix اعمال شد ✅ | نیاز به تست ⏳
