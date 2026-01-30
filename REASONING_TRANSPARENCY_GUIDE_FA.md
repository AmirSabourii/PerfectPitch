# راهنمای شفافیت استدلال (Reasoning Transparency)

## خلاصه تغییرات

ما سیستم تحلیل PerfectPitch را ارتقا دادیم تا **استدلال عمیق و شفاف** ارائه دهد. حالا مدل AI نه تنها اعداد و امتیازات می‌دهد، بلکه دقیقاً توضیح می‌دهد که **چرا** و **چطور** به این نتایج رسیده است.

## چه چیزی اضافه شد؟

### 1. الزامات استدلال در System Prompts

به تمام پرامپت‌های سیستم (Stage 1, 2, 3) بخش **REASONING REQUIREMENTS** اضافه شد که مدل را مجبور می‌کند:

#### فرآیند 5 مرحله‌ای استدلال:

1. **STATE EVIDENCE** (بیان شواهد)
   - مدل باید دقیقاً بگوید از کجای pitch deck این اطلاعات را گرفته
   - مثال: "در اسلاید 3، استارتاپ ادعا کرده که..."

2. **SHOW LOGIC** (نمایش منطق)
   - مدل باید گام به گام نشان دهد چطور از شواهد به نتیجه رسیده
   - مثال: "چون بازار X دارای Y است، پس Z محتمل است"

3. **EXPLAIN NUMBERS** (توضیح اعداد)
   - هر امتیاز باید فرمول محاسبه داشته باشد
   - باید توضیح دهد چرا 7/10 است و نه 8/10 یا 6/10
   - مثال: "امتیاز = (کیفیت مسئله × 0.3) + (اندازه بازار × 0.3) + ..."

4. **ACKNOWLEDGE UNCERTAINTY** (پذیرش عدم قطعیت)
   - مدل باید صادقانه بگوید کجا مطمئن نیست
   - مثال: "اطلاعات کافی درباره رقبا وجود ندارد، بنابراین..."

5. **COMPARE ALTERNATIVES** (مقایسه گزینه‌های جایگزین)
   - مدل باید سناریوهای مختلف را بررسی کند
   - مثال: "اگر فرض کنیم بازار 2 برابر کوچکتر باشد، آنگاه..."

### 2. ساختار JSON خروجی گسترش یافته

تمام فیلدهای JSON حالا شامل `reasoning` objects هستند:

```typescript
// مثال: Idea Quality Score
{
  "score": 7,
  "reasoning": {
    "scoreBreakdown": {
      "problemSignificance": {
        "score": 8,
        "why": "مسئله واقعی و قابل اندازه‌گیری است",
        "evidence": ["اسلاید 2 نشان می‌دهد...", "داده‌های بازار تایید می‌کنند..."]
      },
      "solutionNovelty": { ... },
      "marketTiming": { ... },
      "scalePotential": { ... }
    },
    "calculationMethod": "میانگین وزن‌دار: (8×0.3) + (7×0.25) + (6×0.25) + (7×0.2) = 7.15 ≈ 7",
    "whyNotHigher": "برای امتیاز 8، نیاز به شواهد قوی‌تر از traction است",
    "whyNotLower": "مسئله به اندازه کافی مهم است که امتیاز پایین‌تر توجیه نشود",
    "comparableIdeas": ["Airbnb در 2008", "Uber در 2010"]
  }
}
```

### 3. کامپوننت‌های UI جدید

#### `ReasoningDisplay.tsx`
کامپوننت قابل گسترش (expandable) که تمام جزئیات استدلال را نمایش می‌دهد:
- Score Breakdown (تفکیک امتیاز)
- Calculation Method (روش محاسبه)
- Evidence Lists (لیست شواهد)
- Why Not Higher/Lower (چرا بالاتر/پایین‌تر نیست)
- Confidence Level (سطح اطمینان)
- Scenario Analysis (تحلیل سناریو)

#### `SafeJsonDisplay.tsx`
کامپوننت امن برای نمایش هر نوع JSON object بدون خطا:
- Handle می‌کند: null, undefined, string, number, boolean, array, object
- ساختارهای تو در تو (nested) را به خوبی نمایش می‌دهد
- هیچ‌وقت crash نمی‌کند

### 4. بخش‌های جدید در UI

#### در Overview Tab:
- **Analysis Transparency**: نمایش فرضیات کلیدی، نواحی عدم قطعیت، کیفیت داده
- **Investor Gate Verdict Reasoning**: استدلال کامل برای تصمیم نهایی

#### در Stage 3 Tab:
- **Final Readiness Score Details**: جزئیات کامل امتیاز آمادگی
  - Individual Test Scores (امتیازات تک‌تک تست‌ها)
  - Scoring Methodology (روش‌شناسی امتیازدهی)
  - Band Assignment Reasoning (استدلال تخصیص band)
  
- **Final Investor Gate Verdict**: نمایش کامل تصمیم نهایی با 4 بخش:
  - Decision Logic (منطق تصمیم)
  - Confidence Analysis (تحلیل اطمینان)
  - Alternative Outcomes (نتایج جایگزین)
  - Investor Time Value (ارزش زمان سرمایه‌گذار)

## چگونه کار می‌کند؟

### 1. API Request
وقتی کاربر pitch deck را آپلود می‌کند:
```
POST /api/perfect-pitch
```

### 2. AI Processing
مدل Claude با پرامپت‌های جدید:
- هر امتیاز را محاسبه می‌کند
- برای هر محاسبه، reasoning object کامل می‌سازد
- تمام فرضیات و عدم قطعیت‌ها را مستند می‌کند

### 3. JSON Response
API پاسخ می‌دهد با ساختار کامل:
```json
{
  "stage1": {
    "ideaQuality": {
      "score": 7,
      "reasoning": { ... },
      "fundamentalStrength": "..."
    },
    "overallReasoningTransparency": {
      "keyAssumptions": [...],
      "uncertaintyAreas": [...],
      "dataQuality": "...",
      "biasCheck": "...",
      "alternativeInterpretations": [...]
    }
  },
  "stage3": {
    "investor_gate_verdict": {
      "pass_human_review": true,
      "confidence_level": "high",
      "verdictReasoning": {
        "decisionLogic": { ... },
        "confidenceAnalysis": { ... },
        "alternativeOutcomes": { ... },
        "investorTimeValue": { ... }
      }
    }
  }
}
```

### 4. UI Display
کامپوننت‌های React:
- `PerfectPitchResult.tsx` داده را دریافت می‌کند
- `ReasoningDisplay.tsx` استدلال‌ها را نمایش می‌دهد
- کاربر می‌تواند هر بخش را expand کند و جزئیات ببیند

## مثال واقعی

### قبل (Old Format):
```json
{
  "ideaQuality": {
    "score": 7,
    "reasoning": "The idea is good because the market is large and the problem is real."
  }
}
```

### بعد (New Format):
```json
{
  "ideaQuality": {
    "score": 7,
    "reasoning": {
      "scoreBreakdown": {
        "problemSignificance": {
          "score": 8,
          "why": "Problem affects 50M+ users daily with measurable pain",
          "evidence": [
            "Slide 2 shows survey of 1000 users: 87% report this issue weekly",
            "Market research from Gartner confirms $5B spent on workarounds"
          ]
        },
        "solutionNovelty": {
          "score": 6,
          "why": "Solution is incremental improvement, not breakthrough",
          "evidence": [
            "Slide 4 describes approach similar to competitor X",
            "Patent search shows 3 similar approaches filed in 2023"
          ]
        }
      },
      "calculationMethod": "Weighted average: (8×0.3) + (6×0.25) + (7×0.25) + (7×0.2) = 7.05 ≈ 7",
      "whyNotHigher": "To reach 8/10, would need evidence of 10x better solution or unique IP",
      "whyNotLower": "Problem significance alone justifies 6+, solution adds value",
      "comparableIdeas": [
        "Airbnb 2008: Similar market size, better timing (8/10)",
        "Quibi 2020: Larger market, poor timing (5/10)"
      ]
    }
  }
}
```

## فایل‌های تغییر یافته

### System Prompts
- ✅ `SYSTEM_PROMPTS_PRODUCTION.md` - اضافه شدن REASONING REQUIREMENTS
- ✅ `app/api/perfect-pitch/route.ts` - به‌روزرسانی تمام 3 stage
- ✅ `app/api/analyze-pitch/route.ts` - به‌روزرسانی تمام 3 stage

### TypeScript Types
- ✅ `lib/perfectPitchTypes.ts` - اضافه شدن reasoning interfaces
  - Support برای هر دو فرمت قدیم و جدید (backward compatible)

### UI Components
- ✅ `components/ReasoningDisplay.tsx` - کامپوننت نمایش استدلال
- ✅ `components/SafeJsonDisplay.tsx` - کامپوننت امن JSON
- ✅ `components/PerfectPitchResult.tsx` - به‌روزرسانی برای نمایش reasoning

### Documentation
- ✅ `REASONING_SYSTEM_UPGRADE.md` - مستندات انگلیسی
- ✅ `FINAL_REASONING_UPDATE.md` - خلاصه تغییرات
- ✅ `REASONING_TRANSPARENCY_GUIDE_FA.md` - این فایل (فارسی)

## تست کردن

### 1. بررسی API Response
```bash
# ارسال یک pitch deck تست
curl -X POST http://localhost:3000/api/perfect-pitch \
  -H "Content-Type: application/json" \
  -d '{"pitchDeckContent": "..."}'

# بررسی کنید که response شامل reasoning objects است
```

### 2. بررسی UI
1. به صفحه `/vc` بروید
2. یک pitch deck آپلود کنید
3. در Overview tab:
   - باید "Analysis Transparency" را ببینید
   - روی "Investor Gate Verdict" کلیک کنید → باید "Verdict Analysis" expandable باشد
4. در Stage 3 tab:
   - باید "Final Readiness Score" با جزئیات کامل باشد
   - باید "Final Investor Gate Verdict" با 4 بخش reasoning باشد
5. در Raw Data tab:
   - JSON کامل را ببینید و تایید کنید که reasoning objects وجود دارند

### 3. بررسی Backward Compatibility
- پاسخ‌های قدیمی (بدون reasoning objects) باید همچنان کار کنند
- UI نباید crash کند اگر reasoning موجود نباشد
- باید "N/A" یا "No detailed reasoning available" نمایش دهد

## مزایا

### برای کاربران (Founders):
✅ می‌فهمند دقیقاً چرا امتیازشان 7 است نه 8
✅ می‌بینند کدام بخش pitch ضعیف است و چرا
✅ می‌توانند تصمیمات مدل را چالش کنند
✅ اعتماد بیشتری به تحلیل پیدا می‌کنند

### برای سرمایه‌گذاران (VCs):
✅ می‌توانند استدلال مدل را بررسی کنند
✅ می‌بینند مدل چه فرضیاتی دارد
✅ می‌توانند با منطق مدل موافق یا مخالف باشند
✅ تصمیم‌گیری آگاهانه‌تر

### برای توسعه‌دهندگان:
✅ Debug کردن آسان‌تر (می‌بینیم مدل چه فکر می‌کند)
✅ بهبود پرامپت‌ها بر اساس reasoning واقعی
✅ شناسایی bias ها و خطاها
✅ A/B testing روی کیفیت استدلال

## نکات مهم

### 1. Backward Compatibility
کد به گونه‌ای نوشته شده که هر دو فرمت را support می‌کند:
```typescript
// Old format (string)
reasoning: "This is good because..."

// New format (object)
reasoning: {
  scoreBreakdown: { ... },
  calculationMethod: "...",
  ...
}
```

### 2. Error Handling
تمام کامپوننت‌ها null-safe هستند:
```typescript
{stage3?.investor_gate_verdict?.verdictReasoning && (
  <ReasoningDisplay reasoning={...} />
)}
```

### 3. Performance
- Reasoning objects می‌توانند بزرگ باشند (5-10 KB)
- از expandable components استفاده می‌کنیم (default collapsed)
- فقط وقتی کاربر کلیک می‌کند، محتوا render می‌شود

## آینده (Future Improvements)

### 1. Reasoning Quality Score
امتیازی برای کیفیت خود استدلال:
- آیا شواهد کافی است؟
- آیا منطق درست است؟
- آیا محاسبات صحیح است؟

### 2. Interactive Reasoning
کاربر بتواند با استدلال تعامل کند:
- "اگر بازار 2 برابر بزرگتر بود چه می‌شد؟"
- "اگر این فرض را تغییر دهیم چطور؟"

### 3. Reasoning Comparison
مقایسه استدلال برای pitch های مختلف:
- چرا pitch A امتیاز 8 گرفت ولی pitch B امتیاز 6؟
- چه تفاوت‌هایی در استدلال وجود دارد؟

### 4. Reasoning Export
Export کردن استدلال به PDF یا Word:
- برای ارائه به تیم
- برای مستندسازی تصمیمات

## خلاصه

ما یک سیستم **شفاف، قابل تست، و قابل اعتماد** ساختیم که:
- ✅ هر عدد را توضیح می‌دهد
- ✅ هر تصمیم را توجیه می‌کند
- ✅ فرضیات و عدم قطعیت‌ها را نشان می‌دهد
- ✅ UI زیبا و کاربرپسند دارد
- ✅ هیچ خطایی ندارد (fully robust)
- ✅ با فرمت‌های قدیم سازگار است

**حالا کاربران نه تنها می‌بینند که امتیازشان چقدر است، بلکه دقیقاً می‌فهمند چرا!**
