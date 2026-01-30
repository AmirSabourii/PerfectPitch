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

// Timeout for deep research (60 seconds as per design)
const DEEP_RESEARCH_TIMEOUT = 60000

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
    return `شما یک تحلیلگر تحقیقات بازار هستید که تحقیق عمیق درباره ایده‌های کسب‌وکار انجام می‌دهید.

وظیفه شما تحلیل یک ایده کسب‌وکار و ارائه تحقیق جامع در چارچوب زیر است:

1. تحلیل رقبا (Competitor Analysis)
   - شناسایی 3-5 رقیب مستقیم
   - تحلیل نقاط قوت، ضعف، قیمت‌گذاری
   - تعیین تمایزهای کلیدی

2. تحلیل کاربران هدف (Target Audience Analysis)
   - تعریف 2-3 persona کاربری
   - شناسایی pain points و نیازها
   - توضیح دلایل استفاده از محصول
   - تخمین اندازه بازار (TAM, SAM, SOM)

3. تحلیل ارزش پیشنهادی (Value Proposition Analysis)
   - شناسایی ارزش اصلی
   - لیست مشکلات حل شده با اولویت
   - توصیه استراتژی پیام‌رسانی

4. تحلیل بازار (Market Analysis)
   - تخمین TAM, SAM, SOM
   - شناسایی روندهای فعلی
   - لیست فرصت‌ها و تهدیدها
   - پیش‌بینی رشد

5. مزیت رقابتی (Competitive Advantage)
   - شناسایی مزایای کلیدی
   - ارزیابی پایداری و قابلیت دفاع

6. ریسک‌ها و چالش‌ها (Risks and Challenges)
   - لیست ریسک‌های اصلی با احتمال/تاثیر
   - شناسایی چالش‌های کلیدی
   - استراتژی‌های کاهش ریسک

7. توصیه‌های استراتژیک (Strategic Recommendations)
   - ارائه حداقل 5 توصیه عملی
   - جداسازی quick wins از ابتکارات بلندمدت
   - اولویت‌بندی بر اساس تاثیر و تلاش

خروجی باید JSON معتبر مطابق با schema باشد.
همه متن‌ها باید به فارسی باشند.`
  }
  
  return `You are a business research analyst conducting deep market research.

Your task is to analyze a business idea and provide comprehensive research in the following framework:

1. COMPETITOR ANALYSIS
   - Identify 3-5 direct competitors
   - Analyze strengths, weaknesses, pricing
   - Determine key differentiators

2. TARGET AUDIENCE ANALYSIS
   - Define 2-3 user personas
   - Identify pain points and needs
   - Explain reasons to use the product
   - Estimate market size (TAM, SAM, SOM)

3. VALUE PROPOSITION ANALYSIS
   - Identify core value
   - List problems solved with priorities
   - Recommend messaging strategy

4. MARKET ANALYSIS
   - Estimate TAM, SAM, SOM
   - Identify current trends
   - List opportunities and threats
   - Growth projection

5. COMPETITIVE ADVANTAGE
   - Identify key advantages
   - Assess sustainability and defensibility

6. RISKS AND CHALLENGES
   - List major risks with probability/impact
   - Identify key challenges
   - Mitigation strategies

7. STRATEGIC RECOMMENDATIONS
   - Provide 5+ actionable recommendations
   - Separate quick wins from long-term initiatives
   - Prioritize by impact and effort

Output must be valid JSON matching the DeepResearchResult schema.
All text should be in English.`
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

Please conduct comprehensive research and provide analysis in the specified framework.
`
}

/**
 * Validate deep research result structure
 */
function validateDeepResearchResult(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required top-level fields
  const requiredFields = [
    'competitorAnalysis',
    'targetAudienceAnalysis',
    'valuePropositionAnalysis',
    'marketAnalysis',
    'competitiveAdvantage',
    'risksAndChallenges',
    'strategicRecommendations'
  ]
  
  for (const field of requiredFields) {
    if (!result[field] || typeof result[field] !== 'object') {
      errors.push(`Missing or invalid ${field}`)
    }
  }
  
  // Relaxed validation - just check basic structure exists
  // Don't enforce strict counts as GPT-4o might not always follow exactly
  
  return {
    valid: errors.length === 0,
    errors
  }
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
      
      console.log(`[performDeepResearch] Calling OpenAI GPT-4o (elapsed: ${Date.now() - startTime}ms)`)
      
      response = await openai.chat.completions.create({
        model: 'gpt-4o', // Using GPT-4o for deep research
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }, {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      console.log(`[performDeepResearch] OpenAI responded in ${Date.now() - startTime}ms`)
      
    } catch (openaiError: any) {
      clearTimeout(timeoutId)
      console.error('[performDeepResearch] OpenAI error:', openaiError)
      throw handleOpenAIError(openaiError, language)
    }
    
    // Parse response
    const content = response.choices[0]?.message?.content || '{}'
    
    let parsed: any
    try {
      parsed = JSON.parse(content)
      console.log(`[performDeepResearch] Response parsed successfully`)
    } catch (parseError: any) {
      console.error('[performDeepResearch] Failed to parse OpenAI response:', parseError)
      console.error('[performDeepResearch] Response content:', content.substring(0, 500))
      throw new DeepResearchError(
        language === 'fa' 
          ? 'خطا در پردازش پاسخ تحلیل. لطفا دوباره تلاش کنید.'
          : 'Failed to parse analysis response. Please try again.',
        'PARSE_ERROR',
        500,
        true
      )
    }
    
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
