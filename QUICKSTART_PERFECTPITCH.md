# PerfectPitch - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Environment
```bash
# Make sure OpenAI API key is set
echo $OPENAI_API_KEY
```

If not set, add to `.env.local`:
```
OPENAI_API_KEY=your_key_here
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Demo Page
```
http://localhost:3000/perfect-pitch-demo
```

### Step 4: Test with Sample Content

Copy this sample pitch:

```
Problem: Small businesses lose $50B annually due to poor cash flow management.

Solution: FlowAI is an AI-powered cash flow forecasting platform that predicts cash flow 90 days ahead with 95% accuracy.

Market: $12B TAM (30M small businesses in US)

Traction: 500 beta users, $50K MRR, growing 25% MoM

Business Model: $99-$799/month, LTV: $4,200, CAC: $800

Team: Ex-Stripe CEO, Ex-Google CTO with ML PhD

Ask: $2M seed round for 18-month runway to $1M ARR
```

### Step 5: Analyze
1. Paste content into text area
2. Select stage: "Seed"
3. Enter industry: "Tech/SaaS"
4. Click "Analyze Pitch Deck"
5. Wait 20-30 seconds

### Step 6: View Results
Navigate through four tabs:
- **Overview**: Score and verdict
- **Deep Dive**: Detailed scorecard
- **Action Plan**: Prioritized checklist
- **Investor Tests**: Six critical tests

## 📝 Expected Results

For the sample above, you should see:
- **Readiness Score**: 75-85/100
- **Readiness Band**: "review" or "human_review_ready"
- **Gate Verdict**: Likely PASS
- **Consistency Test**: 8-9/10
- **Clarity Test**: 8-9/10

## 🔧 Integration into Your App

### Option 1: Use the Hook

```typescript
import { usePerfectPitch } from '@/hooks/usePerfectPitch'
import PerfectPitchResult from '@/components/PerfectPitchResult'

function YourComponent() {
  const { analyze, analysis, loading, error, reset } = usePerfectPitch()

  const handleAnalyze = () => {
    analyze({
      pitchDeckContent: yourPitchContent,
      stage: 'seed',
      industry: 'Tech/SaaS'
    })
  }

  if (analysis) {
    return <PerfectPitchResult analysis={analysis} onReset={reset} />
  }

  return (
    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? 'Analyzing...' : 'Analyze Pitch'}
    </button>
  )
}
```

### Option 2: Direct API Call

```typescript
const response = await fetch('/api/perfect-pitch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pitchDeckContent: 'Your pitch content...',
    stage: 'seed',
    industry: 'Tech/SaaS',
    targetInvestorType: 'VC'
  })
})

const analysis = await response.json()
console.log(analysis.stage3.investor_gate_verdict)
```

## 📊 Understanding the Output

### Stage 1: Investor Simulation
```typescript
analysis.stage1.ideaQuality.score        // 0-10
analysis.stage1.pitchQuality.score       // 0-10
analysis.stage1.investorSignals.positive // Array of positive signals
analysis.stage1.investorSignals.critical // Array of critical issues
```

### Stage 2: Decision Engine
```typescript
analysis.stage2.scorecard.problemValidityUrgency.score  // 1-10
analysis.stage2.gapDiagnosis.biggestGap                 // String
analysis.stage2.prioritizedChecklist.high               // Array of must-fix items
analysis.stage2.improvementPotential.target             // Target score
```

### Stage 3: Final Validation
```typescript
analysis.stage3.final_readiness_score.score_0_to_100    // 0-100
analysis.stage3.final_readiness_score.readiness_band    // 'reject' | 'weak' | 'review' | 'human_review_ready'
analysis.stage3.investor_gate_verdict.pass_human_review // true/false
analysis.stage3.investor_gate_verdict.confidence_level  // 'low' | 'medium' | 'high'
```

## 🎯 Common Use Cases

### Use Case 1: Pre-Meeting Check
```typescript
// Before investor meeting, check if pitch is ready
const { analysis } = usePerfectPitch()

if (analysis.stage3.investor_gate_verdict.pass_human_review) {
  console.log('✅ Ready for investor meeting!')
} else {
  console.log('❌ Needs work:', analysis.stage3.investor_gate_verdict.main_blocking_reason)
}
```

### Use Case 2: Improvement Roadmap
```typescript
// Get prioritized list of improvements
const highPriority = analysis.stage2.prioritizedChecklist.high
const mediumPriority = analysis.stage2.prioritizedChecklist.medium

console.log('Must fix:', highPriority)
console.log('Should fix:', mediumPriority)
```

### Use Case 3: Track Progress
```typescript
// Compare before and after scores
const beforeScore = 65
const afterScore = analysis.stage3.final_readiness_score.score_0_to_100

console.log(`Improvement: +${afterScore - beforeScore} points`)
```

## 🐛 Troubleshooting

### Issue: "OpenAI API key is not configured"
**Solution**: Add `OPENAI_API_KEY` to `.env.local`

### Issue: Analysis takes too long
**Solution**: 
- Check pitch content length (keep under 10,000 chars)
- Verify internet connection
- Check OpenAI API status

### Issue: Unexpected scores
**Solution**:
- Ensure pitch content is complete
- Verify stage and industry are correct
- Review Stage 1 reconstruction for accuracy

### Issue: JSON parsing error
**Solution**:
- Retry the analysis
- Check OpenAI API status
- Review API logs in console

## 📚 Next Steps

1. **Read Full Documentation**
   - `docs/PERFECTPITCH_IMPLEMENTATION.md` - Complete guide
   - `docs/PERFECTPITCH_PROMPTS.md` - Prompt engineering details

2. **Test with Real Pitches**
   - Use your own pitch decks
   - Compare with current system
   - Gather feedback

3. **Integrate into Your App**
   - Choose integration strategy
   - Update UI components
   - Add to existing flows

4. **Monitor Performance**
   - Track processing times
   - Monitor costs
   - Measure user satisfaction

## 💡 Tips for Best Results

### Content Preparation
- ✅ Include all key sections (problem, solution, market, traction, team, ask)
- ✅ Be specific with numbers and metrics
- ✅ Mention competitors and differentiation
- ✅ Include business model details

### What to Avoid
- ❌ Vague or generic statements
- ❌ Missing critical information
- ❌ Inconsistent numbers
- ❌ Overly technical jargon without explanation

### Optimal Length
- **Minimum**: 500 characters (too short = incomplete analysis)
- **Optimal**: 1,000-5,000 characters
- **Maximum**: 10,000 characters (longer = slower processing)

## 🎓 Learning Resources

### Sample Pitches
See `docs/PERFECTPITCH_SAMPLE_PITCH.md` for three complete examples:
- Strong pitch (expected 75-85 score)
- Weak pitch (expected 35-50 score)
- Medium pitch (expected 55-70 score)

### Comparison with Current System
See `docs/PERFECTPITCH_COMPARISON.md` for detailed comparison.

### Architecture Details
See `docs/PERFECTPITCH_PROMPTS.md` for prompt engineering details.

## ✅ Success Checklist

Before going to production:

- [ ] Tested with sample content
- [ ] Verified all three stages complete
- [ ] Checked scores are reasonable
- [ ] Reviewed UI on mobile and desktop
- [ ] Tested error handling
- [ ] Monitored API costs
- [ ] Gathered user feedback
- [ ] Updated documentation
- [ ] Set up monitoring/alerts
- [ ] Trained support team

## 🚀 Ready to Launch?

Once you've completed the checklist:

1. Deploy to staging
2. Test with real users
3. Monitor performance
4. Iterate based on feedback
5. Deploy to production

## 📞 Need Help?

- **Documentation**: Check `docs/` folder
- **Demo**: Visit `/perfect-pitch-demo`
- **Samples**: See `docs/PERFECTPITCH_SAMPLE_PITCH.md`
- **Comparison**: See `docs/PERFECTPITCH_COMPARISON.md`

---

**You're all set!** 🎉

Start with the demo page, test with samples, then integrate into your app.

**Time to first analysis**: < 5 minutes  
**Time to integration**: < 30 minutes  
**Time to production**: 1-2 days

Good luck! 🚀
