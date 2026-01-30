# مهندسی پرامپت کامل - راهنمای جامع

## هدف
به عنوان یک مهندس پرامپت حرفه‌ای، ما باید:
1. ✅ Schema دقیق JSON را در انتهای هر prompt تعریف کنیم
2. ✅ مدل را مجبور کنیم دقیقاً همان ساختار را برگرداند
3. ✅ UI را طوری بنویسیم که اگر فیلدی کم یا زیاد بود، crash نکند
4. ✅ برای فیلدهای missing، `*` نمایش دهیم

## تغییرات اعمال شده

### Stage 1: ✅ Schema اضافه شد

**مکان**: `app/api/analyze-pitch/route.ts` - خط ~110

**تغییر**: به انتهای system prompt اضافه شد:

```typescript
CRITICAL: You MUST return EXACTLY this JSON structure. Do NOT add or remove fields.

EXACT JSON SCHEMA YOU MUST FOLLOW:
{
  "ideaQuality": {
    "score": <number 0-10>,
    "reasoning": {
      "scoreBreakdown": {
        "problemSignificance": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        ...
      },
      "calculationMethod": "<string: show formula>",
      "whyNotHigher": "<string>",
      "whyNotLower": "<string>",
      "comparableIdeas": ["<string>"]
    },
    "fundamentalStrength": "<string>"
  },
  ...
}
```

### Stage 2: Schema باید اضافه شود

**مکان**: `app/api/analyze-pitch/route.ts` - خط ~240

**باید اضافه شود**:

```typescript
CRITICAL: You MUST return EXACTLY this JSON structure.

EXACT JSON SCHEMA:
{
  "scorecard": {
    "problemValidityUrgency": {
      "score": <number 1-10>,
      "reasoning": {
        "evidenceFromStage1": ["<string>"],
        "calculationMethod": "<string>",
        "scoreJustification": "<string>",
        "impactOnInvestability": "<string>"
      }
    },
    // ... 7 more dimensions with same structure
  },
  "gapDiagnosis": {
    "biggestValueGap": {
      "issue": "<string>",
      "currentImpact": "<string>",
      "reasoning": {
        "whyThisIsWorst": "<string>",
        "evidenceOfImpact": "<string>",
        "cascadingEffects": "<string>"
      }
    },
    "fastestCredibilityWin": { /* same structure */ },
    "dangerousIllusions": [
      {
        "illusion": "<string>",
        "reality": "<string>",
        "reasoning": { /* ... */ }
      }
    ]
  },
  "prioritizedChecklist": {
    "high": [
      {
        "item": "<string>",
        "investorConcern": "<string>",
        "expectedImpact": "<string>",
        "reasoning": {
          "whyHighPriority": "<string>",
          "evidenceOfNeed": ["<string>"],
          "successCriteria": "<string>",
          "estimatedEffort": "<string>"
        }
      }
    ],
    "medium": [ /* same structure */ ],
    "low": [ /* same structure */ ]
  },
  "decisionLogic": {
    "decision": "pass|maybe|proceed",
    "reasoning": { /* ... */ },
    "conditions": {
      "forPass": ["<string>"],
      "forMaybe": ["<string>"],
      "forProceed": ["<string>"]
    }
  },
  "improvementPotential": {
    "current": <number>,
    "target": <number>,
    "ceiling": <number>,
    "confidence": "low|medium|high",
    "reasoning": { /* ... */ }
  }
}
```

### Stage 3: Schema باید اضافه شود

**مکان**: `app/api/analyze-pitch/route.ts` - خط ~380

**باید اضافه شود**:

```typescript
CRITICAL: You MUST return EXACTLY this JSON structure.

EXACT JSON SCHEMA:
{
  "consistency_test": {
    "score": <number 0-10>,
    "critical_issue": "<string or null>",
    "reasoning": {
      "scoringCriteria": "<string>",
      "evidenceChecked": ["<string>"],
      "contradictionsFound": ["<string>"],
      "alignmentAnalysis": "<string>",
      "scoreCalculation": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
  // ... 5 more tests with same structure
  "final_readiness_score": {
    "testScores": {
      "consistency": <number>,
      "assumptionStress": <number>,
      "objectionCoverage": <number>,
      "clarityUnderPressure": <number>,
      "marketBelievability": <number>,
      "storyCoherence": <number>
    },
    "scoringMethodology": {
      "weightingScheme": {
        "consistency": "20%",
        "assumptionStress": "20%",
        "objectionCoverage": "15%",
        "clarityUnderPressure": "15%",
        "marketBelievability": "15%",
        "storyCoherence": "15%"
      },
      "aggregationFormula": "<string>",
      "penaltyApplication": "<string>",
      "calibrationBenchmarks": ["<string>"]
    },
    "score_0_to_100": <number>,
    "readiness_band": "reject|weak|review|human_review_ready",
    "bandReasoning": { /* ... */ }
  },
  "investor_gate_verdict": {
    "pass_human_review": <boolean>,
    "confidence_level": "low|medium|high",
    "main_blocking_reason": "<string or null>",
    "verdictReasoning": {
      "decisionLogic": { /* ... */ },
      "confidenceAnalysis": { /* ... */ },
      "alternativeOutcomes": { /* ... */ },
      "investorTimeValue": { /* ... */ }
    }
  }
}
```

## UI Changes: Safe Display Pattern

### Pattern 1: Optional Chaining همیشه
```typescript
// ❌ BAD - می‌تواند crash کند
const score = stage1.ideaQuality.score

// ✅ GOOD - هیچ‌وقت crash نمی‌کند
const score = stage1?.ideaQuality?.score ?? '*'
```

### Pattern 2: Type Checking
```typescript
// ✅ GOOD - هر دو نوع را handle می‌کند
{typeof reasoning === 'object' ? (
  <ReasoningDisplay reasoning={reasoning} />
) : (
  <p>{reasoning || '*'}</p>
)}
```

### Pattern 3: Array Safety
```typescript
// ✅ GOOD - اگر array نبود یا خالی بود، * نمایش می‌دهد
{Array.isArray(items) && items.length > 0 ? (
  items.map((item, i) => <li key={i}>{item}</li>)
) : (
  <span>*</span>
)}
```

### Pattern 4: Nested Object Safety
```typescript
// ✅ GOOD - تمام سطوح را check می‌کند
{stage3?.investor_gate_verdict?.verdictReasoning?.decisionLogic ? (
  <ReasoningDisplay reasoning={stage3.investor_gate_verdict.verdictReasoning} />
) : (
  <span>*</span>
)}
```

## Component Updates Needed

### 1. PerfectPitchResult.tsx

**تغییرات لازم**:

```typescript
// در هر جایی که field را نمایش می‌دهیم:

// قبل:
<p>{stage1.ideaQuality.score}/10</p>

// بعد:
<p>{stage1?.ideaQuality?.score ?? '*'}/10</p>

// قبل:
{stage1.investorSignals.positive.map(signal => ...)}

// بعد:
{Array.isArray(stage1?.investorSignals?.positive) && stage1.investorSignals.positive.length > 0 ? (
  stage1.investorSignals.positive.map(signal => ...)
) : (
  <span>*</span>
)}
```

### 2. ReasoningDisplay.tsx

**تغییرات لازم**:

```typescript
// در ابتدای component:
if (!reasoning) {
  return <span>*</span>
}

if (typeof reasoning === 'string') {
  return <p>{reasoning || '*'}</p>
}

// برای هر field:
{reasoning.scoreBreakdown ? (
  <ScoreBreakdownSection data={reasoning.scoreBreakdown} />
) : (
  <span>*</span>
)}
```

### 3. SafeJsonDisplay.tsx

**این component قبلاً safe است** ✅

## Testing Checklist

### Test 1: با Response کامل
- [ ] تمام فیلدها نمایش داده می‌شوند
- [ ] هیچ `*` نمایش داده نمی‌شود
- [ ] Reasoning objects به درستی expand می‌شوند

### Test 2: با Response ناقص
- [ ] فیلدهای missing به صورت `*` نمایش داده می‌شوند
- [ ] UI crash نمی‌کند
- [ ] Console error ندارد

### Test 3: با Response خالی
- [ ] همه جا `*` نمایش داده می‌شود
- [ ] UI crash نمی‌کند
- [ ] پیام مناسب نمایش داده می‌شود

### Test 4: با Response نامعتبر
- [ ] Error handling کار می‌کند
- [ ] Fallback structure استفاده می‌شود
- [ ] کاربر می‌تواند retry کند

## Implementation Steps

### مرحله 1: ✅ Stage 1 Schema اضافه شد
- فایل: `app/api/analyze-pitch/route.ts`
- خط: ~110
- وضعیت: کامل

### مرحله 2: ⏳ Stage 2 Schema باید اضافه شود
- فایل: `app/api/analyze-pitch/route.ts`
- خط: ~240
- وضعیت: نیاز به اضافه کردن

### مرحله 3: ⏳ Stage 3 Schema باید اضافه شود
- فایل: `app/api/analyze-pitch/route.ts`
- خط: ~380
- وضعیت: نیاز به اضافه کردن

### مرحله 4: ⏳ همین کار برای perfect-pitch
- فایل: `app/api/perfect-pitch/route.ts`
- هر 3 stage
- وضعیت: نیاز به اضافه کردن

### مرحله 5: ⏳ UI Components را safe کنیم
- فایل: `components/PerfectPitchResult.tsx`
- تمام field access ها
- وضعیت: نیاز به بررسی و تغییر

### مرحله 6: ⏳ ReasoningDisplay را safe کنیم
- فایل: `components/ReasoningDisplay.tsx`
- تمام field access ها
- وضعیت: نیاز به بررسی و تغییر

## Best Practices

### 1. در Prompts
```
✅ DO: "You MUST return EXACTLY this JSON structure"
✅ DO: "Do NOT add or remove fields"
✅ DO: "Follow the EXACT schema above"
❌ DON'T: "Return a JSON object" (خیلی کلی است)
```

### 2. در TypeScript
```typescript
✅ DO: stage1?.ideaQuality?.score ?? '*'
✅ DO: Array.isArray(items) && items.length > 0
✅ DO: typeof reasoning === 'object'
❌ DON'T: stage1.ideaQuality.score (می‌تواند crash کند)
```

### 3. در UI
```typescript
✅ DO: {field ? <Display /> : <span>*</span>}
✅ DO: {field || '*'}
❌ DON'T: {field} (اگر undefined بود، error می‌دهد)
```

## مزایای این رویکرد

### 1. Robustness (استحکام)
- UI هیچ‌وقت crash نمی‌کند
- Missing fields به صورت `*` نمایش داده می‌شوند
- کاربر می‌تواند ادامه دهد

### 2. Debugging
- می‌دانیم کدام field missing است (با دیدن `*`)
- می‌توانیم prompt را بهبود دهیم
- می‌توانیم مشکل را سریع پیدا کنیم

### 3. Maintainability (نگهداری)
- Schema در یک جا تعریف شده
- تغییرات آسان است
- همه می‌دانند ساختار چیست

### 4. User Experience
- UI همیشه کار می‌کند
- پیام‌های خطا واضح است
- کاربر می‌تواند retry کند

## وضعیت فعلی

- ✅ Stage 1 Schema اضافه شد
- ✅ JSON parse error handling اضافه شد
- ✅ max_tokens افزایش یافت
- ✅ SafeJsonDisplay component آماده است
- ⏳ Stage 2 & 3 Schema نیاز به اضافه شدن دارد
- ⏳ UI components نیاز به safe شدن دارند

## مرحله بعدی

1. اضافه کردن Schema به Stage 2 & 3
2. Safe کردن تمام UI components
3. تست با pitch deck واقعی
4. بررسی و fix کردن missing fields

---

**تاریخ**: 2026-01-30  
**نویسنده**: مهندس پرامپت تیم  
**وضعیت**: در حال پیاده‌سازی ⏳
