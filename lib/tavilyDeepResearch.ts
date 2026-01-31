/**
 * Deep Research using Tavily Research API (model: mini).
 * See: https://docs.tavily.com/documentation/api-reference/endpoint/research
 * Best practices: https://docs.tavily.com/documentation/best-practices/best-practices-research
 */

import { tavily } from '@tavily/core'
import type { IdeaSummary } from './types'
import type { DeepResearchResult } from './types'
import { DeepResearchError } from './deepResearchAnalyzer'

const TAVILY_RESEARCH_TIMEOUT_MS = 90_000
const TAVILY_POLL_INTERVAL_MS = 2_500

/** Output schema for Tavily Research – top level: properties + required; nested objects must also have properties (API requirement). */
const DEEP_RESEARCH_OUTPUT_SCHEMA = {
  properties: {
    competitorAnalysis: {
      type: 'object',
      description: 'Direct and indirect competitors, market positioning.',
      properties: {
        directCompetitors: { type: 'array', description: 'List of direct competitors.', items: { type: 'object', description: 'Competitor', properties: { name: { type: 'string', description: 'Name' }, description: { type: 'string', description: 'Description' } } } },
        indirectCompetitors: { type: 'array', description: 'List of indirect competitors.', items: { type: 'object', description: 'Competitor', properties: { name: { type: 'string', description: 'Name' }, description: { type: 'string', description: 'Description' } } } },
        marketPositioning: { type: 'string', description: 'Market positioning summary.' },
      },
    },
    targetAudienceAnalysis: {
      type: 'object',
      description: 'Personas, market size, adoption barriers and drivers.',
      properties: {
        personas: { type: 'array', description: 'Target audience personas.', items: { type: 'object', description: 'Persona', properties: { name: { type: 'string', description: 'Name' }, description: { type: 'string', description: 'Description' } } } },
        marketSize: { type: 'object', description: 'TAM, SAM, SOM.', properties: { tam: { type: 'string', description: 'TAM' }, sam: { type: 'string', description: 'SAM' }, som: { type: 'string', description: 'SOM' }, methodology: { type: 'string', description: 'Methodology' } } },
        adoptionBarriers: { type: 'array', description: 'Adoption barriers.', items: { type: 'string', description: 'Barrier' } },
        adoptionDrivers: { type: 'array', description: 'Adoption drivers.', items: { type: 'string', description: 'Driver' } },
      },
    },
    valuePropositionAnalysis: {
      type: 'object',
      description: 'Core value, problems solved, messaging.',
      properties: {
        coreValue: { type: 'string', description: 'Core value proposition.' },
        problemsSolved: { type: 'array', description: 'Problems and solutions.', items: { type: 'object', description: 'Problem/solution', properties: { problem: { type: 'string', description: 'Problem' }, solution: { type: 'string', description: 'Solution' } } } },
        valueHierarchy: { type: 'array', description: 'Value hierarchy.', items: { type: 'string', description: 'Value' } },
        recommendedMessaging: { type: 'array', description: 'Recommended messaging.', items: { type: 'string', description: 'Message' } },
      },
    },
    marketAnalysis: {
      type: 'object',
      description: 'Market size, trends, opportunities, threats, growth.',
      properties: {
        marketSize: { type: 'object', description: 'Market size.', properties: { tam: { type: 'string', description: 'TAM' }, sam: { type: 'string', description: 'SAM' }, som: { type: 'string', description: 'SOM' }, methodology: { type: 'string', description: 'Methodology' } } },
        trends: { type: 'array', description: 'Market trends.', items: { type: 'object', description: 'Trend', properties: { trend: { type: 'string', description: 'Trend' }, impact: { type: 'string', description: 'Impact' } } } },
        opportunities: { type: 'array', description: 'Opportunities.', items: { type: 'object', description: 'Opportunity', properties: { opportunity: { type: 'string', description: 'Opportunity' } } } },
        threats: { type: 'array', description: 'Threats.', items: { type: 'object', description: 'Threat', properties: { threat: { type: 'string', description: 'Threat' }, mitigation: { type: 'string', description: 'Mitigation' } } } },
        growthProjection: { type: 'string', description: 'Growth projection.' },
      },
    },
    competitiveAdvantage: {
      type: 'object',
      description: 'Advantages, moat, sustainability, defensibility.',
      properties: {
        advantages: { type: 'array', description: 'Competitive advantages.', items: { type: 'object', description: 'Advantage', properties: { advantage: { type: 'string', description: 'Advantage' }, explanation: { type: 'string', description: 'Explanation' } } } },
        moat: { type: 'string', description: 'Moat.' },
        sustainability: { type: 'string', description: 'Sustainability.' },
        defensibility: { type: 'string', description: 'Defensibility.' },
      },
    },
    risksAndChallenges: {
      type: 'object',
      description: 'Risks, challenges, mitigation strategies.',
      properties: {
        risks: { type: 'array', description: 'Risks.', items: { type: 'object', description: 'Risk', properties: { risk: { type: 'string', description: 'Risk' }, mitigation: { type: 'string', description: 'Mitigation' } } } },
        challenges: { type: 'array', description: 'Challenges.', items: { type: 'object', description: 'Challenge', properties: { challenge: { type: 'string', description: 'Challenge' }, approach: { type: 'string', description: 'Approach' } } } },
        mitigationStrategies: { type: 'array', description: 'Mitigation strategies.', items: { type: 'string', description: 'Strategy' } },
      },
    },
    strategicRecommendations: {
      type: 'object',
      description: 'Quick wins and long-term initiatives.',
      properties: {
        quickWins: { type: 'array', description: 'Quick wins.', items: { type: 'object', description: 'Quick win', properties: { title: { type: 'string', description: 'Title' }, description: { type: 'string', description: 'Description' } } } },
        longTermInitiatives: { type: 'array', description: 'Long-term initiatives.', items: { type: 'object', description: 'Initiative', properties: { title: { type: 'string', description: 'Title' }, description: { type: 'string', description: 'Description' } } } },
        priorityOrder: { type: 'array', description: 'Priority order.', items: { type: 'string', description: 'Priority' } },
        keyMetrics: { type: 'array', description: 'Key metrics.', items: { type: 'string', description: 'Metric' } },
      },
    },
  },
  required: [
    'competitorAnalysis',
    'targetAudienceAnalysis',
    'valuePropositionAnalysis',
    'marketAnalysis',
    'competitiveAdvantage',
    'risksAndChallenges',
    'strategicRecommendations',
  ],
} as const

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new DeepResearchError(
      'Tavily API key is not configured. Set TAVILY_API_KEY in your environment.',
      'AUTH_ERROR',
      401,
      false
    )
  }
  return tavily({ apiKey })
}

/**
 * Build research input per Tavily best practices: clear goal, details, direction.
 * https://docs.tavily.com/documentation/best-practices/best-practices-research
 */
function buildTavilyResearchInput(ideaSummary: IdeaSummary, language: 'en' | 'fa'): string {
  const summary = ideaSummary.summary
  const problem = ideaSummary.problemStatement
  const solution = ideaSummary.solutionStatement
  const market = ideaSummary.targetMarket
  const differentiator = ideaSummary.keyDifferentiator

  if (language === 'fa') {
    return `تحقیق بازار عمیق برای استارتاپ با این مشخصات انجام دهید و خروجی را دقیقاً مطابق schema درخواستی (JSON ساختاریافته) برگردانید.

خلاصه: ${summary}
مشکل: ${problem}
راه‌حل: ${solution}
بازار هدف: ${market}
تمایز کلیدی: ${differentiator}

خروجی باید شامل این بخش‌ها باشد: تحلیل رقبا (competitorAnalysis)، تحلیل مخاطب هدف (targetAudienceAnalysis)، تحلیل ارزش پیشنهادی (valuePropositionAnalysis)، تحلیل بازار (marketAnalysis)، مزیت رقابتی (competitiveAdvantage)، ریسک‌ها و چالش‌ها (risksAndChallenges)، توصیه‌های استراتژیک (strategicRecommendations). از داده‌های واقعی وب و منابع معتبر استفاده کنید.`
  }

  return `Conduct deep market research for a startup with the following profile. Return the result as structured JSON matching the requested output schema exactly.

Summary: ${summary}
Problem: ${problem}
Solution: ${solution}
Target market: ${market}
Key differentiator: ${differentiator}

Your report must include: competitor analysis (direct/indirect competitors, market positioning), target audience analysis (personas, market size TAM/SAM/SOM, adoption barriers and drivers), value proposition analysis (core value, problems solved, messaging), market analysis (size, trends, opportunities, threats, growth projection), competitive advantage (advantages, moat, sustainability, defensibility), risks and challenges (risks, challenges, mitigation strategies), strategic recommendations (quick wins, long-term initiatives, priority order, key metrics). Use real web data and credible sources. Cite where relevant.`
}

function normalizeParsed(parsed: any): any {
  const keyMap: Record<string, string> = {
    competitor_analysis: 'competitorAnalysis',
    target_audience_analysis: 'targetAudienceAnalysis',
    value_proposition_analysis: 'valuePropositionAnalysis',
    market_analysis: 'marketAnalysis',
    competitive_advantage: 'competitiveAdvantage',
    risks_and_challenges: 'risksAndChallenges',
    strategic_recommendations: 'strategicRecommendations',
  }
  const out = { ...parsed }
  for (const [snake, camel] of Object.entries(keyMap)) {
    if (out[camel] == null && out[snake] != null && typeof out[snake] === 'object') {
      out[camel] = out[snake]
    }
  }
  return out
}

function validateResult(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const required = [
    'competitorAnalysis',
    'targetAudienceAnalysis',
    'valuePropositionAnalysis',
    'marketAnalysis',
    'competitiveAdvantage',
    'risksAndChallenges',
    'strategicRecommendations',
  ]
  for (const field of required) {
    if (!result[field] || typeof result[field] !== 'object') {
      errors.push(`Missing or invalid ${field}`)
    }
  }
  return { valid: errors.length === 0, errors }
}

/** Normalize Tavily/minimal API shape to full DeepResearchResult shape so UI and types are satisfied. */
function normalizeToDeepResearchShape(
  parsed: Record<string, any>,
  ideaSummary: IdeaSummary,
  language: 'en' | 'fa'
): Omit<DeepResearchResult, 'id' | 'userId'> {
  const arr = (x: unknown) => (Array.isArray(x) ? x : [])
  const str = (x: unknown) => (typeof x === 'string' ? x : '')
  const obj = (x: unknown) => (x && typeof x === 'object' ? (x as Record<string, unknown>) : {})

  const ca = obj(parsed.competitorAnalysis)
  const direct = arr(ca.directCompetitors).map((c: any) => ({
    name: str(c?.name),
    description: str(c?.description),
    strengths: arr(c?.strengths),
    weaknesses: arr(c?.weaknesses),
    differentiators: arr(c?.differentiators),
    pricing: c?.pricing != null ? str(c.pricing) : '',
  }))
  const indirect = arr(ca.indirectCompetitors).map((c: any) => ({
    name: str(c?.name),
    description: str(c?.description),
    strengths: [] as string[],
    weaknesses: [] as string[],
    differentiators: [] as string[],
    pricing: '',
  }))
  const competitorAnalysis = {
    directCompetitors: direct,
    indirectCompetitors: indirect,
    competitiveMatrix: obj(ca.competitiveMatrix).features
      ? (ca.competitiveMatrix as any)
      : { features: [], comparison: {} },
    marketPositioning: str(ca.marketPositioning),
  }

  const ta = obj(parsed.targetAudienceAnalysis)
  const personas = arr(ta.personas).map((p: any) => ({
    name: str(p?.name),
    description: str(p?.description),
    demographics: str(p?.demographics),
    painPoints: arr(p?.painPoints),
    needs: arr(p?.needs),
    reasonsToUse: arr(p?.reasonsToUse),
    willingnessToPay: str(p?.willingnessToPay),
  }))
  const ms = obj(ta.marketSize)
  const targetAudienceAnalysis = {
    personas,
    marketSize: {
      tam: str(ms.tam),
      sam: str(ms.sam),
      som: str(ms.som),
      methodology: str(ms.methodology),
    },
    adoptionBarriers: arr(ta.adoptionBarriers),
    adoptionDrivers: arr(ta.adoptionDrivers),
  }

  const vp = obj(parsed.valuePropositionAnalysis)
  const valuePropositionAnalysis = {
    coreValue: str(vp.coreValue),
    problemsSolved: arr(vp.problemsSolved).map((ps: any) => ({
      problem: str(ps?.problem),
      solution: str(ps?.solution),
      priority: (ps?.priority === 'high' || ps?.priority === 'medium' || ps?.priority === 'low' ? ps.priority : 'medium') as 'high' | 'medium' | 'low',
      userImpact: str(ps?.userImpact),
    })),
    valueHierarchy: arr(vp.valueHierarchy),
    recommendedMessaging: arr(vp.recommendedMessaging),
  }

  const ma = obj(parsed.marketAnalysis)
  const maSize = obj(ma.marketSize)
  const marketAnalysis = {
    marketSize: { tam: str(maSize.tam), sam: str(maSize.sam), som: str(maSize.som), methodology: str(maSize.methodology) },
    trends: arr(ma.trends).map((t: any) => ({
      trend: str(t?.trend),
      impact: (t?.impact === 'positive' || t?.impact === 'negative' ? t.impact : 'neutral') as 'positive' | 'negative' | 'neutral',
      timeframe: str(t?.timeframe),
      relevance: str(t?.relevance),
    })),
    opportunities: arr(ma.opportunities).map((o: any) => ({
      opportunity: str(o?.opportunity),
      potential: (o?.potential === 'high' || o?.potential === 'medium' || o?.potential === 'low' ? o.potential : 'medium') as 'high' | 'medium' | 'low',
      timeToCapture: str(o?.timeToCapture),
      requiredResources: arr(o?.requiredResources),
    })),
    threats: arr(ma.threats).map((t: any) => ({
      threat: str(t?.threat),
      severity: (t?.severity === 'high' || t?.severity === 'medium' || t?.severity === 'low' ? t.severity : 'medium') as 'high' | 'medium' | 'low',
      likelihood: (t?.likelihood === 'high' || t?.likelihood === 'medium' || t?.likelihood === 'low' ? t.likelihood : 'medium') as 'high' | 'medium' | 'low',
      mitigation: str(t?.mitigation),
    })),
    growthProjection: str(ma.growthProjection),
  }

  const adv = obj(parsed.competitiveAdvantage)
  const competitiveAdvantage = {
    advantages: arr(adv.advantages).map((a: any) => ({
      advantage: str(a?.advantage),
      type: (a?.type && ['technology', 'market', 'team', 'timing', 'other'].includes(a.type) ? a.type : 'other') as 'technology' | 'market' | 'team' | 'timing' | 'other',
      strength: (a?.strength === 'strong' || a?.strength === 'moderate' || a?.strength === 'weak' ? a.strength : 'moderate') as 'strong' | 'moderate' | 'weak',
      explanation: str(a?.explanation),
    })),
    moat: str(adv.moat),
    sustainability: str(adv.sustainability),
    defensibility: str(adv.defensibility),
  }

  const rc = obj(parsed.risksAndChallenges)
  const risksAndChallenges = {
    risks: arr(rc.risks).map((r: any) => ({
      risk: str(r?.risk),
      category: (r?.category && ['market', 'technical', 'financial', 'regulatory', 'competitive'].includes(r.category) ? r.category : 'market') as 'market' | 'technical' | 'financial' | 'regulatory' | 'competitive',
      probability: (r?.probability === 'high' || r?.probability === 'medium' || r?.probability === 'low' ? r.probability : 'medium') as 'high' | 'medium' | 'low',
      impact: (r?.impact === 'high' || r?.impact === 'medium' || r?.impact === 'low' ? r.impact : 'medium') as 'high' | 'medium' | 'low',
      mitigation: str(r?.mitigation),
    })),
    challenges: arr(rc.challenges).map((c: any) => ({
      challenge: str(c?.challenge),
      difficulty: (c?.difficulty === 'high' || c?.difficulty === 'medium' || c?.difficulty === 'low' ? c.difficulty : 'medium') as 'high' | 'medium' | 'low',
      timeframe: str(c?.timeframe),
      approach: str(c?.approach),
    })),
    mitigationStrategies: arr(rc.mitigationStrategies),
  }

  const sr = obj(parsed.strategicRecommendations)
  const rec = (list: any[]) =>
    arr(list).map((r: any) => ({
      title: str(r?.title),
      description: str(r?.description),
      rationale: str(r?.rationale),
      expectedImpact: str(r?.expectedImpact),
      effort: (r?.effort === 'low' || r?.effort === 'medium' || r?.effort === 'high' ? r.effort : 'medium') as 'low' | 'medium' | 'high',
      timeframe: str(r?.timeframe),
      priority: typeof r?.priority === 'number' ? r.priority : 0,
    }))
  const strategicRecommendations = {
    quickWins: rec(sr.quickWins),
    longTermInitiatives: rec(sr.longTermInitiatives),
    priorityOrder: arr(sr.priorityOrder),
    keyMetrics: arr(sr.keyMetrics),
  }

  return {
    ideaSummary,
    competitorAnalysis,
    targetAudienceAnalysis,
    valuePropositionAnalysis,
    marketAnalysis,
    competitiveAdvantage,
    risksAndChallenges,
    strategicRecommendations,
    generatedAt: new Date().toISOString(),
    language,
  }
}

/**
 * Perform deep research using Tavily Research API (model: mini).
 * Creates a research task, polls until completed/failed, then maps content to DeepResearchResult.
 */
export async function performTavilyDeepResearch(
  ideaSummary: IdeaSummary,
  language: 'en' | 'fa' = 'en'
): Promise<Omit<DeepResearchResult, 'id' | 'userId'>> {
  const startTime = Date.now()
  console.log('[performTavilyDeepResearch] Starting Tavily Research (model: mini)')

  try {
    const client = getTavilyClient()
    const input = buildTavilyResearchInput(ideaSummary, language)

    // Create research task (POST /research) – model "mini" per docs for targeted, efficient research
    const createRes = await client.research(input, {
      model: 'mini',
      stream: false,
      outputSchema: DEEP_RESEARCH_OUTPUT_SCHEMA as any,
      citationFormat: 'numbered',
    })

    const requestId = (createRes as any)?.requestId ?? (createRes as any)?.request_id
    if (!requestId) {
      console.error('[performTavilyDeepResearch] No request_id in create response:', createRes)
      throw new DeepResearchError(
        language === 'fa' ? 'پاسخ سرور تحقیق نامعتبر بود.' : 'Invalid research create response.',
        'PARSE_ERROR',
        500,
        true
      )
    }

    console.log('[performTavilyDeepResearch] Task created, requestId:', requestId, 'polling...')

    // Poll GET /research/{request_id} until completed or failed
    let result: any
    const deadline = startTime + TAVILY_RESEARCH_TIMEOUT_MS
    while (Date.now() < deadline) {
      result = await client.getResearch(requestId)
      const status = (result as any)?.status
      if (status === 'completed') break
      if (status === 'failed') {
        throw new DeepResearchError(
          language === 'fa' ? 'تحقیق Tavily با خطا متوقف شد.' : 'Tavily research task failed.',
          'VALIDATION_ERROR',
          500,
          true
        )
      }
      await new Promise((r) => setTimeout(r, TAVILY_POLL_INTERVAL_MS))
    }

    if (!result || (result as any).status !== 'completed') {
      throw new DeepResearchError(
        language === 'fa' ? 'زمان تحقیق تمام شد. لطفا دوباره تلاش کنید.' : 'Research timed out. Please try again.',
        'TIMEOUT',
        504,
        true
      )
    }

    let content = (result as any).content
    if (typeof content === 'string') {
      const trimmed = content.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
      try {
        content = JSON.parse(trimmed)
      } catch {
        throw new DeepResearchError(
          language === 'fa' ? 'خروجی تحقیق قابل تجزیه نبود.' : 'Failed to parse research output.',
          'PARSE_ERROR',
          500,
          true
        )
      }
    }

    if (!content || typeof content !== 'object') {
      throw new DeepResearchError(
        language === 'fa' ? 'خروجی تحقیق نامعتبر است.' : 'Invalid research output shape.',
        'VALIDATION_ERROR',
        500,
        true
      )
    }

    const parsed = normalizeParsed(content)
    const validation = validateResult(parsed)
    if (!validation.valid) {
      console.error('[performTavilyDeepResearch] Validation errors:', validation.errors)
      throw new DeepResearchError(
        language === 'fa' ? 'ساختار گزارش تحقیق ناقص است.' : 'Incomplete research report structure.',
        'VALIDATION_ERROR',
        500,
        true
      )
    }

    const deepResearchResult = normalizeToDeepResearchShape(parsed, ideaSummary, language)
    console.log('[performTavilyDeepResearch] Done in', Date.now() - startTime, 'ms')
    return deepResearchResult
  } catch (err: any) {
    if (err instanceof DeepResearchError) throw err
    if (err?.code === 'AUTH_ERROR' && typeof err?.statusCode === 'number') throw err
    console.error('[performTavilyDeepResearch] Error:', err)
    const message =
      language === 'fa'
        ? 'خطا در تحقیق Tavily. لطفا دوباره تلاش کنید.'
        : err?.message || 'Tavily deep research failed.'
    throw new DeepResearchError(message, 'UNKNOWN_ERROR', 500, true)
  }
}
