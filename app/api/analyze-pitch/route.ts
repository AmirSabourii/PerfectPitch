import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { adminAuth, isAdminInitialized } from '@/lib/admin'
import { checkCredits, useCredits } from '@/lib/limits'
import { withTimeout, TIMEOUTS, MAX_CONTENT_LENGTH } from '@/lib/timeout'
import OpenAI from 'openai'
import {
  PerfectPitchAnalysis,
  PerfectPitchInput,
  Stage1Output,
  Stage2Output,
  Stage3Output,
} from '@/lib/perfectPitchTypes'

// No artificial time limits - let the analysis complete naturally
export const maxDuration = 300 // 5 minutes max for Next.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Lazy OpenAI client initialization
let cachedClient: OpenAI | null = null

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.')
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey })
  }
  return cachedClient
}

// ============================================
// PERFECTPITCH THREE-STAGE ANALYSIS SYSTEM
// ============================================

async function runStage1(input: PerfectPitchInput): Promise<Stage1Output> {
  const openai = getOpenAIClient()

  const systemPrompt = `You are an experienced venture capital investor with 15+ years of pattern recognition across hundreds of pitch decks and startup outcomes. Your role is to reconstruct the actual startup reality behind this pitch deck, not to provide advice.

CRITICAL MINDSET:
- Think like an investor evaluating risk and return, not a consultant giving feedback
- Detect distortions, hype, and presentation tricks that founders use (intentionally or not)
- Separate "good idea with weak pitch" from "weak idea with strong pitch"
- Focus on truth extraction, not politeness

REASONING REQUIREMENTS (CRITICAL):
You MUST show your complete reasoning process for EVERY conclusion. This is not optional.

For EVERY score, judgment, or conclusion you make:
1. STATE THE EVIDENCE: What specific data points, claims, or patterns led you here?
2. SHOW YOUR LOGIC: Walk through your reasoning step-by-step
3. EXPLAIN THE NUMBERS: Why this specific score? Why not higher or lower?
4. ACKNOWLEDGE UNCERTAINTY: What assumptions are you making? What could change your mind?
5. COMPARE ALTERNATIVES: What other interpretations did you consider and reject?

Example of GOOD reasoning:
"Market size score: 6/10
EVIDENCE: Deck claims $50B TAM, cites Gartner report from 2023
REASONING: 
- Step 1: Verified Gartner report exists and number is accurate for total market
- Step 2: However, their serviceable market is only enterprise customers with 500+ employees
- Step 3: This segment represents ~15% of total TAM = $7.5B realistic SAM
- Step 4: Their current GTM strategy (outbound sales) can realistically capture 0.5-2% of SAM in 5 years
SCORE JUSTIFICATION: 
- Not 8/10 because TAM is inflated for their actual strategy
- Not 4/10 because the core market does exist and is growing
- 6/10 reflects: real market (positive) but overstated accessibility (negative)
ASSUMPTIONS: Assuming their sales team can scale, assuming no major competitor moves
ALTERNATIVE INTERPRETATION: Could be 7/10 if they pivot to SMB market, but no evidence of this plan"

Example of BAD reasoning (DO NOT DO THIS):
"Market size score: 6/10 - The market is decent but not huge"

ANALYSIS FRAMEWORK:

1. DISTORTION SCAN
   - Identify buzzwords, hype language, and vanity metrics
   - Flag unsupported claims and logical leaps
   - Detect what's being hidden or glossed over

2. IDEA REALITY RECONSTRUCTION
   - What is the actual problem being solved?
   - Who is the real target customer (not aspirational)?
   - What is the core solution mechanism?
   - Is this problem worth solving at venture scale?

3. MARKET & TIMING ANALYSIS
   - Is there genuine market pull or is this push marketing?
   - Market readiness and adoption barriers
   - Competitive landscape reality check
   - Why now? (timing validity)

4. EXECUTION SIGNAL DETECTION
   - Business model clarity and unit economics
   - Evidence of customer learning vs assumptions
   - Trade-off awareness (what they're NOT doing)
   - Team-market-product fit signals

5. INVESTOR RISK SCAN
   - Fatal assumptions that could kill the company
   - Scale potential and capital efficiency
   - Exit story plausibility
   - Competitive defensibility

6. PRESENTATION INTEGRITY CHECK
   - Narrative coherence across slides
   - Missing critical evidence
   - Slide-by-slide credibility assessment
   - Idea quality vs pitch quality gap

OUTPUT REQUIREMENTS:
Return a structured JSON object with COMPLETE REASONING for every field. Include detailed reasoning objects with scoreBreakdown, calculationMethod, evidence arrays, and transparency fields.

CRITICAL: You MUST return EXACTLY this JSON structure. Do NOT add or remove fields. Do NOT change field names.

EXACT JSON SCHEMA YOU MUST FOLLOW:
{
  "ideaQuality": {
    "score": <number 0-10>,
    "reasoning": {
      "scoreBreakdown": {
        "problemSignificance": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "solutionNovelty": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "marketTiming": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "scalePotential": {"score": <number>, "why": "<string>", "evidence": ["<string>"]}
      },
      "calculationMethod": "<string: show formula>",
      "whyNotHigher": "<string>",
      "whyNotLower": "<string>",
      "comparableIdeas": ["<string>"]
    },
    "fundamentalStrength": "<string>"
  },
  "pitchQuality": {
    "score": <number 0-10>,
    "reasoning": {
      "scoreBreakdown": {
        "narrativeClarity": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "evidenceQuality": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "visualEffectiveness": {"score": <number>, "why": "<string>", "evidence": ["<string>"]},
        "logicalFlow": {"score": <number>, "why": "<string>", "evidence": ["<string>"]}
      },
      "calculationMethod": "<string>",
      "gapBetweenIdeaAndPresentation": "<string>",
      "mostEffectiveSlides": ["<string>"],
      "leastEffectiveSlides": ["<string>"]
    },
    "presentationEffectiveness": "<string>"
  },
  "investorSignals": {
    "positive": [{"signal": "<string>", "strength": "weak|moderate|strong", "reasoning": "<string>", "comparablePattern": "<string>"}],
    "negative": [{"signal": "<string>", "severity": "minor|moderate|major", "reasoning": "<string>", "comparablePattern": "<string>", "mitigationPossibility": "<string>"}],
    "critical": [{"signal": "<string>", "fatalityRisk": "low|medium|high", "reasoning": "<string>", "comparablePattern": "<string>"}],
    "signalAnalysisMethod": "<string>"
  },
  "patternMatching": {
    "similarSuccesses": [{"company": "<string>", "similarity": "<string>", "outcome": "<string>", "relevantLesson": "<string>", "differencesThatMatter": "<string>"}],
    "similarFailures": [{"company": "<string>", "similarity": "<string>", "outcome": "<string>", "relevantLesson": "<string>", "differencesThatMatter": "<string>"}],
    "uniqueAspects": ["<string>"],
    "patternConfidence": "<string>"
  },
  "investmentReadiness": {
    "stage": "<string>",
    "readiness": "<string or number>",
    "readinessReasoning": {
      "currentStateAssessment": "<string>",
      "stageRequirements": "<string>",
      "gapAnalysis": ["<string>"],
      "scoreJustification": "<string>",
      "timeToReady": "<string>"
    },
    "gapToFundable": "<string>"
  },
  "rawVerdict": {
    "decision": "pass|maybe|proceed",
    "confidence": "low|medium|high",
    "keyReason": "<string>",
    "verdictReasoning": {
      "decisiveFactors": ["<string>"],
      "weighingProcess": "<string>",
      "edgeCaseConsiderations": "<string>",
      "confidenceDrivers": "<string>",
      "scenarioAnalysis": {
        "bestCase": "<string>",
        "worstCase": "<string>",
        "mostLikely": "<string>"
      }
    }
  },
  "overallReasoningTransparency": {
    "keyAssumptions": ["<string>"],
    "uncertaintyAreas": ["<string>"],
    "dataQuality": "<string>",
    "biasCheck": "<string>",
    "alternativeInterpretations": ["<string>"]
  }
}

CONSTRAINTS:
- No advice or recommendations in this output
- Focus on what IS, not what SHOULD BE
- Be brutally honest in internal reasoning
- Output must be machine-readable JSON
- EVERY score must have detailed reasoning showing your work
- NEVER give a score without explaining the calculation
- Show evidence, logic, and alternatives for EVERY judgment
- Follow the EXACT schema above - do not add or remove fields`

  const userPrompt = `PITCH CONTENT TO ANALYZE:

Stage: ${input.stage || 'Not specified'}
Industry: ${input.industry || 'Not specified'}
Target Investor Type: ${input.targetInvestorType || 'Not specified'}

PITCH DECK CONTENT:
${input.pitchDeckContent}

Analyze this pitch deck as an experienced investor and return your analysis as a structured JSON object with complete reasoning for every score and judgment.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 3000, // Increased from 2500
  })

  const content = response.choices[0]?.message?.content || '{}'
  
  try {
    return JSON.parse(content) as Stage1Output
  } catch (parseError: any) {
    console.error('[Stage 1] JSON parse error:', parseError.message)
    console.error('[Stage 1] Content length:', content.length)
    
    // Try to fix unterminated JSON
    let fixedContent = content
    if (!content.trim().endsWith('}')) {
      const lastCompleteField = content.lastIndexOf('",')
      if (lastCompleteField > 0) {
        fixedContent = content.substring(0, lastCompleteField + 2) + '\n}'
      }
    }
    
    try {
      return JSON.parse(fixedContent) as Stage1Output
    } catch (secondError) {
      console.error('[Stage 1] Could not fix JSON, returning minimal structure')
      throw new Error('Stage 1 analysis failed: Invalid JSON response from AI model')
    }
  }
}

async function runStage2(stage1Output: Stage1Output): Promise<Stage2Output> {
  const openai = getOpenAIClient()

  const systemPrompt = `You are a decision engine that converts raw investor analysis into structured scores, gap diagnosis, and a prioritized action checklist.

INPUT: You receive the complete output from Prompt 1 (investor simulation analysis)

YOUR TASK: Generate a comprehensive scorecard and prioritized correction checklist WITHOUT doing new analysis. You are organizing and structuring existing insights.

TRANSPARENCY MANDATE:
For EVERY score and decision, you must provide:
1. CALCULATION TRANSPARENCY: Show exactly how you derived each number
2. EVIDENCE MAPPING: Link each score to specific evidence from Stage 1
3. TRADE-OFF ANALYSIS: Explain what you prioritized and what you sacrificed
4. IMPACT QUANTIFICATION: Estimate the real-world impact of each issue

SCORECARD GENERATION:
Rate each dimension on a 1-10 scale with COMPLETE REASONING:
1. Problem Validity & Urgency
2. Market Size & Accessibility
3. Solution Fit & Differentiation
4. Business Model Clarity
5. Competitive Defensibility
6. Narrative Coherence
7. Evidence & Credibility
8. Overall Investability

Each score must include reasoning with: evidenceFromStage1, calculationMethod, scoreJustification, impactOnInvestability

GAP DIAGNOSIS:
Identify with detailed reasoning:
- Biggest Value Gap: What single issue most reduces investability?
- Fastest Credibility Win: What quick fix would boost investor confidence most?
- Dangerous Illusions: What false beliefs might the founder have?

PRIORITIZED CORRECTION CHECKLIST:
Generate a checklist with three priority levels. Each item must include:
- item: specific action
- investorConcern: which objection this addresses
- expectedImpact: score improvement estimate
- reasoning: {whyPriority, evidenceOfNeed, successCriteria, estimatedEffort}

HIGH IMPACT (Must Fix):
- Items that directly address fatal flaws
- Missing evidence for core claims
- Narrative incoherence that confuses investors

MEDIUM IMPACT (Should Fix):
- Items that improve credibility significantly
- Competitive positioning weaknesses
- Business model clarity issues

LOW IMPACT (Nice to Have):
- Polish and presentation improvements
- Supporting details that strengthen story

DECISION LOGIC MAPPING:
- PASS: Clear reasons why this is not investable now
- MAYBE: What would need to change for reconsideration
- PROCEED: Conditions under which this moves forward

IMPROVEMENT POTENTIAL:
- Current Score: X/10
- Realistic Target: Y/10 (with checklist fixes)
- Ceiling: Z/10 (best case with perfect execution)
Include detailed reasoning with improvementRoadmap (quickWins, mediumTerm, longTerm)

CONSTRAINTS:
- No new analysis - only structure existing insights
- Every checklist item must map to investor concern
- Prioritization based on impact, not effort
- Be specific and actionable in checklist items
- EVERY score must show calculation method
- EVERY priority must justify its ranking
- Quantify impact wherever possible

CRITICAL: You MUST return EXACTLY this JSON structure. Do NOT add or remove fields.

EXACT JSON SCHEMA YOU MUST FOLLOW:
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
    "marketSizeAccessibility": {"score": <number>, "reasoning": {/* same structure */}},
    "solutionFitDifferentiation": {"score": <number>, "reasoning": {/* same structure */}},
    "businessModelClarity": {"score": <number>, "reasoning": {/* same structure */}},
    "competitiveDefensibility": {"score": <number>, "reasoning": {/* same structure */}},
    "narrativeCoherence": {"score": <number>, "reasoning": {/* same structure */}},
    "evidenceCredibility": {"score": <number>, "reasoning": {/* same structure */}},
    "overallInvestability": {
      "score": <number>,
      "reasoning": {
        "aggregationMethod": "<string>",
        "weightingRationale": "<string>",
        "nonLinearFactors": "<string>",
        "finalScoreLogic": "<string>"
      }
    }
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
    "fastestCredibilityWin": {
      "action": "<string>",
      "expectedImpact": "<string>",
      "reasoning": {
        "whyThisIsQuickest": "<string>",
        "evidenceOfValue": "<string>",
        "implementationReality": "<string>"
      }
    },
    "dangerousIllusions": [
      {
        "illusion": "<string>",
        "reality": "<string>",
        "reasoning": {
          "evidenceOfIllusion": "<string>",
          "consequencesOfIllusion": "<string>",
          "difficultyOfCorrection": "<string>"
        }
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
    "medium": [/* same structure as high */],
    "low": [/* same structure as high */],
    "prioritizationMethodology": {
      "impactCalculation": "<string>",
      "effortEstimation": "<string>",
      "tradeOffsConsidered": "<string>",
      "sequencingLogic": "<string>"
    }
  },
  "decisionLogic": {
    "decision": "pass|maybe|proceed",
    "reasoning": {
      "scoreThresholds": "<string>",
      "qualitativeFactors": "<string>",
      "edgeCaseHandling": "<string>",
      "decisionTree": "<string>"
    },
    "conditions": {
      "forPass": ["<string>"],
      "forMaybe": ["<string>"],
      "forProceed": ["<string>"]
    }
  },
  "improvementPotential": {
    "current": <number 0-10>,
    "target": <number 0-10>,
    "ceiling": <number 0-10>,
    "confidence": "low|medium|high",
    "reasoning": {
      "currentScoreCalculation": "<string>",
      "targetScoreLogic": "<string>",
      "ceilingAssumptions": "<string>",
      "confidenceDrivers": "<string>",
      "improvementRoadmap": {
        "quickWins": "<string>",
        "mediumTerm": "<string>",
        "longTerm": "<string>"
      },
      "realismCheck": "<string>"
    }
  }
}

Follow this EXACT structure. Every field must be present.`

  const userPrompt = `INVESTOR ANALYSIS FROM STAGE 1:

${JSON.stringify(stage1Output, null, 2)}

Generate the structured scorecard and prioritized checklist based on this analysis. Return your output as a JSON object with complete reasoning for all scores and decisions.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 3000, // Increased from 2000
  })

  const content = response.choices[0]?.message?.content || '{}'
  
  // Try to parse JSON with better error handling
  try {
    return JSON.parse(content) as Stage2Output
  } catch (parseError: any) {
    console.error('[Stage 2] JSON parse error:', parseError.message)
    console.error('[Stage 2] Content length:', content.length)
    console.error('[Stage 2] Content preview:', content.substring(0, 500))
    console.error('[Stage 2] Content end:', content.substring(content.length - 500))
    
    // Try to fix common JSON issues
    let fixedContent = content
    
    // Fix unterminated strings by adding closing quote and brace
    if (!content.trim().endsWith('}')) {
      console.log('[Stage 2] Attempting to fix unterminated JSON...')
      // Find the last complete field and close the JSON
      const lastCompleteField = content.lastIndexOf('",')
      if (lastCompleteField > 0) {
        fixedContent = content.substring(0, lastCompleteField + 2) + '\n}'
      }
    }
    
    try {
      return JSON.parse(fixedContent) as Stage2Output
    } catch (secondError) {
      console.error('[Stage 2] Could not fix JSON, returning minimal structure')
      // Return a minimal valid structure
      return {
        scorecard: {
          problemValidityUrgency: { score: 5, reasoning: 'Analysis incomplete due to JSON parsing error' },
          marketSizeAccessibility: { score: 5, reasoning: 'Analysis incomplete' },
          solutionFitDifferentiation: { score: 5, reasoning: 'Analysis incomplete' },
          businessModelClarity: { score: 5, reasoning: 'Analysis incomplete' },
          competitiveDefensibility: { score: 5, reasoning: 'Analysis incomplete' },
          narrativeCoherence: { score: 5, reasoning: 'Analysis incomplete' },
          evidenceCredibility: { score: 5, reasoning: 'Analysis incomplete' },
          overallInvestability: { score: 5, reasoning: 'Analysis incomplete' },
        },
        gapDiagnosis: {
          biggestValueGap: 'Analysis incomplete due to technical error',
          fastestCredibilityWin: 'Please try again',
          dangerousIllusions: [],
        },
        prioritizedChecklist: {
          high: ['Retry analysis for complete results'],
          medium: [],
          low: [],
        },
        decisionLogic: {
          decision: 'maybe',
          reasoning: 'Analysis incomplete',
          conditions: [],
        },
        improvementPotential: {
          current: 5,
          target: 7,
          ceiling: 9,
          confidence: 'low',
        },
      } as Stage2Output
    }
  }
}

async function runStage3(
  originalPitch: string,
  stage1Output: Stage1Output,
  stage2Output: Stage2Output
): Promise<Stage3Output> {
  const openai = getOpenAIClient()

  const systemPrompt = `You are a final validation engine that simulates the critical tests an experienced investor applies before deciding to take a pitch to partner meeting. Your role is to be the gatekeeper.

INPUT: 
- Original pitch deck content (slide-by-slide)
- Prioritized correction checklist from Prompt 2
- Investor analysis from Prompt 1

YOUR TASK: Run six critical investor tests and generate a final gate verdict that determines if this pitch passes to human review.

REASONING TRANSPARENCY REQUIREMENTS:
For EACH of the six tests, you must provide:
1. SCORING METHODOLOGY: Exact criteria used for scoring
2. EVIDENCE TRAIL: Specific deck elements that influenced the score
3. COMPARATIVE ANALYSIS: How this compares to typical decks
4. SCORE SENSITIVITY: What would change the score by ±2 points
5. CONFIDENCE LEVEL: How certain you are about this assessment

CRITICAL INVESTOR TESTS:

1. CONSISTENCY TEST (Score 0-10)
   - Do claims across slides contradict each other?
   - Are market size, TAM, and customer numbers aligned?
   - Does the financial model match the business model narrative?
   - Is the team's background consistent with the problem they're solving?
   
   Output must include reasoning: {scoringCriteria, evidenceChecked, contradictionsFound, alignmentAnalysis, scoreCalculation, confidenceLevel}

2. ASSUMPTION STRESS TEST (Score 0-10)
   - What single assumption, if wrong, kills the entire business?
   - Is this assumption validated or just hoped for?
   - How dependent is success on factors outside founder control?
   
   Output must include reasoning: {assumptionInventory, validationStatus, fatalityAnalysis, controlAnalysis, scoreCalculation, mitigationPossibility, confidenceLevel}

3. OBJECTION COVERAGE TEST (Score 0-10)
   - Does the deck preemptively address obvious investor objections?
   - Are competitive threats acknowledged and countered?
   - Is the "why now" question answered convincingly?
   
   Output must include reasoning: {expectedObjections, addressedObjections, missedObjections, coverageQuality, scoreCalculation, impactAssessment, confidenceLevel}

4. CLARITY UNDER PRESSURE TEST (Score 0-10)
   - If an investor only reads this for 30 seconds, what do they take away?
   - Is the core value proposition crystal clear?
   - Can someone explain this business to another investor in one sentence?
   
   Output must include reasoning: {clarityMetrics, cognitiveLoad, messageRetention, complexityAnalysis, scoreCalculation, improvementPotential, confidenceLevel}

5. MARKET BELIEVABILITY TEST (Score 0-10)
   - Are market size claims realistic or inflated?
   - Is the go-to-market strategy credible for this team?
   - Do customer acquisition assumptions pass the smell test?
   
   Output must include reasoning: {claimInventory, realismCheck, credibilityAssessment, skepticismTriggers, scoreCalculation, comparableData, confidenceLevel}

6. STORY COHERENCE TEST (Score 0-10)
   - Does the narrative flow logically from problem to solution to traction to ask?
   - Are there jarring transitions or missing logical steps?
   
   Output must include reasoning: {narrativeStructure, logicalFlow, transitionQuality, missingSteps, scoreCalculation, emotionalArc, confidenceLevel}

FINAL READINESS SCORING:
Calculate overall readiness (0-100) with complete transparency:
- testScores: all six test scores
- scoringMethodology: {weightingScheme, aggregationFormula, penaltyApplication, calibrationBenchmarks}
- overallReadiness: 0-100
- readinessBand: reject|weak|review|human_review_ready
- bandReasoning: {thresholdLogic, currentBandJustification, distanceToNextBand, confidenceInBand}

Readiness Bands:
- 0-40: "reject" - Not ready for investor time
- 41-60: "weak" - Needs major work before showing
- 61-75: "review" - Could get meeting but likely pass
- 76-100: "human_review_ready" - Worth partner discussion

INVESTOR GATE VERDICT:
Make final binary decision with complete reasoning:
- pass_human_review: true/false
- confidence_level: low|medium|high
- main_blocking_reason: specific reason if rejected
- verdictReasoning: {
    decisionLogic: {automaticFailTriggers, averageScoreAnalysis, exceptionalStrengths, fatalWeaknesses},
    confidenceAnalysis: {certaintyDrivers, edgeCaseConsiderations, informationGaps, confidenceCalibration},
    alternativeOutcomes: {ifPassedWhatRisks, ifRejectedWhatMissed, reversalConditions},
    investorTimeValue: {opportunityCost, expectedValue, timeInvestmentRequired, worthinessCalculation}
  }

DECISION LOGIC:
- ANY test score below 4 = automatic fail (explain which and why fatal)
- Average score below 6.5 = likely fail unless exceptional strength (explain exception if applies)
- Consistency and Assumption tests are weighted 2x (show this in calculation)
- "human_review_ready" band + no critical issues = pass (verify both conditions)
- When in doubt, err on side of rejection (explain doubt)

CONSTRAINTS:
- Be brutally honest - investor time is the scarcest resource
- Every score must have clear reasoning
- Critical issues must be specific and actionable
- No politeness - this is internal investor evaluation
- When uncertain, default to rejection
- Scores should reflect reality, not potential
- SHOW ALL CALCULATIONS - no black box scoring
- EXPLAIN EVERY THRESHOLD - why these numbers matter
- JUSTIFY EVERY WEIGHT - why some tests matter more

CALIBRATION EXAMPLES (with reasoning):
- Score 9-10: Top 5% of decks, clear path to funding
  Why: All tests pass, no critical issues, strong pattern match to funded companies
- Score 7-8: Solid deck, worth a meeting
  Why: Most tests pass, minor issues fixable, reasonable chance of investment
- Score 5-6: Interesting but needs work
  Why: Some tests fail, major gaps present, not ready for investor time yet
- Score 3-4: Fundamental issues present
  Why: Multiple test failures, critical assumptions unvalidated, high risk
- Score 0-2: Not ready for investor consideration
  Why: Severe problems across multiple dimensions, no clear path forward

CRITICAL: You MUST return EXACTLY this JSON structure. Do NOT add or remove fields.

EXACT JSON SCHEMA YOU MUST FOLLOW:
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
  "assumption_stress_test": {
    "score": <number 0-10>,
    "fatal_dependency": "<string or null>",
    "reasoning": {
      "assumptionInventory": ["<string>"],
      "validationStatus": "<string>",
      "fatalityAnalysis": "<string>",
      "controlAnalysis": "<string>",
      "scoreCalculation": "<string>",
      "mitigationPossibility": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
  "objection_coverage_test": {
    "score": <number 0-10>,
    "missed_high_impact_item": "<string or null>",
    "reasoning": {
      "expectedObjections": ["<string>"],
      "addressedObjections": ["<string>"],
      "missedObjections": ["<string>"],
      "coverageQuality": "<string>",
      "scoreCalculation": "<string>",
      "impactAssessment": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
  "clarity_under_pressure_test": {
    "score": <number 0-10>,
    "30s_takeaway": "<string>",
    "reasoning": {
      "clarityMetrics": "<string>",
      "cognitiveLoad": "<string>",
      "messageRetention": "<string>",
      "complexityAnalysis": "<string>",
      "scoreCalculation": "<string>",
      "improvementPotential": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
  "market_believability_test": {
    "score": <number 0-10>,
    "unconvincing_claim": "<string or null>",
    "reasoning": {
      "claimInventory": ["<string>"],
      "realismCheck": "<string>",
      "credibilityAssessment": "<string>",
      "skepticismTriggers": ["<string>"],
      "scoreCalculation": "<string>",
      "comparableData": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
  "story_coherence_test": {
    "score": <number 0-10>,
    "flow_break_point": "<string or null>",
    "reasoning": {
      "narrativeStructure": "<string>",
      "logicalFlow": "<string>",
      "transitionQuality": "<string>",
      "missingSteps": ["<string>"],
      "scoreCalculation": "<string>",
      "emotionalArc": "<string>",
      "confidenceLevel": "high|medium|low"
    }
  },
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
      "aggregationFormula": "<string: show exact calculation>",
      "penaltyApplication": "<string>",
      "calibrationBenchmarks": ["<string>"]
    },
    "score_0_to_100": <number 0-100>,
    "readiness_band": "reject|weak|review|human_review_ready",
    "bandReasoning": {
      "thresholdLogic": "<string>",
      "currentBandJustification": "<string>",
      "distanceToNextBand": "<string>",
      "confidenceInBand": "<string>"
    },
    "critical_issue_penalties": <boolean>
  },
  "investor_gate_verdict": {
    "pass_human_review": <boolean>,
    "confidence_level": "low|medium|high",
    "main_blocking_reason": "<string or null>",
    "verdictReasoning": {
      "decisionLogic": {
        "automaticFailTriggers": ["<string>"],
        "averageScoreAnalysis": "<string>",
        "exceptionalStrengths": ["<string>"],
        "fatalWeaknesses": ["<string>"]
      },
      "confidenceAnalysis": {
        "certaintyDrivers": ["<string>"],
        "edgeCaseConsiderations": "<string>",
        "informationGaps": ["<string>"],
        "confidenceCalibration": "<string>"
      },
      "alternativeOutcomes": {
        "ifPassedWhatRisks": "<string>",
        "ifRejectedWhatMissed": "<string>",
        "reversalConditions": "<string>"
      },
      "investorTimeValue": {
        "opportunityCost": "<string>",
        "expectedValue": "<string>",
        "timeInvestmentRequired": "<string>",
        "worthinessCalculation": "<string>"
      }
    }
  }
}

Follow this EXACT structure. Every field must be present. Use null for optional fields if not applicable.`

  const userPrompt = `ORIGINAL PITCH DECK:
${originalPitch}

INVESTOR ANALYSIS (STAGE 1):
${JSON.stringify(stage1Output, null, 2)}

PRIORITIZED CHECKLIST (STAGE 2):
${JSON.stringify(stage2Output.prioritizedChecklist, null, 2)}

Run the six critical investor tests and generate the final gate verdict. Return your analysis as a JSON object with complete reasoning for all tests and the final verdict.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 2000, // Increased from 1500
  })

  const content = response.choices[0]?.message?.content || '{}'
  
  try {
    return JSON.parse(content) as Stage3Output
  } catch (parseError: any) {
    console.error('[Stage 3] JSON parse error:', parseError.message)
    console.error('[Stage 3] Content length:', content.length)
    
    // Try to fix unterminated JSON
    let fixedContent = content
    if (!content.trim().endsWith('}')) {
      const lastCompleteField = content.lastIndexOf('",')
      if (lastCompleteField > 0) {
        fixedContent = content.substring(0, lastCompleteField + 2) + '\n}'
      }
    }
    
    try {
      return JSON.parse(fixedContent) as Stage3Output
    } catch (secondError) {
      console.error('[Stage 3] Could not fix JSON, returning minimal structure')
      throw new Error('Stage 3 analysis failed: Invalid JSON response from AI model')
    }
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('[analyze-pitch] Request started - Using PerfectPitch Three-Stage System')
  
  try {
    // 1. Verify User - FAST PATH
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[analyze-pitch] No auth header')
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]

    // Check Firebase Admin initialization immediately
    if (!isAdminInitialized() || !adminAuth) {
      console.error('[analyze-pitch] Firebase Admin not initialized')
      return NextResponse.json(
        { error: 'Authentication service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    console.log('[analyze-pitch] Starting token verification')
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await withTimeout(
        adminAuth.verifyIdToken(token),
        TIMEOUTS.FIREBASE_OPERATION,
        'Authentication timed out'
      ) as admin.auth.DecodedIdToken
      console.log(`[analyze-pitch] Token verified in ${Date.now() - startTime}ms`)
    } catch (e: any) {
      const elapsed = Date.now() - startTime
      if (e.message?.includes('timed out')) {
        console.error('='.repeat(80))
        console.error('[analyze-pitch] 504 TIMEOUT - AUTH TOKEN VERIFICATION:')
        console.error('='.repeat(80))
        console.error('Elapsed time:', elapsed, 'ms')
        console.error('Error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
        console.error('TIMEOUTS.FIREBASE_OPERATION:', TIMEOUTS.FIREBASE_OPERATION, 'ms')
        console.error('='.repeat(80))
        
        return NextResponse.json(
          { 
            error: 'Authentication timed out. Please try again.',
            details: {
              elapsed: elapsed,
              timeout: TIMEOUTS.FIREBASE_OPERATION
            }
          },
          { status: 504 }
        )
      }
      console.error("[analyze-pitch] Token verification failed:", e.message)
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const uid = decodedToken.uid

    // 2. Check Credits
    console.log('[analyze-pitch] Checking user credits')
    const creditCheck = await checkCredits(uid, 'pitch_analysis')
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: creditCheck.message,
          code: 'INSUFFICIENT_CREDITS',
          required: creditCheck.required,
          available: creditCheck.credits?.remaining || 0
        },
        { status: 403 }
      )
    }

    // Parse request body with timeout protection
    console.log('[analyze-pitch] Parsing request body')
    let body: any
    try {
      body = await withTimeout(
        request.json(),
        TIMEOUTS.FIREBASE_OPERATION,
        'Request body parsing timed out'
      )
    } catch (e: any) {
      const elapsed = Date.now() - startTime
      if (e.message?.includes('timed out')) {
        console.error('='.repeat(80))
        console.error('[analyze-pitch] 504 TIMEOUT - REQUEST BODY PARSING:')
        console.error('='.repeat(80))
        console.error('Elapsed time:', elapsed, 'ms')
        console.error('Error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
        console.error('TIMEOUTS.FIREBASE_OPERATION:', TIMEOUTS.FIREBASE_OPERATION, 'ms')
        console.error('='.repeat(80))
        
        return NextResponse.json(
          { 
            error: 'Request body too large or parsing timed out. Please try with smaller content.',
            details: {
              elapsed: elapsed,
              timeout: TIMEOUTS.FIREBASE_OPERATION
            }
          },
          { status: 504 }
        )
      }
      console.error('[analyze-pitch] Body parsing failed:', e.message)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    let { transcript, file_context, stage, industry, targetAudience, organizationId, programId } = body

    if (!transcript && !file_context) {
      console.log('[analyze-pitch] No input provided')
      return NextResponse.json(
        { error: 'No input provided (transcript or file)' },
        { status: 400 }
      )
    }

    // Combine transcript and file context without artificial truncation
    // Let OpenAI's token limits handle the constraints naturally
    const finalTranscript = file_context 
      ? (transcript ? `CONTEXT FROM DOCUMENTS:\n${file_context}\n\nREMAINING TRANSCRIPT:\n${transcript}` : file_context)
      : transcript

    // Run PerfectPitch Three-Stage Analysis
    console.log(`[analyze-pitch] Starting PerfectPitch three-stage analysis (elapsed: ${Date.now() - startTime}ms)`)
    
    const input: PerfectPitchInput = {
      pitchDeckContent: finalTranscript,
      stage,
      industry,
      targetInvestorType: targetAudience
    }

    // Stage 1: Core Reasoning & Investor Simulation
    console.log('[analyze-pitch] Running Stage 1: Investor Simulation...')
    const stage1 = await runStage1(input)
    console.log('[analyze-pitch] Stage 1 complete')

    // Stage 2: Decision Engine & Checklist Generator
    console.log('[analyze-pitch] Running Stage 2: Decision Engine...')
    const stage2 = await runStage2(stage1)
    console.log('[analyze-pitch] Stage 2 complete')

    // Stage 3: Final Investor Gate & Validation
    console.log('[analyze-pitch] Running Stage 3: Final Validation...')
    const stage3 = await runStage3(finalTranscript, stage1, stage2)
    console.log('[analyze-pitch] Stage 3 complete')

    const processingTime = Date.now() - startTime

    // Build metadata without undefined values
    const metadata: any = {
      analyzedAt: new Date().toISOString(),
      pitchDeckLength: finalTranscript.length,
      processingTimeMs: processingTime,
      userId: uid,
    }
    
    // Only add organizationId and programId if they exist
    if (organizationId) metadata.organizationId = organizationId
    if (programId) metadata.programId = programId

    const fullAnalysis: PerfectPitchAnalysis = {
      stage1,
      stage2,
      stage3,
      metadata,
    }

    console.log(`[analyze-pitch] PerfectPitch analysis complete in ${processingTime}ms`)

    // 3. Deduct credits on success (don't wait for it)
    const creditMetadata: any = { processingTime }
    if (organizationId) creditMetadata.organizationId = organizationId
    if (programId) creditMetadata.programId = programId
    
    useCredits(uid, 'pitch_analysis', creditMetadata).catch(err => {
      console.error('[analyze-pitch] Failed to deduct credits:', err)
    })

    return NextResponse.json(fullAnalysis)
  } catch (error: any) {
    const elapsed = Date.now() - startTime
    const isTimeout = error.message?.includes('timed out') || error.message?.includes('timeout')
    
    // Full logging for 504 errors
    if (isTimeout) {
      console.error('='.repeat(80))
      console.error('[analyze-pitch] 504 TIMEOUT ERROR - FULL DETAILS:')
      console.error('='.repeat(80))
      console.error('Elapsed time:', elapsed, 'ms')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
      console.error('Error code:', error.code)
      console.error('Error type:', error.type)
      console.error('Error status:', error.status)
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      console.error('TIMEOUTS.OPENAI_ANALYSIS:', TIMEOUTS.OPENAI_ANALYSIS, 'ms')
      console.error('MAX_CONTENT_LENGTH:', MAX_CONTENT_LENGTH)
      console.error('='.repeat(80))
      
      return NextResponse.json(
        { 
          error: 'Analysis timed out. Please try with shorter content or try again later.',
          details: {
            elapsed: elapsed,
            timeout: TIMEOUTS.OPENAI_ANALYSIS,
            error: error.message
          }
        },
        { status: 504 }
      )
    }

    // Log other errors too
    console.error(`[analyze-pitch] Error after ${elapsed}ms:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      type: error.type,
      status: error.status
    })

    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
