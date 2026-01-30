# Implementation Plan: Enhanced Deep Analysis Prompts

## خلاصه تغییرات مورد نیاز

### مشکل فعلی:
خروجی JSON که نشون دادی خیلی کلی و سطحی است:
- "The market is decent but not huge" → مبهم
- "Unclear due to lack of detailed financial metrics" → بدون جزئیات
- "Limited evidence of customer learning" → بدون شواهد مشخص

### راه‌حل:
پرامپت‌ها رو طوری بازنویسی کنیم که الزام کنن:
1. **شماره اسلاید دقیق** برای هر ادعا
2. **محاسبات ریاضی** برای هر امتیاز
3. **نام شرکت‌های واقعی** برای مقایسه
4. **اعداد دقیق** به جای توصیفات کلی
5. **severity levels** برای هر ریسک

## تغییرات در ساختار JSON Output

### قبل (کلی):
```json
{
  "buzzwords": ["smart assistant", "transform", "seamless integration"],
  "unsupportedClaims": ["eliminates the need for 'Prompt Engineering' knowledge"]
}
```

### بعد (مشخص):
```json
{
  "buzzwords": [
    {
      "term": "seamless integration",
      "slideNumber": 5,
      "context": "Our tool provides seamless integration with all major LLMs",
      "redFlag": "No technical details on how integration works",
      "realityCheck": "Likely means they have API wrappers, not deep integration",
      "severity": "medium"
    }
  ],
  "unsupportedClaims": [
    {
      "claim": "eliminates the need for 'Prompt Engineering' knowledge",
      "slideNumber": 3,
      "whyUnsupported": "No A/B test data, no user studies, no before/after metrics",
      "whatWouldProveIt": "Controlled study showing non-experts get same results as experts",
      "investorSkepticism": "This is the core value prop but has zero validation",
      "severity": "fatal"
    }
  ]
}
```

## Implementation Strategy

### Option 1: تغییر Types (پیچیده)
- نیاز به تغییر `lib/perfectPitchTypes.ts`
- نیاز به تغییر UI components
- زمان‌بر و ریسک بالا

### Option 2: استفاده از فیلدهای موجود (ساده‌تر) ✅
- پرامپت رو طوری بنویسیم که خروجی رو در فرمت فعلی اما با جزئیات بیشتر بده
- مثلاً به جای:
  ```json
  "buzzwords": ["smart assistant"]
  ```
  بنویسه:
  ```json
  "buzzwords": ["'smart assistant' (slide 2) - vague term, no definition. Reality: probably just a chatbot wrapper. Severity: medium"]
  ```

### Option 3: ترکیبی (بهترین) ✅
- Types فعلی رو نگه میداریم
- اما پرامپت رو طوری می‌نویسیم که توی فیلدهای `reasoning` جزئیات کامل رو بذاره
- مثلاً:
  ```json
  {
    "ideaQuality": {
      "score": 6.5,
      "reasoning": "CALCULATION: (problemSignificance:8 × 0.30) + (solutionNovelty:5 × 0.25) + (marketTiming:7 × 0.25) + (scalePotential:6 × 0.20) = 6.45 ≈ 6.5/10\n\nEVIDENCE:\n- Problem: Slide 4 claims $2B waste, Gartner 2023 report\n- Solution: Slide 8 shows AI tracking, similar to Zylo and Torii\n- Timing: Slide 3 shows remote work growth 2020-2024\n- Scale: Slide 12 shows sales-led GTM, CAC $15K (slide 14)\n\nWHY NOT 8/10: Would need (1) defensible moat - none shown, (2) PMF evidence - only 50 paying users\n\nWHY NOT 4/10: (1) Problem is real - validated by Gartner, (2) Timing is excellent - remote work trend\n\nCOMPARABLES:\n- Zylo (similar): Raised $30M Series B, 500+ customers\n- Slack (better): Had viral growth, this needs sales team",
      "fundamentalStrength": "Strong validated problem ($2B waste per Gartner) in growing market (remote work), but solution lacks differentiation vs Zylo/Torii and no moat"
    }
  }
  ```

## Recommended Approach

من پیشنهاد میدم **Option 3** رو پیاده کنیم:

### مزایا:
1. ✅ هیچ breaking change نداره
2. ✅ UI فعلی کار میکنه
3. ✅ Types تغییر نمیکنه
4. ✅ فقط پرامپت‌ها رو تغییر میدیم
5. ✅ خروجی خیلی بهتر و مفصل‌تر میشه

### معایب:
1. ❌ reasoning ها ممکنه خیلی طولانی بشن
2. ❌ token usage بیشتر میشه
3. ❌ UI باید scroll کنه برای خوندن

### تغییرات مورد نیاز:

#### 1. Stage 1 Prompt Enhancement
```typescript
const systemPrompt = `You are a senior VC partner with 15+ years evaluating 1000+ decks.

CRITICAL RULES - NO EXCEPTIONS:
1. NEVER use vague language like "decent", "good", "moderate"
2. ALWAYS cite specific slide numbers and exact quotes
3. ALWAYS show mathematical calculations for every score
4. ALWAYS compare to specific real companies (name them)
5. ALWAYS identify what's NOT in the deck

For EVERY field in your JSON output:
- If it's a list of strings, make each string DETAILED with slide numbers
- If it's a score, include full calculation in reasoning field
- If it's an assessment, cite specific evidence

EXAMPLE OF GOOD OUTPUT:
{
  "buzzwords": [
    "'seamless integration' (slide 5, quote: 'Our tool provides seamless integration...') - RED FLAG: No technical details on HOW integration works. REALITY: Likely just API wrappers, not deep integration. SEVERITY: medium - investors will ask for technical details",
    "'transform' (slide 2) - Used 3 times without specifics. REALITY: Vague marketing language. SEVERITY: low - common but weakens credibility"
  ],
  "unsupportedClaims": [
    "'eliminates need for Prompt Engineering knowledge' (slide 3) - UNSUPPORTED BECAUSE: (1) No A/B test data, (2) No user studies, (3) No before/after metrics. WOULD NEED: Controlled study showing non-experts get same results as experts. INVESTOR SKEPTICISM: This is core value prop but has ZERO validation. SEVERITY: FATAL"
  ],
  "actualProblem": "Users struggle creating effective prompts (slide 2). EVIDENCE: (1) Survey of 200 users showing 73% dissatisfaction (slide 4), (2) 15 customer interviews (slide 5). PROBLEM SEVERITY: Urgency=7/10 (daily pain), Frequency=9/10 (every AI interaction), Cost=6/10 ($2-3hrs/week wasted per slide 6) = (7+9+6)/3 = 7.3/10. VALIDATION QUALITY: Moderate - survey is good but sample size small, interviews are qualitative only",
  "ideaQuality": {
    "score": 6.5,
    "reasoning": "CALCULATION: (problemSignificance:8 × 0.30) + (solutionNovelty:5 × 0.25) + (marketTiming:7 × 0.25) + (scalePotential:6 × 0.20) = 6.45 ≈ 6.5/10\n\nBREAKDOWN:\n• Problem Significance: 8/10 - Slide 4 shows $2B annual waste (Gartner 2023), 1.5B GenAI users (slide 3). Real and large.\n• Solution Novelty: 5/10 - Slide 8 shows AI-powered prompt optimization. SIMILAR TO: Zylo, Torii (SaaS management). DIFFERENT: Focus on prompts not SaaS. ADVANTAGE: Unclear - no moat shown.\n• Market Timing: 7/10 - Slide 3 shows GenAI adoption curve, remote work growth. WHY NOW: AI tools mainstream since ChatGPT Nov 2022. Window: 2-3 years before commoditized.\n• Scale Potential: 6/10 - Slide 12 shows sales-led GTM, CAC $15K (slide 14), LTV $60K (slide 14) = 4x ratio (good). BUT: Requires sales team, limits scale speed.\n\nWHY NOT 8/10: Would need (1) Defensible moat - none shown, (2) PMF evidence - only 50 paying users (slide 8), 5% conversion\n\nWHY NOT 4/10: (1) Problem is real - Gartner validated, (2) Timing excellent - AI adoption curve\n\nCOMPARABLES:\n• Zylo (similar): $30M Series B, 500+ customers, sales-led\n• Slack (better model): Viral growth, no sales team needed\n• This is more like Zylo (sales-led) than Slack (viral)",
    "fundamentalStrength": "Strong validated problem ($2B waste per Gartner slide 4) in rapidly growing market (1.5B users slide 3), BUT solution lacks clear differentiation vs existing tools (Zylo/Torii) and no defensible moat shown. Team has AI experience (slide 15) but no domain expertise in prompt engineering."
  }
}

Apply this level of detail to EVERY field in your output.
Return complete JSON matching the Stage1Output schema.`
```

#### 2. Stage 2 Prompt Enhancement
مشابه Stage 1 اما با تمرکز بر:
- محاسبات دقیق برای هر dimension
- evidence mapping به Stage 1
- impact quantification با اعداد

#### 3. Stage 3 Prompt Enhancement
مشابه اما با تمرکز بر:
- test scoring methodology با فرمول
- evidence trail با slide numbers
- comparative analysis با benchmarks

## Next Steps

1. ✅ این سند رو بخون و تأیید کن
2. ⏳ پرامپت‌های Stage 1, 2, 3 رو بازنویسی کنم
3. ⏳ در `app/api/analyze-pitch/route.ts` اعمال کنم
4. ⏳ در `app/api/perfect-pitch/route.ts` اعمال کنم
5. ⏳ تست با pitch deck واقعی
6. ⏳ بررسی کیفیت خروجی

## تأیید می‌کنی این approach رو پیاده کنم؟
