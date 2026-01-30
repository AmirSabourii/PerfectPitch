# ساختار کامل API تحلیل سه مرحله‌ای PerfectPitch

## مدل‌های استفاده شده

### Stage 1: Core Reasoning & Investor Simulation
- **Model**: `gpt-4o`
- **دلیل**: نیاز به تفکر عمیق و تحلیل پیچیده سرمایه‌گذار
- **Temperature**: `0.3`
- **Max Tokens**: `2500`
- **Response Format**: `json_object`

### Stage 2: Decision Engine & Checklist Generator  
- **Model**: `gpt-4o-mini`
- **دلیل**: ساختاردهی داده‌های موجود (بدون تحلیل جدید)
- **Temperature**: `0.2`
- **Max Tokens**: `2000`
- **Response Format**: `json_object`

### Stage 3: Final Investor Gate & Validation
- **Model**: `gpt-4o`
- **دلیل**: اعتبارسنجی نهایی و تست‌های حیاتی
- **Temperature**: `0.1` (کمترین مقدار برای consistency)
- **Max Tokens**: `1500`
- **Response Format**: `json_object`

---

## Stage 1: Investor Simulation

### ورودی‌ها:
```typescript
{
  pitchDeckContent: string,  // محتوای کامل پیچ دک
  stage?: string,            // مثال: 'pre-seed', 'seed', 'series-a'
  industry?: string,         // مثال: 'SaaS', 'FinTech', 'HealthTech'
  targetInvestorType?: string // مثال: 'VC', 'angel', 'corporate'
}
```

### System Prompt:
```
You are an experienced venture capital investor with 15+ years of pattern recognition 
across hundreds of pitch decks and startup outcomes. Your role is to reconstruct the 
actual startup reality behind this pitch deck, not to provide advice.

CRITICAL MINDSET:
- Think like an investor evaluating risk and return, not a consultant giving feedback
- Detect distortions, hype, and presentation tricks that founders use
- Separate "good idea with weak pitch" from "weak idea with strong pitch"
- Focus on truth extraction, not politeness

ANALYSIS FRAMEWORK:
1. DISTORTION SCAN
2. IDEA REALITY RECONSTRUCTION
3. MARKET & TIMING ANALYSIS
4. EXECUTION SIGNAL DETECTION
5. INVESTOR RISK SCAN
6. PRESENTATION INTEGRITY CHECK

OUTPUT REQUIREMENTS:
Return a structured JSON object with:
- startupReconstruction: {problem, solution, customer, market, businessModel}
- ideaQuality: {score, reasoning, fundamentalStrength}
- pitchQuality: {score, reasoning, presentationEffectiveness}
- investorSignals: {positive: [], negative: [], critical: []}
- patternMatching: {similarSuccesses: [], similarFailures: [], uniqueAspects: []}
- investmentReadiness: {stage, readiness, gapToFundable}
- rawVerdict: {decision, confidence, keyReason}
```

### User Prompt:
```
PITCH CONTENT TO ANALYZE:

Stage: ${stage || 'Not specified'}
Industry: ${industry || 'Not specified'}
Target Investor Type: ${targetInvestorType || 'Not specified'}

PITCH DECK CONTENT:
${pitchDeckContent}

Analyze this pitch deck as an experienced investor and return the structured JSON output.
```

### خروجی مورد انتظار:
```json
{
  "startupReconstruction": {
    "problem": "string",
    "solution": "string",
    "customer": "string",
    "market": "string",
    "businessModel": "string"
  },
  "ideaQuality": {
    "score": 0-10,
    "reasoning": "string",
    "fundamentalStrength": "string"
  },
  "pitchQuality": {
    "score": 0-10,
    "reasoning": "string",
    "presentationEffectiveness": "string"
  },
  "investorSignals": {
    "positive": ["string"],
    "negative": ["string"],
    "critical": ["string"]
  },
  "patternMatching": {
    "similarSuccesses": ["string"],
    "similarFailures": ["string"],
    "uniqueAspects": ["string"]
  },
  "investmentReadiness": {
    "stage": "string",
    "readiness": "string",
    "gapToFundable": "string"
  },
  "rawVerdict": {
    "decision": "pass | maybe | proceed",
    "confidence": "low | medium | high",
    "keyReason": "string"
  }
}
```

---

## Stage 2: Decision Engine

### ورودی‌ها:
```typescript
{
  stage1Output: Stage1Output  // خروجی کامل Stage 1
}
```

### System Prompt:
```
You are a decision engine that converts raw investor analysis into structured scores, 
gap diagnosis, and a prioritized action checklist.

INPUT: You receive the complete output from Prompt 1 (investor simulation analysis)

YOUR TASK: Generate a comprehensive scorecard and prioritized correction checklist 
WITHOUT doing new analysis. You are organizing and structuring existing insights.

SCORECARD GENERATION:
Rate each dimension on a 1-10 scale with clear reasoning:
1. Problem Validity & Urgency
2. Market Size & Accessibility
3. Solution Fit & Differentiation
4. Business Model Clarity
5. Competitive Defensibility
6. Narrative Coherence
7. Evidence & Credibility
8. Overall Investability

GAP DIAGNOSIS:
- Biggest Value Gap
- Fastest Credibility Win
- Dangerous Illusions

PRIORITIZED CORRECTION CHECKLIST:
- HIGH IMPACT (Must Fix)
- MEDIUM IMPACT (Should Fix)
- LOW IMPACT (Nice to Have)

OUTPUT REQUIREMENTS:
Return structured JSON with:
- scorecard: {dimension: {score, reasoning}, ...}
- gapDiagnosis: {biggestGap, fastestWin, dangerousIllusions}
- prioritizedChecklist: {high: [], medium: [], low: []}
- decisionLogic: {decision, reasoning, conditions}
- improvementPotential: {current, target, ceiling, confidence}
```

### User Prompt:
```
INVESTOR ANALYSIS FROM STAGE 1:

${JSON.stringify(stage1Output, null, 2)}

Generate the structured scorecard and prioritized checklist based on this analysis.
```

### خروجی مورد انتظار:
```json
{
  "scorecard": {
    "problemValidityUrgency": {
      "score": 1-10,
      "reasoning": "string"
    },
    "marketSizeAccessibility": {
      "score": 1-10,
      "reasoning": "string"
    },
    "solutionFitDifferentiation": {
      "score": 1-10,
      "reasoning": "string"
    },
    "businessModelClarity": {
      "score": 1-10,
      "reasoning": "string"
    },
    "competitiveDefensibility": {
      "score": 1-10,
      "reasoning": "string"
    },
    "narrativeCoherence": {
      "score": 1-10,
      "reasoning": "string"
    },
    "evidenceCredibility": {
      "score": 1-10,
      "reasoning": "string"
    },
    "overallInvestability": {
      "score": 1-10,
      "reasoning": "string"
    }
  },
  "gapDiagnosis": {
    "biggestGap": "string",
    "fastestWin": "string",
    "dangerousIllusions": ["string"]
  },
  "prioritizedChecklist": {
    "high": ["string"],
    "medium": ["string"],
    "low": ["string"]
  },
  "decisionLogic": {
    "decision": "pass | maybe | proceed",
    "reasoning": "string",
    "conditions": ["string"]
  },
  "improvementPotential": {
    "current": 0-10,
    "target": 0-10,
    "ceiling": 0-10,
    "confidence": "low | medium | high"
  }
}
```

---

## Stage 3: Final Validation

### ورودی‌ها:
```typescript
{
  originalPitch: string,      // محتوای اصلی پیچ دک
  stage1Output: Stage1Output, // خروجی Stage 1
  stage2Output: Stage2Output  // خروجی Stage 2
}
```

### System Prompt:
```
You are a final validation engine that simulates the critical tests an experienced 
investor applies before deciding to take a pitch to partner meeting. Your role is 
to be the gatekeeper.

YOUR TASK: Run six critical investor tests and generate a final gate verdict.

CRITICAL INVESTOR TESTS:

1. CONSISTENCY TEST (Score 0-10)
   - Do claims across slides contradict each other?
   - Are market size, TAM, and customer numbers aligned?
   Output: {score: 0-10, critical_issue: "string or empty"}

2. ASSUMPTION STRESS TEST (Score 0-10)
   - What single assumption, if wrong, kills the entire business?
   Output: {score: 0-10, fatal_dependency: "string or empty"}

3. OBJECTION COVERAGE TEST (Score 0-10)
   - Does the deck preemptively address obvious investor objections?
   Output: {score: 0-10, missed_high_impact_item: "string or empty"}

4. CLARITY UNDER PRESSURE TEST (Score 0-10)
   - If an investor only reads this for 30 seconds, what do they take away?
   Output: {score: 0-10, "30s_takeaway": "string"}

5. MARKET BELIEVABILITY TEST (Score 0-10)
   - Are market size claims realistic or inflated?
   Output: {score: 0-10, unconvincing_claim: "string or empty"}

6. STORY COHERENCE TEST (Score 0-10)
   - Does the narrative flow logically from problem to solution to traction?
   Output: {score: 0-10, flow_break_point: "string or empty"}

FINAL READINESS SCORING:
Calculate overall readiness (0-100) based on weighted average of six test scores.

Readiness Bands:
- 0-40: "reject" - Not ready for investor time
- 41-60: "weak" - Needs major work before showing
- 61-75: "review" - Could get meeting but likely pass
- 76-100: "human_review_ready" - Worth partner discussion

INVESTOR GATE VERDICT:
- pass_human_review: true/false
- confidence_level: "low | medium | high"
- main_blocking_reason: "string or empty"

DECISION LOGIC:
- ANY test score below 4 = automatic fail
- Average score below 6.5 = likely fail
- Consistency and Assumption tests are weighted 2x
```

### User Prompt:
```
ORIGINAL PITCH DECK:
${originalPitch}

INVESTOR ANALYSIS (STAGE 1):
${JSON.stringify(stage1Output, null, 2)}

PRIORITIZED CHECKLIST (STAGE 2):
${JSON.stringify(stage2Output.prioritizedChecklist, null, 2)}

Run the six critical investor tests and generate the final gate verdict.
```

### خروجی مورد انتظار:
```json
{
  "final_investor_tests": {
    "consistency_test": {
      "score": 0-10,
      "critical_issue": "string or empty"
    },
    "assumption_stress_test": {
      "score": 0-10,
      "fatal_dependency": "string or empty"
    },
    "objection_coverage_test": {
      "score": 0-10,
      "missed_high_impact_item": "string or empty"
    },
    "clarity_under_pressure_test": {
      "score": 0-10,
      "30s_takeaway": "string"
    },
    "market_believability_test": {
      "score": 0-10,
      "unconvincing_claim": "string or empty"
    },
    "story_coherence_test": {
      "score": 0-10,
      "flow_break_point": "string or empty"
    }
  },
  "final_readiness_score": {
    "score_0_to_100": 0-100,
    "readiness_band": "reject | weak | review | human_review_ready"
  },
  "investor_gate_verdict": {
    "pass_human_review": true/false,
    "confidence_level": "low | medium | high",
    "main_blocking_reason": "string or empty"
  }
}
```

---

## خلاصه جریان کامل

```
User Input (Pitch Deck)
    ↓
┌─────────────────────────────────────┐
│ Stage 1: Investor Simulation        │
│ Model: gpt-4o                       │
│ Temperature: 0.3                    │
│ Max Tokens: 2500                    │
│ Output: Startup reconstruction,     │
│         Idea/Pitch quality,         │
│         Investor signals            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Stage 2: Decision Engine            │
│ Model: gpt-4o-mini                  │
│ Temperature: 0.2                    │
│ Max Tokens: 2000                    │
│ Output: 8-dimension scorecard,      │
│         Gap diagnosis,              │
│         Prioritized checklist       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Stage 3: Final Validation           │
│ Model: gpt-4o                       │
│ Temperature: 0.1                    │
│ Max Tokens: 1500                    │
│ Output: 6 critical tests,           │
│         Readiness score (0-100),    │
│         Gate verdict (pass/fail)    │
└─────────────────────────────────────┘
    ↓
Final Result: PerfectPitchAnalysis
```

---

## هزینه تقریبی هر تحلیل

با فرض پیچ دک متوسط (5000 کلمه):

- **Stage 1 (gpt-4o)**: ~$0.15
- **Stage 2 (gpt-4o-mini)**: ~$0.01
- **Stage 3 (gpt-4o)**: ~$0.10

**مجموع**: ~$0.26 per analysis

---

## نکات مهم

1. ✅ **Stage 1 و 3 از gpt-4o استفاده می‌کنند** - برای تحلیل عمیق
2. ✅ **Stage 2 از gpt-4o-mini استفاده می‌کند** - فقط ساختاردهی
3. ✅ **Temperature پایین در Stage 3** - برای consistency بالا
4. ✅ **همه از json_object استفاده می‌کنند** - خروجی ساختاریافته
5. ✅ **هر stage به خروجی stage قبلی وابسته است** - جریان sequential
