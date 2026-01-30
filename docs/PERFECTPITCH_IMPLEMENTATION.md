# PerfectPitch Implementation Guide

## Overview

PerfectPitch is a three-stage AI-powered pitch deck analysis system that simulates experienced investor evaluation. This implementation is based on the prompts defined in `docs/PERFECTPITCH_PROMPTS.md`.

## Architecture

### Three-Stage Pipeline

```
Stage 1: Core Reasoning & Investor Simulation
    ↓
Stage 2: Decision Engine & Checklist Generator
    ↓
Stage 3: Final Investor Gate & Validation
```

### File Structure

```
lib/
  ├── perfectPitchTypes.ts          # TypeScript type definitions
  
app/api/
  └── perfect-pitch/
      └── route.ts                   # Main API endpoint (3 stages)

components/
  └── PerfectPitchResult.tsx         # UI component for displaying results

hooks/
  └── usePerfectPitch.ts             # React hook for API integration

app/
  └── perfect-pitch-demo/
      └── page.tsx                   # Demo page for testing

docs/
  ├── PERFECTPITCH_PROMPTS.md        # Prompt engineering documentation
  └── PERFECTPITCH_IMPLEMENTATION.md # This file
```

## API Usage

### Endpoint

```
POST /api/perfect-pitch
```

### Request Body

```typescript
{
  pitchDeckContent: string          // Required: Full pitch deck text
  stage?: string                    // Optional: 'pre-seed' | 'seed' | 'series-a'
  industry?: string                 // Optional: e.g., 'Tech/SaaS'
  targetInvestorType?: string       // Optional: 'VC' | 'angel' | 'corporate'
}
```

### Response

```typescript
{
  stage1: {
    startupReconstruction: {...}
    ideaQuality: {...}
    pitchQuality: {...}
    investorSignals: {...}
    patternMatching: {...}
    investmentReadiness: {...}
    rawVerdict: {...}
  },
  stage2: {
    scorecard: {...}
    gapDiagnosis: {...}
    prioritizedChecklist: {...}
    decisionLogic: {...}
    improvementPotential: {...}
  },
  stage3: {
    final_investor_tests: {
      consistency_test: {...}
      assumption_stress_test: {...}
      objection_coverage_test: {...}
      clarity_under_pressure_test: {...}
      market_believability_test: {...}
      story_coherence_test: {...}
    },
    final_readiness_score: {...}
    investor_gate_verdict: {...}
  },
  metadata: {
    analyzedAt: string
    pitchDeckLength: number
    processingTimeMs: number
  }
}
```

## React Hook Usage

```typescript
import { usePerfectPitch } from '@/hooks/usePerfectPitch'

function MyComponent() {
  const { analyze, reset, loading, error, analysis, progress } = usePerfectPitch()

  const handleAnalyze = () => {
    analyze({
      pitchDeckContent: 'Your pitch deck content...',
      stage: 'seed',
      industry: 'Tech/SaaS',
      targetInvestorType: 'VC'
    })
  }

  if (analysis) {
    return <PerfectPitchResult analysis={analysis} onReset={reset} />
  }

  return (
    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? progress.message : 'Analyze Pitch'}
    </button>
  )
}
```

## Component Usage

```typescript
import PerfectPitchResult from '@/components/PerfectPitchResult'

<PerfectPitchResult 
  analysis={analysisData} 
  onReset={() => console.log('Reset')} 
/>
```

## Stage Details

### Stage 1: Core Reasoning & Investor Simulation

**Purpose**: Reconstruct startup reality through investor lens

**Model**: GPT-4o (most capable for deep reasoning)

**Output**:
- Startup reconstruction (problem, solution, customer, market, business model)
- Idea quality score (0-10)
- Pitch quality score (0-10)
- Investor signals (positive, negative, critical)
- Pattern matching (similar successes/failures)
- Investment readiness assessment
- Raw verdict (pass/maybe/proceed)

**Cost**: ~$0.10-0.30 per analysis

### Stage 2: Decision Engine & Checklist Generator

**Purpose**: Convert analysis into actionable scores and checklist

**Model**: GPT-4o-mini (lighter model for structuring)

**Output**:
- 8-dimension scorecard (1-10 scale each)
- Gap diagnosis (biggest gap, fastest win, dangerous illusions)
- Prioritized checklist (high/medium/low priority)
- Decision logic (pass/maybe/proceed with reasoning)
- Improvement potential (current/target/ceiling)

**Cost**: ~$0.02-0.05 per analysis

### Stage 3: Final Investor Gate & Validation

**Purpose**: Run critical investor tests and generate gate verdict

**Model**: GPT-4o (capable model for validation quality)

**Output**:
- Six critical tests (each scored 0-10):
  1. Consistency Test
  2. Assumption Stress Test
  3. Objection Coverage Test
  4. Clarity Under Pressure Test
  5. Market Believability Test
  6. Story Coherence Test
- Final readiness score (0-100)
- Readiness band (reject/weak/review/human_review_ready)
- Investor gate verdict (pass/fail with confidence level)

**Cost**: ~$0.05-0.15 per analysis

## Total Cost Per Analysis

**Estimated**: $0.17 - $0.50 per complete analysis

Factors affecting cost:
- Pitch deck length
- Model pricing
- Response token count

## UI Features

### Tabs

1. **Overview**: Hero score, verdict, investor signals
2. **Deep Dive**: Startup reconstruction, scorecard, gap diagnosis
3. **Action Plan**: Prioritized checklist (high/medium/low)
4. **Investor Tests**: Six critical tests with detailed scores

### Visual Elements

- Animated score displays
- Color-coded readiness bands
- Progress indicators during analysis
- Expandable test details
- Copy-to-clipboard functionality

## Integration with Existing System

### Option 1: Replace Current Analysis

Update `components/PitchRecorder.tsx` or similar to use PerfectPitch:

```typescript
import { usePerfectPitch } from '@/hooks/usePerfectPitch'
import PerfectPitchResult from '@/components/PerfectPitchResult'

// Replace existing analysis logic with:
const { analyze, analysis } = usePerfectPitch()

// When pitch is ready:
analyze({
  pitchDeckContent: transcriptOrSlides,
  stage: userSelectedStage,
  industry: userSelectedIndustry
})

// Show results:
{analysis && <PerfectPitchResult analysis={analysis} onReset={reset} />}
```

### Option 2: Add as Alternative Analysis Mode

Add a toggle to switch between current analysis and PerfectPitch:

```typescript
const [analysisMode, setAnalysisMode] = useState<'standard' | 'perfectpitch'>('standard')

{analysisMode === 'perfectpitch' ? (
  <PerfectPitchResult analysis={perfectPitchAnalysis} onReset={reset} />
) : (
  <PitchAnalysisResult analysis={standardAnalysis} onReset={reset} />
)}
```

## Testing

### Demo Page

Visit `/perfect-pitch-demo` to test the system with sample pitch content.

### Sample Pitch Content

```
Problem: Small businesses struggle with cash flow management
Solution: AI-powered cash flow forecasting tool
Market: 30M small businesses in US
Traction: 500 beta users, $50K MRR
Team: Ex-Stripe engineers with 10 years fintech experience
Ask: $2M seed round
```

## Error Handling

The system includes comprehensive error handling:

- API key validation
- Content length validation
- JSON parsing errors
- OpenAI API errors (rate limits, timeouts)
- Network errors

Errors are surfaced through the `error` state in the hook.

## Performance Optimization

### Caching Strategy

Consider implementing:
- Cache Stage 1 output for multiple Stage 2/3 iterations
- Enable rapid experimentation with checklist priorities
- Reduce cost for iterative improvements

### Timeout Management

- Stage 1: 60s timeout (complex reasoning)
- Stage 2: 30s timeout (fast structuring)
- Stage 3: 45s timeout (validation tests)

## Future Enhancements

1. **Streaming Responses**: Show progress as each stage completes
2. **Partial Results**: Allow viewing Stage 1/2 while Stage 3 runs
3. **Comparison Mode**: Compare multiple pitch versions
4. **Export Options**: PDF, DOCX, JSON export
5. **Historical Tracking**: Save and compare analyses over time
6. **Custom Prompts**: Allow users to customize evaluation criteria

## Troubleshooting

### Analysis Takes Too Long

- Check pitch deck content length (recommend < 10,000 chars)
- Verify OpenAI API key is valid
- Check network connectivity

### Unexpected Scores

- Ensure pitch deck content is complete and well-formatted
- Verify stage and industry are set correctly
- Review Stage 1 output for accuracy of reconstruction

### JSON Parsing Errors

- This indicates OpenAI returned malformed JSON
- Check OpenAI API status
- Retry the analysis
- Consider adjusting temperature parameters

## Support

For issues or questions:
1. Check `docs/PERFECTPITCH_PROMPTS.md` for prompt details
2. Review API logs in browser console
3. Test with demo page first
4. Verify environment variables are set

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Production Ready
