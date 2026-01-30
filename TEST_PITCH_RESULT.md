# تست کامپوننت PitchAnalysisResult

## مسیر تست
برای مشاهده کامپوننت با داده‌های واقعی، به آدرس زیر بروید:

```
http://localhost:3000/test-pitch-result
```

## ساختار داده‌های ورودی

کامپوننت `PitchAnalysisResult` انتظار دارد یک object با ساختار زیر دریافت کند:

```typescript
{
  stage1: {
    startupReconstruction: { problem, solution, customer, market, businessModel }
    ideaQuality: { score, reasoning, fundamentalStrength }
    pitchQuality: { score, reasoning, presentationEffectiveness }
    investorSignals: { positive[], negative[], critical[] }
    patternMatching: { similarSuccesses[], similarFailures[], uniqueAspects[] }
    investmentReadiness: { stage, readiness, gapToFundable }
    rawVerdict: { decision, confidence, keyReason }
  }
  stage2: {
    scorecard: { [key: string]: { score, reasoning } }
    gapDiagnosis: { biggestGap, fastestWin, dangerousIllusions }
    prioritizedChecklist: { high[], medium[], low[] }
    decisionLogic: { decision, reasoning, conditions }
    improvementPotential: { current, target, ceiling, confidence }
  }
  stage3: {
    consistency_test: { score, critical_issue }
    assumption_stress_test: { score, fatal_dependency }
    objection_coverage_test: { score, missed_high_impact_item }
    clarity_under_pressure_test: { score, 30s_takeaway }
    market_believability_test: { score, unconvincing_claim }
    story_coherence_test: { score, flow_break_point }
    final_readiness_scoring: { overall_readiness, readiness_band, critical_issue_penalties }
    investor_gate_verdict: { pass_human_review, confidence_level, main_blocking_reason }
  }
  metadata: {
    analyzedAt: string (ISO date)
    pitchDeckLength: number
    processingTimeMs: number
  }
}
```

## ویژگی‌های کلیدی

1. **Safe Display**: تمام فیلدها با تابع `display()` محافظت شده‌اند - اگر مقدار null یا undefined باشد، "-" نمایش می‌دهد

2. **4 تب اصلی**:
   - Stage 1: تحلیل اولیه
   - Stage 2: Scorecard و Gap Analysis
   - Stage 3: تست‌های نهایی و Verdict
   - Metadata: اطلاعات تحلیل

3. **رنگ‌بندی معنادار**:
   - سبز: مثبت/موفق
   - قرمز: منفی/مشکل
   - زرد: هشدار
   - آبی: اطلاعات

## نکات مهم برای توسعه‌دهندگان

- همیشه از تابع `display()` برای نمایش مقادیر استفاده کنید
- برای آرایه‌ها، همیشه بررسی کنید که آیا وجود دارند و length > 0 هستند
- برای object ها، از optional chaining (`?.`) استفاده کنید
- console.log در کامپوننت فعال است برای debug

## مثال استفاده در API

```typescript
// در route.ts
const analysis = await analyzePitch(transcript)
return NextResponse.json(analysis)

// در component
<PitchAnalysisResult
  analysis={analysis}
  transcript={transcript}
  onStartQnA={() => {}}
  onReset={() => {}}
/>
```
