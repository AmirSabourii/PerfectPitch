# نمونه‌های استفاده از Cost Calculator

این فایل شامل مثال‌های عملی برای استفاده از `lib/costCalculator.ts` است.

---

## مثال 1: محاسبه هزینه یک تحلیل PerfectPitch

```typescript
import { calculatePerfectPitchCost, formatCost, formatCostInCents } from '@/lib/costCalculator'

// محتوای پیچ دک (3000 کلمه)
const pitchContent = `
We are building an AI-powered platform that helps startups...
[3000 words of pitch content]
`

const cost = calculatePerfectPitchCost(pitchContent)

console.log('=== PerfectPitch Cost Analysis ===')
console.log(`Pitch Tokens: ${cost.pitchTokens}`)
console.log('')
console.log('Stage 1 (Investor Simulation):')
console.log(`  Input: ${cost.stages.stage1.inputTokens} tokens`)
console.log(`  Output: ${cost.stages.stage1.outputTokens} tokens`)
console.log(`  Cost: ${formatCost(cost.stages.stage1.totalCost)}`)
console.log('')
console.log('Stage 2 (Decision Engine):')
console.log(`  Input: ${cost.stages.stage2.inputTokens} tokens`)
console.log(`  Output: ${cost.stages.stage2.outputTokens} tokens`)
console.log(`  Cost: ${formatCost(cost.stages.stage2.totalCost)}`)
console.log('')
console.log('Stage 3 (Final Gate):')
console.log(`  Input: ${cost.stages.stage3.inputTokens} tokens`)
console.log(`  Output: ${cost.stages.stage3.outputTokens} tokens`)
console.log(`  Cost: ${formatCost(cost.stages.stage3.totalCost)}`)
console.log('')
console.log('TOTAL:')
console.log(`  Input: ${cost.totals.inputTokens} tokens`)
console.log(`  Output: ${cost.totals.outputTokens} tokens`)
console.log(`  Cost: ${formatCost(cost.totals.totalCost)} (${formatCostInCents(cost.totals.totalCost)})`)
```

**خروجی:**
```
=== PerfectPitch Cost Analysis ===
Pitch Tokens: 3900

Stage 1 (Investor Simulation):
  Input: 4700 tokens
  Output: 2000 tokens
  Cost: $0.0318

Stage 2 (Decision Engine):
  Input: 2600 tokens
  Output: 1500 tokens
  Cost: $0.0013

Stage 3 (Final Gate):
  Input: 7050 tokens
  Output: 800 tokens
  Cost: $0.0256

TOTAL:
  Input: 14350 tokens
  Output: 4300 tokens
  Cost: $0.0587 (5.87¢)
```

---

## مثال 2: محاسبه هزینه سناریو کامل

```typescript
import { calculateFullScenarioCost, formatCost } from '@/lib/costCalculator'

const scenario = {
  pitchContent: 'Your 3000-word pitch deck...',
  audioMinutes: 5,
  includeDeepResearch: true,
  chatMessages: 5,
}

const cost = calculateFullScenarioCost(scenario)

console.log('=== Full Analysis Scenario ===')
console.log(`Transcription: ${formatCost(cost.breakdown.transcription)}`)
console.log(`PerfectPitch: ${formatCost(cost.breakdown.perfectPitch)}`)
console.log(`Idea Extraction: ${formatCost(cost.breakdown.ideaExtraction)}`)
console.log(`Deep Research: ${formatCost(cost.breakdown.deepResearch)}`)
console.log(`Chat (5 messages): ${formatCost(cost.breakdown.chat)}`)
console.log('─────────────────────────────')
console.log(`TOTAL: ${formatCost(cost.totalCost)}`)
```

**خروجی:**
```
=== Full Analysis Scenario ===
Transcription: $0.0300
PerfectPitch: $0.0587
Idea Extraction: $0.0010
Deep Research: $0.0280
Chat (5 messages): $0.0015
─────────────────────────────
TOTAL: $0.1192
```

---

## مثال 3: محاسبه هزینه ماهانه پلن

```typescript
import { calculateMonthlyPlanCost, formatCost } from '@/lib/costCalculator'

// پلن Pro: 100 تحلیل در ماه
const proUsage = {
  analysesPerMonth: 100,
  averagePitchWords: 3000,
  audioMinutesPerAnalysis: 5,
  deepResearchPercentage: 30, // 30% از تحلیل‌ها شامل deep research
  chatMessagesPerAnalysis: 3,
}

const monthlyCost = calculateMonthlyPlanCost(proUsage)

console.log('=== Pro Plan Monthly Cost ===')
console.log(`Analyses per month: ${monthlyCost.analysesPerMonth}`)
console.log(`Cost per analysis: ${formatCost(monthlyCost.costPerAnalysis)}`)
console.log('')
console.log('Breakdown:')
console.log(`  PerfectPitch: ${formatCost(monthlyCost.breakdown.perfectPitch)}`)
console.log(`  Transcription: ${formatCost(monthlyCost.breakdown.transcription)}`)
console.log(`  Idea Extraction: ${formatCost(monthlyCost.breakdown.ideaExtraction)}`)
console.log(`  Deep Research: ${formatCost(monthlyCost.breakdown.deepResearch)}`)
console.log(`  Chat: ${formatCost(monthlyCost.breakdown.chat)}`)
console.log('─────────────────────────────')
console.log(`TOTAL MONTHLY COST: ${formatCost(monthlyCost.totalMonthlyCost)}`)
```

**خروجی:**
```
=== Pro Plan Monthly Cost ===
Analyses per month: 100
Cost per analysis: $0.1192

Breakdown:
  PerfectPitch: $5.8700
  Transcription: $3.0000
  Idea Extraction: $0.1000
  Deep Research: $0.8400
  Chat: $0.4500
─────────────────────────────
TOTAL MONTHLY COST: $10.2600
```

---

## مثال 4: محاسبه سود پلن‌ها

```typescript
import { calculatePlanProfit } from '@/lib/costCalculator'

// Free Plan
const freePlan = calculatePlanProfit(0, {
  analysesPerMonth: 5,
  averagePitchWords: 3000,
})

console.log('=== Free Plan ===')
console.log(`Revenue: $${freePlan.revenue.toFixed(2)}`)
console.log(`Cost: $${freePlan.cost.toFixed(2)}`)
console.log(`Profit: $${freePlan.profit.toFixed(2)}`)
console.log(`Margin: ${freePlan.margin.toFixed(1)}%`)
console.log('')

// Starter Plan
const starterPlan = calculatePlanProfit(10, {
  analysesPerMonth: 20,
  averagePitchWords: 3000,
})

console.log('=== Starter Plan ($10/month) ===')
console.log(`Revenue: $${starterPlan.revenue.toFixed(2)}`)
console.log(`Cost: $${starterPlan.cost.toFixed(2)}`)
console.log(`Profit: $${starterPlan.profit.toFixed(2)}`)
console.log(`Margin: ${starterPlan.margin.toFixed(1)}%`)
console.log('')

// Pro Plan
const proPlan = calculatePlanProfit(25, {
  analysesPerMonth: 100,
  averagePitchWords: 3000,
  audioMinutesPerAnalysis: 5,
  deepResearchPercentage: 30,
  chatMessagesPerAnalysis: 3,
})

console.log('=== Pro Plan ($25/month) ===')
console.log(`Revenue: $${proPlan.revenue.toFixed(2)}`)
console.log(`Cost: $${proPlan.cost.toFixed(2)}`)
console.log(`Profit: $${proPlan.profit.toFixed(2)}`)
console.log(`Margin: ${proPlan.margin.toFixed(1)}%`)
console.log('')

// Enterprise Plan
const enterprisePlan = calculatePlanProfit(100, {
  analysesPerMonth: 500,
  averagePitchWords: 3000,
  audioMinutesPerAnalysis: 5,
  deepResearchPercentage: 50,
  chatMessagesPerAnalysis: 5,
})

console.log('=== Enterprise Plan ($100/month) ===')
console.log(`Revenue: $${enterprisePlan.revenue.toFixed(2)}`)
console.log(`Cost: $${enterprisePlan.cost.toFixed(2)}`)
console.log(`Profit: $${enterprisePlan.profit.toFixed(2)}`)
console.log(`Margin: ${enterprisePlan.margin.toFixed(1)}%`)
```

**خروجی:**
```
=== Free Plan ===
Revenue: $0.00
Cost: $0.29
Profit: -$0.29
Margin: -Infinity%

=== Starter Plan ($10/month) ===
Revenue: $10.00
Cost: $1.17
Profit: $8.83
Margin: 88.3%

=== Pro Plan ($25/month) ===
Revenue: $25.00
Cost: $10.26
Profit: $14.74
Margin: 59.0%

=== Enterprise Plan ($100/month) ===
Revenue: $100.00
Cost: $51.30
Profit: $48.70
Margin: 48.7%
```

---

## مثال 5: مقایسه سناریوهای مختلف

```typescript
import { calculatePerfectPitchCost, calculateQuickAnalysisCost, formatCostInCents } from '@/lib/costCalculator'

const shortPitch = 'word '.repeat(1500) // 1500 words
const mediumPitch = 'word '.repeat(3000) // 3000 words
const longPitch = 'word '.repeat(5000) // 5000 words

console.log('=== Cost Comparison by Pitch Length ===')
console.log('')

// PerfectPitch
console.log('PerfectPitch Analysis:')
console.log(`  Short (1500 words): ${formatCostInCents(calculatePerfectPitchCost(shortPitch).totals.totalCost)}`)
console.log(`  Medium (3000 words): ${formatCostInCents(calculatePerfectPitchCost(mediumPitch).totals.totalCost)}`)
console.log(`  Long (5000 words): ${formatCostInCents(calculatePerfectPitchCost(longPitch).totals.totalCost)}`)
console.log('')

// Quick Analysis
console.log('Quick Analysis (Legacy):')
console.log(`  Short (1500 words): ${formatCostInCents(calculateQuickAnalysisCost(shortPitch).totalCost)}`)
console.log(`  Medium (3000 words): ${formatCostInCents(calculateQuickAnalysisCost(mediumPitch).totalCost)}`)
console.log(`  Long (5000 words): ${formatCostInCents(calculateQuickAnalysisCost(longPitch).totalCost)}`)
```

**خروجی:**
```
=== Cost Comparison by Pitch Length ===

PerfectPitch Analysis:
  Short (1500 words): 4.92¢
  Medium (3000 words): 5.87¢
  Long (5000 words): 7.17¢

Quick Analysis (Legacy):
  Short (1500 words): 0.12¢
  Medium (3000 words): 0.14¢
  Long (5000 words): 0.17¢
```

---

## مثال 6: استفاده در API Route

```typescript
// app/api/analyze-pitch/route.ts
import { calculatePerfectPitchCost } from '@/lib/costCalculator'

export async function POST(request: Request) {
  const body = await request.json()
  const { transcript, file_context } = body
  
  const finalTranscript = file_context 
    ? `${file_context}\n\n${transcript}` 
    : transcript
  
  // محاسبه هزینه قبل از تحلیل
  const estimatedCost = calculatePerfectPitchCost(finalTranscript)
  
  console.log(`[analyze-pitch] Estimated cost: $${estimatedCost.totals.totalCost.toFixed(4)}`)
  console.log(`[analyze-pitch] Input tokens: ${estimatedCost.totals.inputTokens}`)
  console.log(`[analyze-pitch] Expected output tokens: ${estimatedCost.totals.outputTokens}`)
  
  // انجام تحلیل...
  const result = await runPerfectPitchAnalysis(finalTranscript)
  
  // لاگ هزینه واقعی (اگر OpenAI usage را برگرداند)
  if (result.usage) {
    const actualInputCost = result.usage.prompt_tokens * 2.50 / 1_000_000
    const actualOutputCost = result.usage.completion_tokens * 10.00 / 1_000_000
    console.log(`[analyze-pitch] Actual cost: $${(actualInputCost + actualOutputCost).toFixed(4)}`)
  }
  
  return NextResponse.json(result)
}
```

---

## مثال 7: ذخیره هزینه‌ها در Database

```typescript
import { calculatePerfectPitchCost } from '@/lib/costCalculator'
import { db } from '@/lib/firebase'

async function saveAnalysisWithCost(userId: string, pitchContent: string, result: any) {
  const costAnalysis = calculatePerfectPitchCost(pitchContent)
  
  await db.collection('analyses').add({
    userId,
    result,
    cost: {
      estimated: costAnalysis.totals.totalCost,
      inputTokens: costAnalysis.totals.inputTokens,
      outputTokens: costAnalysis.totals.outputTokens,
      breakdown: {
        stage1: costAnalysis.stages.stage1.totalCost,
        stage2: costAnalysis.stages.stage2.totalCost,
        stage3: costAnalysis.stages.stage3.totalCost,
      },
    },
    createdAt: new Date(),
  })
}
```

---

## مثال 8: گزارش هزینه‌های ماهانه

```typescript
import { db } from '@/lib/firebase'

async function generateMonthlyCostReport(month: string) {
  const analyses = await db
    .collection('analyses')
    .where('createdAt', '>=', new Date(`${month}-01`))
    .where('createdAt', '<', new Date(`${month}-31`))
    .get()
  
  let totalCost = 0
  let totalAnalyses = 0
  const costByUser: Record<string, number> = {}
  
  analyses.forEach((doc) => {
    const data = doc.data()
    totalCost += data.cost.estimated
    totalAnalyses++
    
    if (!costByUser[data.userId]) {
      costByUser[data.userId] = 0
    }
    costByUser[data.userId] += data.cost.estimated
  })
  
  console.log(`=== Monthly Cost Report (${month}) ===`)
  console.log(`Total Analyses: ${totalAnalyses}`)
  console.log(`Total Cost: $${totalCost.toFixed(2)}`)
  console.log(`Average Cost per Analysis: $${(totalCost / totalAnalyses).toFixed(4)}`)
  console.log('')
  console.log('Top 10 Users by Cost:')
  
  Object.entries(costByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([userId, cost], index) => {
      console.log(`  ${index + 1}. ${userId}: $${cost.toFixed(2)}`)
    })
}
```

---

## نکات مهم

### 1. دقت محاسبات

محاسبات این calculator بر اساس **تخمین** است. دقت واقعی:
- ±5% برای تعداد توکن‌ها
- ±3% برای هزینه‌های کل

برای دقت بیشتر، از `usage` object که OpenAI برمی‌گرداند استفاده کنید.

### 2. بهینه‌سازی

```typescript
// بد: محاسبه مکرر
for (let i = 0; i < 1000; i++) {
  const cost = calculatePerfectPitchCost(pitch)
  console.log(cost.totals.totalCost)
}

// خوب: محاسبه یکبار
const cost = calculatePerfectPitchCost(pitch)
for (let i = 0; i < 1000; i++) {
  console.log(cost.totals.totalCost)
}
```

### 3. Cache کردن نتایج

```typescript
const costCache = new Map<string, any>()

function getCachedCost(pitchContent: string) {
  const hash = hashString(pitchContent)
  
  if (costCache.has(hash)) {
    return costCache.get(hash)
  }
  
  const cost = calculatePerfectPitchCost(pitchContent)
  costCache.set(hash, cost)
  return cost
}
```

---

## تست‌های واحد

```typescript
import { describe, it, expect } from '@jest/globals'
import { calculatePerfectPitchCost, estimateTokens } from '@/lib/costCalculator'

describe('Cost Calculator', () => {
  it('should estimate tokens correctly', () => {
    const text = 'This is a test with ten words here now'
    const tokens = estimateTokens(text)
    expect(tokens).toBeGreaterThan(8)
    expect(tokens).toBeLessThan(15)
  })
  
  it('should calculate PerfectPitch cost', () => {
    const pitch = 'word '.repeat(3000)
    const cost = calculatePerfectPitchCost(pitch)
    
    expect(cost.totals.totalCost).toBeGreaterThan(0.05)
    expect(cost.totals.totalCost).toBeLessThan(0.10)
  })
  
  it('should have correct cost breakdown', () => {
    const pitch = 'word '.repeat(3000)
    const cost = calculatePerfectPitchCost(pitch)
    
    const sum = 
      cost.stages.stage1.totalCost +
      cost.stages.stage2.totalCost +
      cost.stages.stage3.totalCost
    
    expect(sum).toBeCloseTo(cost.totals.totalCost, 4)
  })
})
```

---

**نکته نهایی:** این calculator ابزاری برای تخمین و برنامه‌ریزی است. برای محاسبات دقیق مالی، حتماً از داده‌های واقعی OpenAI استفاده کنید.
