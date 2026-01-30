# وضعیت پشتیبانی کامل فارسی

## ✅ کارهای انجام شده

### 1. مشکل ذخیره تاریخچه (حل شد)
- `hooks/usePitchAnalysis.ts` به‌روز شد
- حالا هم `DeepAnalysisResult` و هم `PerfectPitchAnalysis` را پشتیبانی می‌کند
- Score و Summary به درستی از هر دو نوع تحلیل استخراج می‌شود

### 2. فونت Vazir و RTL Support (حل شد)
- فونت Vazir از CDN اضافه شد (`app/globals.css`)
- پشتیبانی RTL با `[dir="rtl"]` فعال شد
- `LanguageContext` قبلاً RTL را پشتیبانی می‌کرد

### 3. فایل ترجمه تحلیل (ایجاد شد)
- `lib/i18n-analysis.ts` با تمام ترجمه‌های فارسی ایجاد شد
- شامل تمام بخش‌های Overview, Stage 1, Stage 2, Stage 3, Raw Data

## ⏳ کارهای باقی‌مانده

### 4. اتصال ترجمه‌ها به کامپوننت
**فایل:** `components/PerfectPitchResult.tsx`

باید:
```typescript
import { useLanguage } from '@/contexts/LanguageContext'
import { analysisResultCopy } from '@/lib/i18n-analysis'

// در داخل کامپوننت:
const { language } = useLanguage()
const copy = analysisResultCopy[language]

// استفاده:
<h3>{copy.stage1.title}</h3>
```

### 5. پرامپت‌های فارسی برای API
**فایل:** `app/api/analyze-pitch/route.ts`

باید:
1. زبان را از request body دریافت کند
2. اگر زبان فارسی بود، از پرامپت‌های فارسی استفاده کند
3. پرامپت‌های فارسی برای Stage 1, 2, 3 ایجاد شود

**مثال:**
```typescript
const language = body.language || 'en'

const systemPrompt = language === 'fa' 
  ? PERSIAN_STAGE1_PROMPT 
  : ENGLISH_STAGE1_PROMPT
```

### 6. ارسال زبان از Frontend
**فایل:** `hooks/usePitchAnalysis.ts`

باید:
```typescript
import { useLanguage } from '@/contexts/LanguageContext'

const { language } = useLanguage()

const payload = {
  transcript: text,
  file_context: documentContext || fileContext,
  language: language, // اضافه کردن زبان
  ...contextData
}
```

## 📋 چک‌لیست نهایی

- [x] فونت Vazir اضافه شد
- [x] RTL Support فعال شد
- [x] ذخیره تاریخچه برای PerfectPitch اصلاح شد
- [x] فایل ترجمه‌های فارسی ایجاد شد
- [ ] اتصال ترجمه‌ها به `PerfectPitchResult`
- [ ] ایجاد پرامپت‌های فارسی Stage 1
- [ ] ایجاد پرامپت‌های فارسی Stage 2
- [ ] ایجاد پرامپت‌های فارسی Stage 3
- [ ] ارسال زبان از Frontend به API
- [ ] تست کامل با محتوای فارسی

## 🎯 اولویت بعدی

برای تکمیل پشتیبانی فارسی، باید:
1. کامپوننت `PerfectPitchResult` را به‌روز کنیم (۱۵ دقیقه)
2. پرامپت‌های فارسی را بنویسیم (۳۰ دقیقه)
3. ارسال زبان از Frontend (۵ دقیقه)

**زمان تخمینی کل: ۵۰ دقیقه**
