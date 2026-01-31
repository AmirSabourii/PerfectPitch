/**
 * Test: Run Agent 1 (Risk-First VC) on HOMA pitch data and log the full output.
 * Run: npm test -- lib/__tests__/vcPipelineAgent1.test.ts
 * Requires OPENAI_API_KEY in env (e.g. from .env.local).
 */

import OpenAI from 'openai'
import { RISK_FIRST_SYSTEM } from '../vcPipelinePrompts'
import type { ExtractedPitchInput, PersonalityOutput } from '../vcPipelineTypes'
import { DIMENSION_KEYS } from '../vcPipelineTypes'

// ========== HOMA pitch data (from user) ==========
const HOMA_EXTRACTED: ExtractedPitchInput = {
  problem: `Buying furniture is high-stakes guesswork because, unlike clothes, you cannot 'try it on' in your home before buying. Current tools only provide inspiration and disconnect users from the reality of their own space. There is no easy way for an ordinary user to realistically visualize the final result.`,
  solution: `HOMA offers a 'Visual Decision Engine' that provides a virtual try-on room. It aims to eliminate guesswork by transforming uncertainty into confidence in 30 seconds through a visual decision. The solution is powered by GenAI (Generative AI), which, unlike older AR technologies, only requires a 2D photo (no 3D model needed). This enables skill-free realistic design, allowing users without design knowledge to upload a photo of their room and generate photo-realistic outputs. For the first time, AI understands real spaces, including light, scale, and material automatically, a capability that was not possible even 12 months prior. The user experience involves uploading a photo of their space to see how a product looks in their home, with options to change mood, item, and render.`,
  market: `The market is presented in Toman (Iranian currency).
- TAM (Total Addressable Market): 495,000 billion Toman
- SAM (Serviceable Available Market - Online Market): 42,465 billion Toman
- SOM (Serviceable Obtainable Market - HOMA's Share): 1,061 billion Toman`,
  competitors: `The competitive landscape is mapped on a matrix with 'Inspiration' (الهام بخشی) on the X-axis and 'Purchase Ability' (امکان خرید) on the Y-axis.
- Pinterest: High Inspiration, No Buy (Top-left quadrant)
- Legacy AR: Low Utility (Bottom-left quadrant)
- Digikala: High Buy, No Inspiration (Bottom-right quadrant)
- HOMA: Positioned in the top-right quadrant, offering 'Both Inspiration and Purchase, a complete and integrated experience' (هم الهام هم خرید، تجربه کامل و یکپارچه).
The deck states that current players offer only one part of the buying experience, and no one has integrated inspiration, visualization in real spaces, and purchase until now.`,
  businessModel: `HOMA has three revenue models:
1. Transaction Fee (Commission from Sales): A percentage of every successful purchase made after a 'try-on' in HOMA. This is described as HOMA's main growth and scalability model.
2. Premium Placement: For large brands that want special visibility in HOMA's designed sets, they pay a placement fee.
3. Pay-as-you-go: For stores and Instagram pages, they pay only for their usage, without monthly subscriptions or risk.`,
  traction: `The company is currently in the 'Validation' phase (Q1-Q2 of an 18-month vision).
- Current Status (Q1-Q2 Validation): MVP Try-On service, 20 active stores, 5,000 successful tests.
- Operational Readiness: Technical Passed, with 'Amir Kabir Store' successfully completing the beta phase.
- Waiting List (Q4 Launch): Diar Farsh, Homework Bedding, and Farshino are on the waiting list for Q4 launch.
- Future Growth (Q3-Q4): Aims for multi-product layouts, partnerships with big brands, and 20,000 product tests.
- Future Vision (2026): Complete design-to-buy chain, in-app purchase, full space design, and +100K monthly tests.`,
  team: `The team consists of two members:
1. Amirhossein Sharifi Nejad: Software Engineer, specializing in software development and AI.
2. Farid Lotfi Nejad: Architect and Computational Designer, specializing in architecture and computational design.
The team is described as a 'combination of technology and art'.`,
  financials: `Not specified in deck. The deck provides market size (TAM, SAM, SOM) but does not include specific revenue, burn rate, runway, or financial projections for HOMA.`,
  ask: `Not specified in deck.`,
  stage: `The company is in the 'Validation' stage (Q1-Q2 of their 18-month roadmap), having an MVP Try-On service and active stores.`,
  industry: `Tech/SaaS, Home Decor, Furniture, AI/Generative AI, E-commerce Visualization.`,
  additionalInfo: `The company's current focus (Phase 1: Try-On strategy) is on 'eliminating uncertainty for online buyers'. The long-term vision is an 'integrated design-to-buy chain'. The website is myhoma.ir and the contact email is homadiginext@gmail.com. The core promise is to 'turn guesswork into certainty' for home decoration purchases.`,
}

function buildPitchContext(extracted: ExtractedPitchInput, deepResearchSummary: string): string {
  return `
EXTRACTED PITCH DECK DATA:
Problem: ${extracted.problem}
Solution: ${extracted.solution}
Market: ${extracted.market}
Competitors: ${extracted.competitors}
Business Model: ${extracted.businessModel}
Traction: ${extracted.traction}
Team: ${extracted.team}
Financials: ${extracted.financials}
The Ask: ${extracted.ask}
Stage: ${extracted.stage}
Industry: ${extracted.industry}
Additional Info: ${extracted.additionalInfo}

DEEP RESEARCH SUMMARY (for context):
${deepResearchSummary}
`.trim()
}

function getMessageContent(message: { content?: unknown } | null | undefined): string {
  if (!message?.content) return '{}'
  const c = message.content
  if (typeof c === 'string') return c || '{}'
  if (Array.isArray(c)) {
    const parts = (c as Array<{ text?: string }>)
      .filter((p) => p && typeof p === 'object' && 'text' in p && typeof p.text === 'string')
      .map((p) => p.text as string)
    return parts.join('\n').trim() || '{}'
  }
  return '{}'
}

function extractJsonFromRaw(raw: string): string {
  let s = raw.trim()
  const codeFence = s.match(/^```(?:json)?\s*([\s\S]*?)```/)
  if (codeFence) s = codeFence[1].trim()
  const start = s.indexOf('{')
  if (start === -1) return raw
  let depth = 0
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') {
      depth--
      if (depth === 0) return s.slice(start, i + 1)
    }
  }
  return raw
}

type PartialDimensionScore = {
  score?: number
  evidence?: string[]
  reasoning?: string
  whyNotHigher?: string
  whyNotLower?: string
  confidence?: string
}

function ensureCompletePersonalityOutput(
  partial: Partial<PersonalityOutput> | null | undefined
): PersonalityOutput {
  const ds = (partial?.dimensionScores ?? {}) as Record<string, PartialDimensionScore | undefined>
  const dimensionScores = {} as PersonalityOutput['dimensionScores']
  for (const key of DIMENSION_KEYS) {
    const d = ds[key]
    dimensionScores[key] = {
      score: typeof d?.score === 'number' ? d.score : 5,
      evidence: Array.isArray(d?.evidence) ? d.evidence : [],
      reasoning: typeof d?.reasoning === 'string' ? d.reasoning : '',
      whyNotHigher: typeof d?.whyNotHigher === 'string' ? d.whyNotHigher : '',
      whyNotLower: typeof d?.whyNotLower === 'string' ? d.whyNotLower : '',
      confidence: d?.confidence === 'high' || d?.confidence === 'low' ? d.confidence : 'medium',
    }
  }
  const verdict =
    partial?.verdict === 'pass' || partial?.verdict === 'proceed' ? partial.verdict : 'maybe'
  return {
    dimensionScores,
    overallScore: typeof partial?.overallScore === 'number' ? partial.overallScore : 5,
    overallReasoning: typeof partial?.overallReasoning === 'string' ? partial.overallReasoning : '',
    verdict,
    verdictReasoning: typeof partial?.verdictReasoning === 'string' ? partial.verdictReasoning : '',
    criticalRisks: Array.isArray(partial?.criticalRisks) ? partial.criticalRisks : [],
    upsideDrivers: Array.isArray(partial?.upsideDrivers) ? partial.upsideDrivers : [],
    biasCheck: typeof partial?.biasCheck === 'string' ? partial.biasCheck : '',
  }
}

/** Shape test: ensure completion helpers produce full expected structure (no API). */
describe('VC Pipeline agents – shape (completion)', () => {
  it('ensureCompletePersonalityOutput returns full PersonalityOutput shape from empty input', () => {
    const result = ensureCompletePersonalityOutput({}, 'Test')
    expect(result).toHaveProperty('dimensionScores')
    expect(result).toHaveProperty('overallScore')
    expect(result).toHaveProperty('overallReasoning')
    expect(result).toHaveProperty('verdict')
    expect(result).toHaveProperty('verdictReasoning')
    expect(result).toHaveProperty('criticalRisks')
    expect(result).toHaveProperty('upsideDrivers')
    expect(result).toHaveProperty('biasCheck')
    expect(result.verdict).toMatch(/^(pass|maybe|proceed)$/)
    expect(typeof result.overallScore).toBe('number')
    for (const key of DIMENSION_KEYS) {
      expect(result.dimensionScores).toHaveProperty(key)
      const d = result.dimensionScores[key]
      expect(d).toHaveProperty('score')
      expect(d).toHaveProperty('evidence')
      expect(d).toHaveProperty('reasoning')
      expect(d).toHaveProperty('whyNotHigher')
      expect(d).toHaveProperty('whyNotLower')
      expect(d).toHaveProperty('confidence')
      expect(Array.isArray(d.evidence)).toBe(true)
      expect(d.confidence).toMatch(/^(high|medium|low)$/)
    }
    expect(Array.isArray(result.criticalRisks)).toBe(true)
    expect(Array.isArray(result.upsideDrivers)).toBe(true)
  })
})

describe('VC Pipeline Agent 1 (Risk-First)', () => {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim())

  it(
    'runs Risk-First agent on HOMA data and logs full output',
    async () => {
      if (!hasApiKey) {
        console.warn('Skipping: OPENAI_API_KEY not set')
        return
      }
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const deepResearchSummary = 'Placeholder for test – no deep research run.'
      const pitchContext = buildPitchContext(HOMA_EXTRACTED, deepResearchSummary)

      const res = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: RISK_FIRST_SYSTEM },
          {
            role: 'user',
            content: `Analyze this pitch and return ONLY the required JSON object.\n\n${pitchContext}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 4000,
      })

      const raw = getMessageContent(res.choices[0]?.message)
      const jsonStr = extractJsonFromRaw(raw)
      let parsed: Partial<PersonalityOutput>
      try {
        parsed = JSON.parse(jsonStr) as Partial<PersonalityOutput>
      } catch (e) {
        throw new Error('Risk-First: JSON parse failed. Raw (first 500): ' + raw.slice(0, 500))
      }
      const result = ensureCompletePersonalityOutput(parsed)

      // Show full output in terminal
      console.log('\n========== Agent 1 (Risk-First) output ==========')
      console.log(JSON.stringify(result, null, 2))
      console.log('==================================================\n')

      expect(result).toHaveProperty('dimensionScores')
      expect(result).toHaveProperty('overallScore')
      expect(result).toHaveProperty('verdict')
      expect(result.verdict).toMatch(/^(pass|maybe|proceed)$/)
      for (const key of DIMENSION_KEYS) {
        expect(result.dimensionScores).toHaveProperty(key)
        expect(result.dimensionScores[key]).toHaveProperty('score')
        expect(result.dimensionScores[key]).toHaveProperty('reasoning')
      }
    },
    hasApiKey ? 90_000 : 5_000
  )
})
