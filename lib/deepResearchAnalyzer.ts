import OpenAI from 'openai'
import { 
  IdeaSummary, 
  DeepResearchResult,
  CompetitorAnalysis,
  TargetAudienceAnalysis,
  ValuePropositionAnalysis,
  MarketAnalysis,
  CompetitiveAdvantage,
  RisksAndChallenges,
  StrategicRecommendations
} from './types'

// Timeout for deep research (60 seconds per design)
const DEEP_RESEARCH_TIMEOUT = 60000

// Model used for deep research – gpt-4o-search-preview has built-in web search (Chat Completions); fallback gpt-4o if search model unavailable
const DEEP_RESEARCH_MODEL = process.env.DEEP_RESEARCH_MODEL || 'gpt-4o-search-preview'

// Lazily instantiate the OpenAI client
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

/**
 * Custom error class for deep research errors
 */
export class DeepResearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public retryable: boolean
  ) {
    super(message)
    this.name = 'DeepResearchError'
  }
}

/**
 * Map OpenAI errors to DeepResearchError
 */
function handleOpenAIError(error: any, language: 'en' | 'fa'): DeepResearchError {
  const messages = {
    en: {
      RATE_LIMIT: 'Too many requests. Please wait a few minutes and try again.',
      TIMEOUT: 'Analysis is taking longer than expected. Please try again.',
      AUTH_ERROR: 'Authentication failed. Please contact support.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      UNKNOWN_ERROR: 'Something went wrong. Please try again.'
    },
    fa: {
      RATE_LIMIT: 'درخواست‌های زیادی ارسال شده. لطفا چند دقیقه صبر کنید.',
      TIMEOUT: 'تحلیل بیش از حد معمول طول کشید. لطفا دوباره تلاش کنید.',
      AUTH_ERROR: 'خطای احراز هویت. لطفا با پشتیبانی تماس بگیرید.',
      NETWORK_ERROR: 'خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید.',
      UNKNOWN_ERROR: 'خطایی رخ داد. لطفا دوباره تلاش کنید.'
    }
  }
  
  const msg = messages[language]
  
  // Handle abort/timeout
  if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
    return new DeepResearchError(msg.TIMEOUT, 'TIMEOUT', 504, true)
  }
  
  // Handle rate limit
  if (error.status === 429) {
    return new DeepResearchError(msg.RATE_LIMIT, 'RATE_LIMIT', 429, true)
  }
  
  // Handle authentication
  if (error.status === 401) {
    return new DeepResearchError(msg.AUTH_ERROR, 'AUTH_ERROR', 401, false)
  }
  
  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new DeepResearchError(msg.NETWORK_ERROR, 'NETWORK_ERROR', 503, true)
  }
  
  // Unknown error
  return new DeepResearchError(msg.UNKNOWN_ERROR, 'UNKNOWN_ERROR', 500, true)
}

/**
 * Get localized system prompt for deep research
 */
function getSystemPrompt(language: 'en' | 'fa'): string {
  if (language === 'fa') {
    return `شما یک تحلیلگر تحقیقات بازار هستید. خروجی شما فقط یک آبجکت JSON با ساختار ثابت زیر است (کلیدها camelCase و انگلیسی؛ محتوا می‌تواند فارسی باشد).

ساختار اجباری (دقیقاً همین کلیدها):
- competitorAnalysis: { directCompetitors: [{name, description, strengths[], weaknesses[], differentiators[], pricing}], indirectCompetitors: [], marketPositioning }
- targetAudienceAnalysis: { personas: [{name, description, painPoints[], needs[], reasonsToUse[], willingnessToPay}], marketSize: {tam, sam, som, methodology}, adoptionBarriers[], adoptionDrivers[] }
- valuePropositionAnalysis: { coreValue, problemsSolved: [{problem, solution, priority, userImpact}], valueHierarchy[], recommendedMessaging[] }
- marketAnalysis: { marketSize: {tam, sam, som, methodology}, trends: [{trend, impact, timeframe, relevance}], opportunities[], threats: [{threat, severity, likelihood, mitigation}], growthProjection }
- competitiveAdvantage: { advantages: [{advantage, type, strength, explanation}], moat, sustainability, defensibility }
- risksAndChallenges: { risks: [{risk, category, probability, impact, mitigation}], challenges: [{challenge, difficulty, timeframe, approach}], mitigationStrategies[] }
- strategicRecommendations: { quickWins: [{title, description, rationale, expectedImpact, effort, timeframe, priority}], longTermInitiatives: [], priorityOrder[], keyMetrics[] }

فقط JSON معتبر برگردانید، بدون markdown.`
  }
  
  return `You are a business research analyst conducting deep market research. Your output MUST be a single JSON object that matches the structure below exactly (camelCase keys). This structure is required for the UI to display your analysis.

REQUIRED JSON STRUCTURE (follow exactly):

{
  "competitorAnalysis": {
    "directCompetitors": [{"name": "string", "description": "string", "strengths": ["string"], "weaknesses": ["string"], "differentiators": ["string"], "pricing": "string"}],
    "indirectCompetitors": [{"name": "string", "description": "string"}],
    "marketPositioning": "string"
  },
  "targetAudienceAnalysis": {
    "personas": [{"name": "string", "description": "string", "painPoints": ["string"], "needs": ["string"], "reasonsToUse": ["string"], "willingnessToPay": "string"}],
    "marketSize": {"tam": "string", "sam": "string", "som": "string", "methodology": "string"},
    "adoptionBarriers": ["string"],
    "adoptionDrivers": ["string"]
  },
  "valuePropositionAnalysis": {
    "coreValue": "string",
    "problemsSolved": [{"problem": "string", "solution": "string", "priority": "high|medium|low", "userImpact": "string"}],
    "valueHierarchy": ["string"],
    "recommendedMessaging": ["string"]
  },
  "marketAnalysis": {
    "marketSize": {"tam": "string", "sam": "string", "som": "string", "methodology": "string"},
    "trends": [{"trend": "string", "impact": "positive|negative|neutral", "timeframe": "string", "relevance": "string"}],
    "opportunities": [{"opportunity": "string", "potential": "high|medium|low", "timeToCapture": "string"}],
    "threats": [{"threat": "string", "severity": "high|medium|low", "likelihood": "high|medium|low", "mitigation": "string"}],
    "growthProjection": "string"
  },
  "competitiveAdvantage": {
    "advantages": [{"advantage": "string", "type": "technology|market|team|timing|other", "strength": "strong|moderate|weak", "explanation": "string"}],
    "moat": "string",
    "sustainability": "string",
    "defensibility": "string"
  },
  "risksAndChallenges": {
    "risks": [{"risk": "string", "category": "market|technical|financial|regulatory|competitive", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "string"}],
    "challenges": [{"challenge": "string", "difficulty": "high|medium|low", "timeframe": "string", "approach": "string"}],
    "mitigationStrategies": ["string"]
  },
  "strategicRecommendations": {
    "quickWins": [{"title": "string", "description": "string", "rationale": "string", "expectedImpact": "string", "effort": "low|medium|high", "timeframe": "string", "priority": number}],
    "longTermInitiatives": [{"title": "string", "description": "string", "rationale": "string", "expectedImpact": "string", "effort": "low|medium|high", "timeframe": "string", "priority": number}],
    "priorityOrder": ["string"],
    "keyMetrics": ["string"]
  }
}

Rules: Use only these top-level keys. Each nested object/array must follow the keys above. Return only valid JSON, no markdown or code fence. All text in English.`
}

/**
 * Build user prompt from idea summary
 */
function buildUserPrompt(ideaSummary: IdeaSummary, language: 'en' | 'fa'): string {
  if (language === 'fa') {
    return `
خلاصه ایده کسب‌وکار:
${ideaSummary.summary}

بیانیه مشکل:
${ideaSummary.problemStatement}

بیانیه راه‌حل:
${ideaSummary.solutionStatement}

بازار هدف:
${ideaSummary.targetMarket}

تمایز کلیدی:
${ideaSummary.keyDifferentiator}

لطفا تحقیق جامع انجام داده و تحلیل را در چارچوب مشخص شده ارائه دهید.
`
  }
  
  return `
BUSINESS IDEA SUMMARY:
${ideaSummary.summary}

PROBLEM STATEMENT:
${ideaSummary.problemStatement}

SOLUTION STATEMENT:
${ideaSummary.solutionStatement}

TARGET MARKET:
${ideaSummary.targetMarket}

KEY DIFFERENTIATOR:
${ideaSummary.keyDifferentiator}

Return a single JSON object with exactly these top-level keys (camelCase): competitorAnalysis, targetAudienceAnalysis, valuePropositionAnalysis, marketAnalysis, competitiveAdvantage, risksAndChallenges, strategicRecommendations. Each key must be an object (not a string). No other keys at the top level.
`
}

/** Map snake_case to camelCase for required top-level keys */
const DEEP_RESEARCH_KEY_MAP: Record<string, string> = {
  competitor_analysis: 'competitorAnalysis',
  target_audience_analysis: 'targetAudienceAnalysis',
  value_proposition_analysis: 'valuePropositionAnalysis',
  market_analysis: 'marketAnalysis',
  competitive_advantage: 'competitiveAdvantage',
  risks_and_challenges: 'risksAndChallenges',
  strategic_recommendations: 'strategicRecommendations',
}

/**
 * Normalize parsed JSON: ensure required camelCase keys exist (copy from snake_case if present)
 */
function normalizeDeepResearchParsed(parsed: any): any {
  const out = { ...parsed }
  for (const [snake, camel] of Object.entries(DEEP_RESEARCH_KEY_MAP)) {
    if (out[camel] == null && out[snake] != null && typeof out[snake] === 'object') {
      out[camel] = out[snake]
    }
  }
  return out
}

/**
 * Validate deep research result structure
 */
function validateDeepResearchResult(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = [
    'competitorAnalysis',
    'targetAudienceAnalysis',
    'valuePropositionAnalysis',
    'marketAnalysis',
    'competitiveAdvantage',
    'risksAndChallenges',
    'strategicRecommendations',
  ]

  for (const field of requiredFields) {
    if (!result[field] || typeof result[field] !== 'object') {
      errors.push(`Missing or invalid ${field}`)
    }
  }

  if (errors.length > 0) {
    console.log('[performDeepResearch] Parsed top-level keys:', Object.keys(result))
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Perform deep research analysis using o4-mini-deep-research model
 */
export async function performDeepResearch(
  ideaSummary: IdeaSummary,
  language: 'en' | 'fa' = 'en'
): Promise<Omit<DeepResearchResult, 'id' | 'userId'>> {
  const startTime = Date.now()
  console.log('[performDeepResearch] Starting deep research analysis')
  
  try {
    // Build prompts
    const systemPrompt = getSystemPrompt(language)
    const userPrompt = buildUserPrompt(ideaSummary, language)
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn(`[performDeepResearch] Aborting request after ${DEEP_RESEARCH_TIMEOUT}ms`)
      controller.abort()
    }, DEEP_RESEARCH_TIMEOUT)
    
    let response: any
    try {
      const openai = getOpenAIClient()
      
      console.log(`[performDeepResearch] Calling OpenAI model=${DEEP_RESEARCH_MODEL} (elapsed: ${Date.now() - startTime}ms)`)
      // Search-preview models don't support temperature; deep-research doesn't support response_format
      const isSearchPreview = DEEP_RESEARCH_MODEL.includes('search-preview') || DEEP_RESEARCH_MODEL.includes('search-api')
      const createOptions: Record<string, unknown> = {
        model: DEEP_RESEARCH_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
      }
      if (!isSearchPreview) {
        createOptions.temperature = 0.5
      }
      if (!DEEP_RESEARCH_MODEL.includes('deep-research')) {
        createOptions.response_format = { type: 'json_object' }
      }
      response = await openai.chat.completions.create(createOptions as any, {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      console.log(`[performDeepResearch] OpenAI responded in ${Date.now() - startTime}ms`)
      
    } catch (openaiError: any) {
      clearTimeout(timeoutId)
      console.error('[performDeepResearch] OpenAI error:', openaiError)
      throw handleOpenAIError(openaiError, language)
    }
    
    // Parse response (strip markdown code fence if present)
    let content = response.choices[0]?.message?.content || '{}'
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) content = jsonMatch[1].trim()

    let parsed: any
    try {
      parsed = JSON.parse(content)
      console.log(`[performDeepResearch] Response parsed successfully, keys:`, Object.keys(parsed))
    } catch (parseError: any) {
      console.error('[performDeepResearch] Failed to parse OpenAI response:', parseError)
      console.error('[performDeepResearch] Response content (first 800 chars):', content.substring(0, 800))
      throw new DeepResearchError(
        language === 'fa' 
          ? 'خطا در پردازش پاسخ تحلیل. لطفا دوباره تلاش کنید.'
          : 'Failed to parse analysis response. Please try again.',
        'PARSE_ERROR',
        500,
        true
      )
    }

    parsed = normalizeDeepResearchParsed(parsed)

    // Validate result structure
    const validation = validateDeepResearchResult(parsed)
    if (!validation.valid) {
      console.error('[performDeepResearch] Validation errors:', validation.errors)
      throw new DeepResearchError(
        language === 'fa'
          ? 'تحلیل ناقص دریافت شد. لطفا دوباره تلاش کنید.'
          : 'Incomplete analysis received. Please try again.',
        'VALIDATION_ERROR',
        500,
        true
      )
    }
    
    // Build complete result
    const result: Omit<DeepResearchResult, 'id' | 'userId'> = {
      ideaSummary,
      competitorAnalysis: parsed.competitorAnalysis,
      targetAudienceAnalysis: parsed.targetAudienceAnalysis,
      valuePropositionAnalysis: parsed.valuePropositionAnalysis,
      marketAnalysis: parsed.marketAnalysis,
      competitiveAdvantage: parsed.competitiveAdvantage,
      risksAndChallenges: parsed.risksAndChallenges,
      strategicRecommendations: parsed.strategicRecommendations,
      generatedAt: new Date().toISOString(),
      language
    }
    
    console.log(`[performDeepResearch] Deep research complete in ${Date.now() - startTime}ms`)
    
    return result
    
  } catch (error: any) {
    console.error('[performDeepResearch] Error:', error)
    
    // If already a DeepResearchError, rethrow
    if (error instanceof DeepResearchError) {
      throw error
    }
    
    // Otherwise wrap in DeepResearchError
    throw new DeepResearchError(
      error.message || (language === 'fa' ? 'خطا در تحقیق عمیق' : 'Deep research failed'),
      'UNKNOWN_ERROR',
      500,
      true
    )
  }
}
