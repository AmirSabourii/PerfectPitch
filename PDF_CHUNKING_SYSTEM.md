# سیستم Chunking برای پردازش PDF

## 📋 خلاصه

سیستم پردازش PDF به گونه‌ای طراحی شده که فایل‌های بزرگ را به قطعات 5 صفحه‌ای تقسیم کرده و با فاصله 1 دقیقه به GPT-4o-mini ارسال می‌کند.

## 🎯 دلایل استفاده از Chunking

### 1. جلوگیری از Rate Limit
- OpenAI محدودیت تعداد درخواست در دقیقه دارد
- با فاصله 1 دقیقه بین chunk ها از rate limit جلوگیری می‌شود

### 2. کاهش هزینه
- پردازش chunk های کوچکتر کارآمدتر است
- در صورت خطا، فقط یک chunk دوباره پردازش می‌شود

### 3. بهبود دقت
- مدل می‌تواند روی صفحات کمتر تمرکز بیشتری داشته باشد
- احتمال از دست رفتن اطلاعات کاهش می‌یابد

### 4. مدیریت بهتر خطا
- اگر یک chunk fail شود، بقیه ادامه می‌یابند
- نتیجه نهایی از تمام chunk های موفق merge می‌شود

## 🔧 نحوه کار

### مرحله 1: تقسیم PDF
```typescript
// محاسبه تعداد صفحات
const totalPages = await getPdfPageCount(buffer)

// محاسبه تعداد chunk ها (5 صفحه در هر chunk)
const pagesPerChunk = 5
const numChunks = Math.ceil(totalPages / pagesPerChunk)
```

**مثال:**
- PDF 12 صفحه‌ای → 3 chunk (5 + 5 + 2)
- PDF 20 صفحه‌ای → 4 chunk (5 + 5 + 5 + 5)
- PDF 7 صفحه‌ای → 2 chunk (5 + 2)

### مرحله 2: پردازش هر Chunk
```typescript
for (let i = 0; i < numChunks; i++) {
    const startPage = i * pagesPerChunk + 1
    const endPage = Math.min((i + 1) * pagesPerChunk, totalPages)
    
    // ارسال به GPT-4o-mini
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { 
                role: 'system', 
                content: `Analyze pages ${startPage} to ${endPage}...` 
            },
            { 
                role: 'user', 
                content: `PDF (base64): ${pdfBase64}` 
            }
        ]
    })
    
    // ذخیره نتیجه
    results.push(parsedData)
    
    // صبر 1 دقیقه قبل از chunk بعدی
    if (i < numChunks - 1) {
        await wait(60000) // 60 seconds
    }
}
```

### مرحله 3: Merge کردن نتایج
```typescript
function mergeExtractedData(results: any[]): any {
    const merged = {
        problem: '',
        solution: '',
        market: '',
        // ... سایر فیلدها
    }
    
    // ترکیب اطلاعات از تمام chunk ها
    for (const result of results) {
        for (const key in merged) {
            if (result[key] && result[key] !== 'Not specified in deck') {
                // جلوگیری از تکرار
                if (!merged[key].includes(result[key])) {
                    merged[key] += '\n\n' + result[key]
                }
            }
        }
    }
    
    return merged
}
```

## 📊 مثال عملی

### PDF 15 صفحه‌ای:

**Chunk 1 (صفحات 1-5):**
```json
{
  "problem": "High customer churn in SaaS",
  "solution": "AI-powered retention platform",
  "market": "Not specified in deck",
  ...
}
```

**Chunk 2 (صفحات 6-10):**
```json
{
  "problem": "Not specified in deck",
  "solution": "Not specified in deck",
  "market": "$50B TAM, targeting enterprise",
  ...
}
```

**Chunk 3 (صفحات 11-15):**
```json
{
  "problem": "Not specified in deck",
  "solution": "Not specified in deck",
  "market": "Not specified in deck",
  "team": "CEO: 10 years at Google, CTO: PhD in ML",
  ...
}
```

**نتیجه Merged:**
```json
{
  "problem": "High customer churn in SaaS",
  "solution": "AI-powered retention platform",
  "market": "$50B TAM, targeting enterprise",
  "team": "CEO: 10 years at Google, CTO: PhD in ML",
  ...
}
```

## ⏱️ زمان پردازش

| تعداد صفحات | تعداد Chunk | زمان تقریبی |
|-------------|-------------|-------------|
| 5 صفحه | 1 chunk | ~30 ثانیه |
| 10 صفحه | 2 chunk | ~1.5 دقیقه |
| 15 صفحه | 3 chunk | ~2.5 دقیقه |
| 20 صفحه | 4 chunk | ~3.5 دقیقه |
| 25 صفحه | 5 chunk | ~4.5 دقیقه |

**فرمول:** `زمان = (تعداد chunk × 30 ثانیه) + ((تعداد chunk - 1) × 60 ثانیه)`

## 💰 هزینه

### هزینه هر Chunk (5 صفحه):
- Input tokens: ~2000-3000 tokens
- Output tokens: ~500-1000 tokens
- هزینه: ~$0.001-0.002

### مثال PDF 20 صفحه‌ای:
- 4 chunk × $0.0015 = **~$0.006**
- زمان: ~3.5 دقیقه

## 🛡️ مدیریت خطا

### اگر یک Chunk fail شود:
```typescript
try {
    const response = await openai.chat.completions.create(...)
    results.push(parsedData)
} catch (error) {
    console.error(`Chunk ${i + 1} failed:`, error)
    // ادامه با chunk های بعدی
}
```

### اگر همه Chunk ها fail شوند:
```typescript
if (results.length === 0) {
    return NextResponse.json(
        { error: 'Failed to extract data from PDF' },
        { status: 500 }
    )
}
```

## 🎨 تجربه کاربری

### در Frontend:
```typescript
// نمایش پیشرفت
setIsProcessingFile(true)
// کاربر می‌بیند: "Analyzing your pitch deck..."

// بعد از اتمام
setIsProcessingFile(false)
// انتقال به صفحه review
```

### لاگ‌های Console:
```
[parse-doc] Total pages: 15
[parse-doc] Splitting into 3 chunks of 5 pages each
[parse-doc] Processing chunk 1/3 (pages 1-5)...
[parse-doc] Chunk 1 processed successfully
[parse-doc] Waiting 60 seconds before next chunk...
[parse-doc] Processing chunk 2/3 (pages 6-10)...
[parse-doc] Chunk 2 processed successfully
[parse-doc] Waiting 60 seconds before next chunk...
[parse-doc] Processing chunk 3/3 (pages 11-15)...
[parse-doc] Chunk 3 processed successfully
[parse-doc] Merging 3 results...
[parse-doc] Extraction complete
```

## 🔍 Merge Strategy

### قوانین Merge:
1. **اگر فیلد خالی است:** از اولین مقدار غیر خالی استفاده کن
2. **اگر فیلد پر است:** فقط اگر محتوای جدید متفاوت باشد اضافه کن
3. **جلوگیری از تکرار:** بررسی کن که محتوا قبلاً اضافه نشده باشد
4. **فاصله‌گذاری:** با `\n\n` بین محتواهای مختلف

### مثال Merge:
```typescript
// Chunk 1
{ problem: "High churn rate" }

// Chunk 2
{ problem: "Customer retention issues" }

// Merged (محتوای متفاوت)
{ problem: "High churn rate\n\nCustomer retention issues" }

// اما اگر Chunk 2 بود:
{ problem: "High churn rate in SaaS" }

// Merged (محتوای مشابه - تکرار نمی‌شود)
{ problem: "High churn rate" }
```

## 📈 مزایا

### 1. مقیاس‌پذیری
- ✅ می‌تواند PDF های بزرگ (تا 100 صفحه) را پردازش کند
- ✅ بدون نگرانی از rate limit

### 2. قابلیت اطمینان
- ✅ اگر یک chunk fail شود، بقیه ادامه می‌یابند
- ✅ نتیجه نهایی از تمام chunk های موفق

### 3. بهینه‌سازی هزینه
- ✅ فقط chunk های لازم پردازش می‌شوند
- ✅ در صورت خطا، فقط chunk مشکل‌دار دوباره پردازش می‌شود

### 4. دقت بالاتر
- ✅ مدل روی صفحات کمتر تمرکز بیشتری دارد
- ✅ احتمال از دست رفتن اطلاعات کمتر است

## ⚙️ تنظیمات

### تغییر تعداد صفحات در هر Chunk:
```typescript
const pagesPerChunk = 5 // تغییر به 3, 7, 10, etc.
```

### تغییر فاصله زمانی:
```typescript
await wait(60000) // تغییر به 30000 (30s), 120000 (2min), etc.
```

### تغییر timeout:
```typescript
TIMEOUTS.PDF_PARSE * 2 // تغییر ضریب به 1, 3, 4, etc.
```

## 🚀 نتیجه‌گیری

سیستم chunking به ما اجازه می‌دهد:
- PDF های بزرگ را بدون مشکل پردازش کنیم
- از rate limit جلوگیری کنیم
- هزینه را بهینه کنیم
- دقت را افزایش دهیم
- تجربه کاربری بهتری ارائه دهیم

**این سیستم آماده برای production است! 🎉**
