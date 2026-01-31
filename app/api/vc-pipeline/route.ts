import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { adminAuth, isAdminInitialized } from '@/lib/admin'
import { checkCredits, useCredits } from '@/lib/limits'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'
import OpenAI from 'openai'
import { DeepResearchError } from '@/lib/deepResearchAnalyzer'
import { IdeaSummary } from '@/lib/types'
import {
  ExtractedPitchInput,
  DeepResearchOutput,
  PersonalityOutput,
  AdjudicatorOutput,
  VCPipelineResult,
  DIMENSION_KEYS,
} from '@/lib/vcPipelineTypes'
import { RISK_FIRST_SYSTEM, UPSIDE_FIRST_SYSTEM, ADJUDICATOR_SYSTEM } from '@/lib/vcPipelinePrompts'

export const maxDuration = 300

/** When request does not ask for real deep research, use hardcoded output (faster; no Tavily/GPT). */

/** Hardcoded deep research output used when SKIP_DEEP_RESEARCH is true. */
function getHardcodedDeepResearch(ideaSummary: IdeaSummary, language: 'en' | 'fa'): DeepResearchOutput {
  return {
    ideaSummary,
    competitorAnalysis: {
      directCompetitors: [{ name: 'Sample competitor', description: 'Placeholder for testing.', strengths: [], weaknesses: [], differentiators: [], pricing: '' }],
      indirectCompetitors: [],
      marketPositioning: 'Placeholder market positioning for pipeline test.',
    },
    targetAudienceAnalysis: {
      personas: [{ name: 'Target segment', description: 'Placeholder persona.', painPoints: [], needs: [], reasonsToUse: [], willingnessToPay: '' }],
      marketSize: { tam: '—', sam: '—', som: '—', methodology: '—' },
      adoptionBarriers: [],
      adoptionDrivers: [],
    },
    valuePropositionAnalysis: {
      coreValue: 'Placeholder value for testing.',
      problemsSolved: [],
      valueHierarchy: [],
      recommendedMessaging: [],
    },
    marketAnalysis: {
      marketSize: { tam: '—', sam: '—', som: '—', methodology: '—' },
      trends: [],
      opportunities: [],
      threats: [],
      growthProjection: '—',
    },
    competitiveAdvantage: {
      advantages: [],
      moat: '—',
      sustainability: '—',
      defensibility: '—',
    },
    risksAndChallenges: {
      risks: [],
      challenges: [],
      mitigationStrategies: [],
    },
    strategicRecommendations: {
      quickWins: [],
      longTermInitiatives: [],
      priorityOrder: [],
      keyMetrics: [],
    },
    generatedAt: new Date().toISOString(),
    language,
  }
}
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OPENAI_VC_PIPELINE_TIMEOUT = 120000 // 2 min per call

let cachedOpenAI: OpenAI | null = null
function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not configured.')
  if (!cachedOpenAI) cachedOpenAI = new OpenAI({ apiKey: key })
  return cachedOpenAI
}

function buildIdeaSummary(extracted: ExtractedPitchInput): IdeaSummary {
  return {
    summary: [extracted.problem, extracted.solution, extracted.market].filter(Boolean).join(' ').slice(0, 800) || 'No summary',
    problemStatement: extracted.problem || 'Not specified',
    solutionStatement: extracted.solution || 'Not specified',
    targetMarket: extracted.market || 'Not specified',
    keyDifferentiator: [extracted.competitors, extracted.additionalInfo].filter(Boolean).join(' ').slice(0, 400) || 'Not specified',
  }
}

function buildPitchContextForPersonalities(extracted: ExtractedPitchInput, deepResearchSummary: string): string {
  return `
PITCH DECK (structural context only — domain, stage, what they claim):
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

---
DEEP RESEARCH (primary source for your analysis — market data, competitors, risks, trends):
${deepResearchSummary}

Analyze from multiple angles. Use the research for real-world reasoning. Do NOT just summarize the deck.
`.trim()
}

function summarizeDeepResearchForAdjudicator(dr: DeepResearchOutput): string {
  const parts: string[] = []
  if (dr.competitorAnalysis) parts.push('Competitors: ' + JSON.stringify(dr.competitorAnalysis).slice(0, 1200))
  if (dr.targetAudienceAnalysis) parts.push('Target Audience: ' + JSON.stringify(dr.targetAudienceAnalysis).slice(0, 800))
  if (dr.marketAnalysis) parts.push('Market: ' + JSON.stringify(dr.marketAnalysis).slice(0, 1200))
  if (dr.competitiveAdvantage) parts.push('Competitive Advantage: ' + JSON.stringify(dr.competitiveAdvantage).slice(0, 600))
  if (dr.risksAndChallenges) parts.push('Risks: ' + JSON.stringify(dr.risksAndChallenges).slice(0, 1200))
  if (dr.strategicRecommendations) parts.push('Recommendations: ' + JSON.stringify(dr.strategicRecommendations).slice(0, 800))
  if (dr.valuePropositionAnalysis) parts.push('Value Prop: ' + JSON.stringify(dr.valuePropositionAnalysis).slice(0, 600))
  return parts.join('\n\n') || 'No research summary.'
}

/** Get message content as string; handle content as string or array of parts (reasoning models). */
function getMessageContent(message: { content?: unknown } | null | undefined): string {
  if (!message?.content) return '{}'
  const c = message.content
  if (typeof c === 'string') return c || '{}'
  if (Array.isArray(c)) {
    const parts = c
      .filter((p: any) => p && typeof p === 'object' && 'text' in p && typeof p.text === 'string')
      .map((p: any) => p.text as string)
    return parts.join('\n').trim() || '{}'
  }
  return '{}'
}

type PartialDimensionScore = {
  score?: number
  evidence?: string[]
  reasoning?: string
  whyNotHigher?: string
  whyNotLower?: string
  confidence?: string
}

/** Force PersonalityOutput to have all required keys; fill missing with empty/default. */
function ensureCompletePersonalityOutput(partial: Partial<PersonalityOutput> | null | undefined, _label: string): PersonalityOutput {
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
  const verdict = partial?.verdict === 'pass' || partial?.verdict === 'proceed' ? partial.verdict : 'maybe'
  const criticalRisks = Array.isArray(partial?.criticalRisks)
    ? partial.criticalRisks.map((r: { risk?: string; reasoning?: string; confidence?: string }) => ({
        risk: typeof r?.risk === 'string' ? r.risk : '',
        reasoning: typeof r?.reasoning === 'string' ? r.reasoning : '',
        confidence: typeof r?.confidence === 'string' ? r.confidence : '',
      }))
    : []
  const upsideDrivers = Array.isArray(partial?.upsideDrivers)
    ? partial.upsideDrivers.map((d: { driver?: string; reasoning?: string; confidence?: string }) => ({
        driver: typeof d?.driver === 'string' ? d.driver : '',
        reasoning: typeof d?.reasoning === 'string' ? d.reasoning : '',
        confidence: typeof d?.confidence === 'string' ? d.confidence : '',
      }))
    : []
  const chainOfReasoning = Array.isArray(partial?.chainOfReasoning)
    ? partial.chainOfReasoning.filter((s): s is string => typeof s === 'string')
    : []
  return {
    chainOfReasoning,
    dimensionScores,
    overallScore: typeof partial?.overallScore === 'number' ? partial.overallScore : 5,
    overallReasoning: typeof partial?.overallReasoning === 'string' ? partial.overallReasoning : '',
    verdict,
    verdictReasoning: typeof partial?.verdictReasoning === 'string' ? partial.verdictReasoning : '',
    criticalRisks,
    upsideDrivers,
    biasCheck: typeof partial?.biasCheck === 'string' ? partial.biasCheck : '',
  }
}

/** Build minimal valid PersonalityOutput when model returns empty/invalid (so pipeline can continue). */
function fallbackPersonalityOutput(label: string): PersonalityOutput {
  return ensureCompletePersonalityOutput(
    {
      overallReasoning: `Placeholder: ${label} model returned empty or invalid JSON.`,
      verdictReasoning: 'Placeholder used – model response was empty or invalid.',
      biasCheck: 'Placeholder (model response empty or invalid).',
    },
    label
  )
}

const ADJUDICATOR_SNAKE_TO_CAMEL: Record<string, string> = {
  chain_of_reasoning: 'chainOfReasoning',
  use_of_research: 'useOfResearch',
  prioritized_checklist: 'prioritizedChecklist',
  idea_improvements: 'ideaImprovements',
  pitch_improvements: 'pitchImprovements',
  final_score: 'finalScore',
  final_score_reasoning: 'finalScoreReasoning',
  final_verdict: 'finalVerdict',
  verdict_reasoning: 'verdictReasoning',
  bias_check: 'biasCheck',
  risk_first_view: 'riskFirstView',
  upside_first_view: 'upsideFirstView',
}

function normalizeAdjudicatorKeys(obj: unknown): Partial<AdjudicatorOutput> {
  if (obj == null || typeof obj !== 'object') return {}
  const raw = obj as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    const key = ADJUDICATOR_SNAKE_TO_CAMEL[k] ?? k
    out[key] = v
  }
  const agreement = Array.isArray(out.agreement)
    ? (out.agreement as Record<string, unknown>[]).map((a) => ({
        point: typeof a?.point === 'string' ? a.point : '',
        evidence: typeof a?.evidence === 'string' ? a.evidence : '',
      }))
    : []
  const disagreement = Array.isArray(out.disagreement)
    ? (out.disagreement as Record<string, unknown>[]).map((d) => ({
        topic: typeof d?.topic === 'string' ? d.topic : '',
        riskFirstView: typeof (d?.riskFirstView ?? (d as Record<string, unknown>).risk_first_view) === 'string' ? (d?.riskFirstView ?? (d as Record<string, unknown>).risk_first_view) as string : '',
        upsideFirstView: typeof (d?.upsideFirstView ?? (d as Record<string, unknown>).upside_first_view) === 'string' ? (d?.upsideFirstView ?? (d as Record<string, unknown>).upside_first_view) as string : '',
        resolution: typeof d?.resolution === 'string' ? d.resolution : '',
        reasoning: typeof d?.reasoning === 'string' ? d.reasoning : '',
      }))
    : []
  return {
    ...out,
    agreement,
    disagreement,
  } as Partial<AdjudicatorOutput>
}

/** Force AdjudicatorOutput to have all required keys; fill missing with empty/default. */
function ensureCompleteAdjudicatorOutput(partial: Partial<AdjudicatorOutput> | null | undefined): AdjudicatorOutput {
  const finalVerdict = partial?.finalVerdict === 'pass' || partial?.finalVerdict === 'proceed' ? partial.finalVerdict : 'maybe'
  const confidence = partial?.confidence === 'high' || partial?.confidence === 'low' ? partial.confidence : 'medium'
  const chainOfReasoning = Array.isArray(partial?.chainOfReasoning)
    ? partial.chainOfReasoning.filter((s): s is string => typeof s === 'string')
    : []
  const agreement = Array.isArray(partial?.agreement)
    ? partial.agreement.map((a) => ({
        point: typeof a?.point === 'string' ? a.point : '',
        evidence: typeof a?.evidence === 'string' ? a.evidence : '',
      }))
    : []
  const disagreement = Array.isArray(partial?.disagreement)
    ? partial.disagreement.map((d) => ({
        topic: typeof d?.topic === 'string' ? d.topic : '',
        riskFirstView: typeof d?.riskFirstView === 'string' ? d.riskFirstView : '',
        upsideFirstView: typeof d?.upsideFirstView === 'string' ? d.upsideFirstView : '',
        resolution: typeof d?.resolution === 'string' ? d.resolution : '',
        reasoning: typeof d?.reasoning === 'string' ? d.reasoning : '',
      }))
    : []
  const pc = partial?.prioritizedChecklist as Record<string, unknown> | undefined
  const ideaArr = Array.isArray(pc?.ideaImprovements) ? pc.ideaImprovements : Array.isArray((pc as any)?.idea_improvements) ? (pc as any).idea_improvements : []
  const pitchArr = Array.isArray(pc?.pitchImprovements) ? pc.pitchImprovements : Array.isArray((pc as any)?.pitch_improvements) ? (pc as any).pitch_improvements : []
  const ideaImprovements = ideaArr
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      priority: typeof x.priority === 'number' ? x.priority : 0,
      item: typeof x.item === 'string' ? x.item : '',
      reasoning: typeof x.reasoning === 'string' ? x.reasoning : undefined,
    }))
  const pitchImprovements = pitchArr
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      priority: typeof x.priority === 'number' ? x.priority : 0,
      item: typeof x.item === 'string' ? x.item : '',
      reasoning: typeof x.reasoning === 'string' ? x.reasoning : undefined,
    }))

  return {
    chainOfReasoning,
    agreement,
    disagreement,
    useOfResearch: typeof partial?.useOfResearch === 'string' ? partial.useOfResearch : '',
    finalScore: typeof partial?.finalScore === 'number' ? partial.finalScore : 5,
    finalScoreReasoning: typeof partial?.finalScoreReasoning === 'string' ? partial.finalScoreReasoning : '',
    finalVerdict,
    verdictReasoning: typeof partial?.verdictReasoning === 'string' ? partial.verdictReasoning : '',
    confidence,
    biasCheck: typeof partial?.biasCheck === 'string' ? partial.biasCheck : '',
    prioritizedChecklist: { ideaImprovements, pitchImprovements },
  }
}

/** Extract JSON string from raw model output (strip markdown, find first object). */
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

const PERSONALITY_SNAKE_TO_CAMEL: Record<string, string> = {
  chain_of_reasoning: 'chainOfReasoning',
  dimension_scores: 'dimensionScores',
  overall_score: 'overallScore',
  overall_reasoning: 'overallReasoning',
  verdict_reasoning: 'verdictReasoning',
  critical_risks: 'criticalRisks',
  upside_drivers: 'upsideDrivers',
  bias_check: 'biasCheck',
  problem_urgency: 'problemUrgency',
  market_size_timing: 'marketSizeTiming',
  solution_fit: 'solutionFit',
  business_model: 'businessModel',
  execution_team: 'executionTeam',
  risk_assumptions: 'riskAssumptions',
  traction_evidence: 'tractionEvidence',
  why_not_higher: 'whyNotHigher',
  why_not_lower: 'whyNotLower',
}

function normalizePersonalityKeys(obj: unknown): unknown {
  if (obj == null) return obj
  if (Array.isArray(obj)) return obj.map(normalizePersonalityKeys)
  if (typeof obj !== 'object') return obj
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = PERSONALITY_SNAKE_TO_CAMEL[k] ?? k
    out[key] = (key === 'dimensionScores' && v && typeof v === 'object' && !Array.isArray(v))
      ? normalizePersonalityKeys(v)
      : (key === 'criticalRisks' || key === 'upsideDrivers') && Array.isArray(v)
        ? v
        : (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date))
          ? normalizePersonalityKeys(v)
          : v
  }
  return out
}

function parsePersonalityResponse(raw: string, label: string): PersonalityOutput {
  const jsonStr = extractJsonFromRaw(raw)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    console.warn(`[vc-pipeline] ${label}: JSON parse failed, using fallback. Raw (first 500):`, raw.slice(0, 500))
    return fallbackPersonalityOutput(label)
  }
  const normalized = normalizePersonalityKeys(parsed) as Partial<PersonalityOutput>
  if (!normalized.dimensionScores && typeof normalized.overallScore !== 'number' && normalized.verdict === undefined) {
    console.warn(`[vc-pipeline] ${label}: missing dimensionScores/overallScore/verdict, using fallback. Raw (first 500):`, raw.slice(0, 500))
    return fallbackPersonalityOutput(label)
  }
  return ensureCompletePersonalityOutput(normalized, label)
}

async function runPersonality(
  pitchContext: string,
  systemPrompt: string,
  label: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.2,
  maxTokens: number = 6000
): Promise<PersonalityOutput> {
  const openai = getOpenAI()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_VC_PIPELINE_TIMEOUT)

  try {
    const supportsCustomTemp = !['gpt-4o-mini', 'gpt-4o'].includes(model)
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this pitch and return ONLY the required JSON object.\n\n${pitchContext}` },
      ],
      response_format: { type: 'json_object' },
      ...(supportsCustomTemp ? { temperature } : {}),
      max_completion_tokens: maxTokens,
    }, { signal: controller.signal })
    clearTimeout(timeoutId)
    const raw = getMessageContent(res.choices[0]?.message)
    return parsePersonalityResponse(raw, label)
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') throw new Error(`${label} timed out`)
    throw e
  }
}

async function runAdjudicator(
  deepResearchSummary: string,
  riskFirst: PersonalityOutput,
  upsideFirst: PersonalityOutput,
  model: string = 'gpt-4o',
  temperature: number = 0.1,
  maxTokens: number = 5000
): Promise<AdjudicatorOutput> {
  const openai = getOpenAI()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_VC_PIPELINE_TIMEOUT)

  const userContent = `
DEEP RESEARCH SUMMARY:
${deepResearchSummary}

RISK-FIRST ANALYST OUTPUT (JSON):
${JSON.stringify(riskFirst, null, 2)}

UPSIDE-FIRST ANALYST OUTPUT (JSON):
${JSON.stringify(upsideFirst, null, 2)}

Synthesize the above and return ONLY the required adjudicator JSON object.
`.trim()

  try {
    const supportsCustomTemp = !['gpt-4o-mini', 'gpt-4o'].includes(model)
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: ADJUDICATOR_SYSTEM },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      ...(supportsCustomTemp ? { temperature } : {}),
      max_completion_tokens: maxTokens,
    }, { signal: controller.signal })
    clearTimeout(timeoutId)
    const raw = getMessageContent(res.choices[0]?.message)
    const jsonStr = extractJsonFromRaw(raw)
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.warn('[vc-pipeline] Adjudicator: JSON parse failed, using empty completion. Raw (first 500):', raw.slice(0, 500))
      parsed = {}
    }
    const normalized = normalizeAdjudicatorKeys(parsed)
    return ensureCompleteAdjudicatorOutput(normalized)
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') throw new Error('Adjudicator timed out')
    throw e
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  if (!isAdminInitialized() || !admin.app()) {
    return NextResponse.json({ error: 'Server not configured for authentication' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  let decodedToken: admin.auth.DecodedIdToken
  try {
    decodedToken = await withTimeout(
      adminAuth.verifyIdToken(token),
      10000,
      'Authentication timed out'
    ) as admin.auth.DecodedIdToken
  } catch (e: any) {
    if (e.message?.includes('timed out')) {
      return NextResponse.json({ error: 'Authentication timed out' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
  }

  const uid = decodedToken.uid

  const creditCheck = await checkCredits(uid, 'pitch_analysis')
  if (!creditCheck.allowed) {
    return NextResponse.json(
      {
        error: creditCheck.message,
        code: 'INSUFFICIENT_CREDITS',
        required: creditCheck.required,
        available: creditCheck.credits?.remaining ?? 0,
      },
      { status: 403 }
    )
  }

  let body: {
    extractedData: ExtractedPitchInput
    contextData?: { stage?: string; industry?: string }
    language?: 'en' | 'fa'
    useDeepResearch?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { extractedData, contextData = {}, language = 'en' } = body
  const useDeepResearch = Boolean(body.useDeepResearch)
  if (!extractedData || typeof extractedData !== 'object') {
    return NextResponse.json({ error: 'extractedData is required (object from parse-doc / ExtractedDataReview)' }, { status: 400 })
  }

  const extracted: ExtractedPitchInput = {
    problem: String(extractedData.problem ?? ''),
    solution: String(extractedData.solution ?? ''),
    market: String(extractedData.market ?? ''),
    competitors: String(extractedData.competitors ?? ''),
    businessModel: String(extractedData.businessModel ?? ''),
    traction: String(extractedData.traction ?? ''),
    team: String(extractedData.team ?? ''),
    financials: String(extractedData.financials ?? ''),
    ask: String(extractedData.ask ?? ''),
    stage: String(extractedData.stage ?? contextData.stage ?? ''),
    industry: String(extractedData.industry ?? contextData.industry ?? ''),
    additionalInfo: String(extractedData.additionalInfo ?? ''),
  }

  try {
    const ideaSummary = buildIdeaSummary(extracted)

    // 1. Deep Research – real (Tavily/GPT) when useDeepResearch is true; otherwise hardcoded for speed
    let deepResearch: DeepResearchOutput
    if (!useDeepResearch) {
      console.log('[vc-pipeline] Step 1: Deep Research (skipped – using hardcoded output)')
      deepResearch = getHardcodedDeepResearch(ideaSummary, language)
    } else {
      const { performDeepResearch } = await import('@/lib/deepResearchAnalyzer')
      const { performTavilyDeepResearch } = await import('@/lib/tavilyDeepResearch')
      const useTavily =
        !!process.env.TAVILY_API_KEY?.trim() &&
        process.env.DEEP_RESEARCH_PROVIDER !== 'openai'
      console.log('[vc-pipeline] Step 1: Deep Research (' + (useTavily ? 'Tavily' : 'GPT') + ')')
      const deepResearchRaw = useTavily
        ? await performTavilyDeepResearch(ideaSummary, language)
        : await performDeepResearch(ideaSummary, language)
      deepResearch = deepResearchRaw as unknown as DeepResearchOutput
    }
    const deepResearchSummary = summarizeDeepResearchForAdjudicator(deepResearch)
    const pitchContext = buildPitchContextForPersonalities(extracted, deepResearchSummary)

    // 2. Parallel: Risk-First and Upside-First – gpt-4o-mini for reliable JSON
    console.log('[vc-pipeline] Step 2: Risk-First + Upside-First (model: gpt-4o-mini)')
    const [riskFirst, upsideFirst] = await Promise.all([
      runPersonality(pitchContext, RISK_FIRST_SYSTEM, 'Risk-First', 'gpt-4o-mini', 0.2, 6000),
      runPersonality(pitchContext, UPSIDE_FIRST_SYSTEM, 'Upside-First', 'gpt-4o-mini', 0.2, 6000),
    ])

    // 3. Adjudicator – gpt-4o for synthesis quality
    console.log('[vc-pipeline] Step 3: Adjudicator (model: gpt-4o)')
    const adjudicator = await runAdjudicator(deepResearchSummary, riskFirst, upsideFirst, 'gpt-4o', 0.1, 5000)

    const result: VCPipelineResult = {
      deepResearch,
      riskFirst,
      upsideFirst,
      adjudicator,
      metadata: {
        analyzedAt: new Date().toISOString(),
        extractedStage: extracted.stage || undefined,
        extractedIndustry: extracted.industry || undefined,
      },
    }

    useCredits(uid, 'pitch_analysis', { processingTime: Date.now() - startTime }).catch((err) =>
      console.error('[vc-pipeline] Failed to deduct credits:', err)
    )

    return NextResponse.json(result)
  } catch (error: any) {
    const elapsed = Date.now() - startTime
    const isTimeout = error.message?.includes('timed out') || error.name === 'AbortError'
    console.error('[vc-pipeline] Error:', error.message ?? error, 'elapsed:', elapsed)
    if (isTimeout) {
      return NextResponse.json(
        { error: 'VC Pipeline timed out. Please try again.', details: { elapsed } },
        { status: 504 }
      )
    }
    const status =
      error instanceof DeepResearchError ? error.statusCode : 500
    return NextResponse.json(
      { error: error.message || 'VC Pipeline failed' },
      { status }
    )
  }
}
