# Reasoning System - Data Flow Diagram

## Overview

This document shows how reasoning data flows from the AI model through the API to the UI components.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER UPLOADS PITCH                       │
│                              ↓                                   │
│                    POST /api/perfect-pitch                       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTE HANDLER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ STAGE 1: Core Reasoning & Investor Simulation            │  │
│  │                                                           │  │
│  │ System Prompt with REASONING REQUIREMENTS:               │  │
│  │ • STATE EVIDENCE - cite sources                          │  │
│  │ • SHOW LOGIC - step-by-step                              │  │
│  │ • EXPLAIN NUMBERS - formulas                             │  │
│  │ • ACKNOWLEDGE UNCERTAINTY - gaps                         │  │
│  │ • COMPARE ALTERNATIVES - scenarios                       │  │
│  │                                                           │  │
│  │ Claude API Call → Returns JSON with reasoning objects    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                ↓                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ STAGE 2: Decision Engine & Checklist                     │  │
│  │ (Same reasoning requirements)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                ↓                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ STAGE 3: Final Investor Gate & Validation                │  │
│  │ (Same reasoning requirements)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      JSON RESPONSE                               │
│                                                                  │
│  {                                                               │
│    "stage1": {                                                   │
│      "ideaQuality": {                                            │
│        "score": 7,                                               │
│        "reasoning": {                                            │
│          "scoreBreakdown": {                                     │
│            "problemSignificance": {                              │
│              "score": 8,                                         │
│              "why": "...",                                       │
│              "evidence": ["...", "..."]                          │
│            },                                                    │
│            ...                                                   │
│          },                                                      │
│          "calculationMethod": "...",                             │
│          "whyNotHigher": "...",                                  │
│          "whyNotLower": "...",                                   │
│          "comparableIdeas": ["...", "..."]                       │
│        }                                                         │
│      },                                                          │
│      "overallReasoningTransparency": {                           │
│        "keyAssumptions": ["...", "..."],                         │
│        "uncertaintyAreas": ["...", "..."],                       │
│        "dataQuality": "...",                                     │
│        "biasCheck": "...",                                       │
│        "alternativeInterpretations": ["...", "..."]              │
│      }                                                           │
│    },                                                            │
│    "stage3": {                                                   │
│      "consistency_test": {                                       │
│        "score": 8,                                               │
│        "reasoning": {                                            │
│          "evidenceChecked": ["...", "..."],                      │
│          "scoreCalculation": "...",                              │
│          "confidenceLevel": "high"                               │
│        }                                                         │
│      },                                                          │
│      "investor_gate_verdict": {                                  │
│        "pass_human_review": true,                                │
│        "confidence_level": "high",                               │
│        "verdictReasoning": {                                     │
│          "decisionLogic": {...},                                 │
│          "confidenceAnalysis": {...},                            │
│          "alternativeOutcomes": {...},                           │
│          "investorTimeValue": {...}                              │
│        }                                                         │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENT TREE                          │
│                                                                  │
│  PerfectPitchResult.tsx                                          │
│  ├── Overview Tab                                                │
│  │   ├── Readiness Score Display                                │
│  │   ├── Investor Gate Verdict                                  │
│  │   │   └── ReasoningDisplay (verdictReasoning)                │
│  │   │       ├── Decision Logic                                 │
│  │   │       ├── Confidence Analysis                            │
│  │   │       ├── Alternative Outcomes                           │
│  │   │       └── Investor Time Value                            │
│  │   └── Analysis Transparency                                  │
│  │       ├── Key Assumptions                                    │
│  │       ├── Uncertainty Areas                                  │
│  │       ├── Data Quality                                       │
│  │       └── Bias Check                                         │
│  │                                                               │
│  ├── Stage 1 Tab                                                 │
│  │   ├── Idea Quality                                            │
│  │   │   └── ReasoningDisplay (ideaQuality.reasoning)           │
│  │   │       ├── Score Breakdown                                │
│  │   │       ├── Calculation Method                             │
│  │   │       ├── Why Not Higher/Lower                           │
│  │   │       └── Comparable Ideas                               │
│  │   └── Pitch Quality                                           │
│  │       └── ReasoningDisplay (pitchQuality.reasoning)          │
│  │                                                               │
│  ├── Stage 2 Tab                                                 │
│  │   └── Scorecard                                               │
│  │       └── Each Dimension                                      │
│  │           └── ReasoningDisplay (dimension.reasoning)         │
│  │                                                               │
│  ├── Stage 3 Tab                                                 │
│  │   ├── Six Critical Tests                                      │
│  │   │   └── Each Test                                           │
│  │   │       └── ReasoningDisplay (test.reasoning)              │
│  │   ├── Final Readiness Score                                  │
│  │   │   ├── Test Scores Grid                                   │
│  │   │   ├── ReasoningDisplay (scoringMethodology)             │
│  │   │   └── ReasoningDisplay (bandReasoning)                  │
│  │   └── Final Investor Gate Verdict                            │
│  │       └── ReasoningDisplay (verdictReasoning) [expanded]    │
│  │                                                               │
│  └── Raw Data Tab                                                │
│      └── Complete JSON Display                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES REASONING                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 🧠 Verdict Analysis                            [▼]     │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                        │     │
│  │ Decision Logic                                         │     │
│  │ • Automatic Fail Triggers: None                        │     │
│  │ • Average Score Analysis: All tests above 7/10        │     │
│  │ • Exceptional Strengths: Market timing, Team fit      │     │
│  │                                                        │     │
│  │ Confidence Analysis                                    │     │
│  │ • Certainty Drivers: Strong evidence, Clear logic     │     │
│  │ • Information Gaps: Limited competitor data           │     │
│  │                                                        │     │
│  │ Alternative Outcomes                                   │     │
│  │ • If Passed: Risk of market timing miss               │     │
│  │ • If Rejected: Could miss breakout opportunity        │     │
│  │                                                        │     │
│  │ Investor Time Value                                    │     │
│  │ • Expected Value: High potential return               │     │
│  │ • Time Investment: 2-3 hours for deep dive            │     │
│  │ • Worthiness: Strong signal-to-noise ratio            │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
PerfectPitchResult
│
├── ReasoningDisplay (reusable)
│   ├── Score Breakdown Section
│   ├── Calculation Method Section
│   ├── Evidence Lists Section
│   ├── Confidence Level Section
│   ├── Scenario Analysis Section
│   ├── Verdict Sections (4 types)
│   ├── Scoring Methodology Section
│   └── Band Reasoning Section
│
└── SafeJsonDisplay (reusable)
    ├── Primitive Display (string, number, boolean)
    ├── Array Display (flat or nested)
    └── Object Display (recursive)
```

## Data Structure

### Stage 1 Output
```typescript
{
  ideaQuality: {
    score: number,
    reasoning: {
      scoreBreakdown: {
        problemSignificance: { score, why, evidence[] },
        solutionNovelty: { score, why, evidence[] },
        marketTiming: { score, why, evidence[] },
        scalePotential: { score, why, evidence[] }
      },
      calculationMethod: string,
      whyNotHigher: string,
      whyNotLower: string,
      comparableIdeas: string[]
    }
  },
  overallReasoningTransparency: {
    keyAssumptions: string[],
    uncertaintyAreas: string[],
    dataQuality: string,
    biasCheck: string,
    alternativeInterpretations: string[]
  }
}
```

### Stage 3 Output
```typescript
{
  consistency_test: {
    score: number,
    reasoning: {
      evidenceChecked: string[],
      contradictionsFound: string[],
      scoreCalculation: string,
      confidenceLevel: 'high' | 'medium' | 'low'
    }
  },
  final_readiness_score: {
    score_0_to_100: number,
    readiness_band: string,
    scoringMethodology: {
      weightingScheme: object,
      aggregationFormula: string,
      penaltyApplication: string,
      calibrationBenchmarks: string[]
    },
    bandReasoning: {
      thresholdLogic: string,
      currentBandJustification: string,
      distanceToNextBand: string,
      confidenceInBand: string
    }
  },
  investor_gate_verdict: {
    pass_human_review: boolean,
    confidence_level: string,
    verdictReasoning: {
      decisionLogic: {
        automaticFailTriggers: string[],
        averageScoreAnalysis: string,
        exceptionalStrengths: string[],
        fatalWeaknesses: string[]
      },
      confidenceAnalysis: {
        certaintyDrivers: string[],
        edgeCaseConsiderations: string,
        informationGaps: string[],
        confidenceCalibration: string
      },
      alternativeOutcomes: {
        ifPassedWhatRisks: string,
        ifRejectedWhatMissed: string,
        reversalConditions: string
      },
      investorTimeValue: {
        opportunityCost: string,
        expectedValue: string,
        timeInvestmentRequired: string,
        worthinessCalculation: string
      }
    }
  }
}
```

## Rendering Logic

### ReasoningDisplay Component
```typescript
function ReasoningDisplay({ reasoning, type }) {
  // 1. Check if reasoning exists and is object
  if (!reasoning || typeof reasoning === 'string') {
    return <SimpleDisplay />
  }

  // 2. Render based on available fields
  return (
    <ExpandableCard>
      {reasoning.scoreBreakdown && <ScoreBreakdownSection />}
      {reasoning.calculationMethod && <CalculationSection />}
      {reasoning.evidenceChecked && <EvidenceSection />}
      {reasoning.decisionLogic && <DecisionLogicSection />}
      {reasoning.confidenceAnalysis && <ConfidenceSection />}
      {reasoning.alternativeOutcomes && <AlternativesSection />}
      {reasoning.investorTimeValue && <TimeValueSection />}
      {reasoning.weightingScheme && <WeightingSection />}
      {reasoning.thresholdLogic && <ThresholdSection />}
    </ExpandableCard>
  )
}
```

### Null Safety Pattern
```typescript
// Always check existence before accessing
{stage3?.investor_gate_verdict?.verdictReasoning && (
  <ReasoningDisplay reasoning={stage3.investor_gate_verdict.verdictReasoning} />
)}

// Use optional chaining
const score = stage1?.ideaQuality?.score ?? 0

// Provide fallbacks
const reasoning = stage1?.ideaQuality?.reasoning || "No reasoning available"
```

## State Management

### Component State
```typescript
// PerfectPitchResult.tsx
const [activeTab, setActiveTab] = useState('overview')

// ReasoningDisplay.tsx
const [isExpanded, setIsExpanded] = useState(defaultExpanded)

// SafeJsonDisplay.tsx
const [isExpanded, setIsExpanded] = useState(defaultExpanded || level < 2)
```

### Props Flow
```
PerfectPitchResult
  ├── analysis (prop from parent)
  │   ├── stage1
  │   ├── stage2
  │   └── stage3
  │
  └── ReasoningDisplay
      ├── title (string)
      ├── reasoning (object)
      ├── type ('score' | 'test' | 'decision')
      └── defaultExpanded (boolean)
```

## Error Handling

### API Level
```typescript
try {
  const response = await anthropic.messages.create({...})
  const analysis = JSON.parse(response.content[0].text)
  return NextResponse.json(analysis)
} catch (error) {
  console.error('Analysis failed:', error)
  return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
}
```

### Component Level
```typescript
// Check for data existence
if (!analysis || !stage1 || !stage2 || !stage3) {
  return <ErrorState />
}

// Safe property access
const score = stage1?.ideaQuality?.score
const reasoning = stage1?.ideaQuality?.reasoning

// Conditional rendering
{reasoning && typeof reasoning === 'object' ? (
  <ReasoningDisplay reasoning={reasoning} />
) : (
  <SimpleText>{reasoning || 'N/A'}</SimpleText>
)}
```

## Performance Considerations

### Lazy Rendering
- Reasoning sections are collapsed by default
- Content only renders when user expands
- Reduces initial render time

### Memoization (Future)
```typescript
const MemoizedReasoningDisplay = React.memo(ReasoningDisplay)
```

### Code Splitting (Future)
```typescript
const ReasoningDisplay = lazy(() => import('./ReasoningDisplay'))
```

## Testing Flow

```
1. Upload Pitch Deck
   ↓
2. API Processes (3 stages)
   ↓
3. Check Network Tab
   - Verify reasoning objects in response
   ↓
4. Check UI Rendering
   - Overview tab: Verdict reasoning
   - Stage 1 tab: Idea/Pitch reasoning
   - Stage 2 tab: Scorecard reasoning
   - Stage 3 tab: Test reasoning + Verdict
   ↓
5. Interact with UI
   - Click expand buttons
   - Verify all sections display
   - Check for console errors
   ↓
6. Test Edge Cases
   - Old format (string reasoning)
   - Missing fields
   - Null values
   ↓
7. Verify Backward Compatibility
   - Old API responses still work
   - No TypeScript errors
```

---

**This diagram shows the complete flow from user input to displayed reasoning, including all components, data structures, and error handling.**
