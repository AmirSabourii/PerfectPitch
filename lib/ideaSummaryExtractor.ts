import OpenAI from 'openai'
import { SlideContent } from './pdfProcessor'
import { IdeaSummary } from './types'
import { TIMEOUTS } from './timeout'

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
 * Extract idea summary from pitch deck content for deep research analysis
 */
export async function extractIdeaSummary(
  input: {
    slides?: SlideContent[]
    transcript?: string
  }
): Promise<IdeaSummary> {
  const startTime = Date.now()
  console.log('[extractIdeaSummary] Starting idea extraction')
  
  try {
    // 1. Prepare content
    let contentContext = ''
    
    if (input.transcript) {
      contentContext += `TRANSCRIPT:\n${input.transcript}\n\n`
    }
    
    if (input.slides && input.slides.length > 0) {
      const slidesText = input.slides
        .map((slide) => `Slide ${slide.pageNumber}:\n${slide.text}`)
        .join('\n---\n')
      contentContext += `SLIDES CONTENT:\n${slidesText}\n\n`
    }
    
    if (!contentContext.trim()) {
      throw new Error('No content provided for idea extraction')
    }
    
    // 2. System prompt for idea extraction
    const systemPrompt = `You are a business analyst extracting the core idea from a pitch deck.

Your task is to analyze the pitch content and extract:
1. A 3-5 line summary of the core business idea
2. The problem statement (what problem is being solved)
3. The solution statement (how the product/service solves it)
4. The target market (who are the customers)
5. The key differentiator (what makes this unique)

Output must be valid JSON matching this schema:
{
  "summary": "3-5 line summary of the core idea",
  "problemStatement": "Clear description of the problem",
  "solutionStatement": "Clear description of the solution",
  "targetMarket": "Description of target customers/market",
  "keyDifferentiator": "What makes this unique or different"
}

Be concise and extract only the essential information.`
    
    // 3. Call OpenAI
    console.log(`[extractIdeaSummary] Calling OpenAI (elapsed: ${Date.now() - startTime}ms)`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn(`[extractIdeaSummary] Aborting OpenAI request after ${TIMEOUTS.OPENAI_ANALYSIS}ms`)
      controller.abort()
    }, TIMEOUTS.OPENAI_ANALYSIS)
    
    let response: any
    try {
      const openai = getOpenAIClient()
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `PITCH CONTENT:\n${contentContext}` }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.3,
      }, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      console.log(`[extractIdeaSummary] OpenAI responded in ${Date.now() - startTime}ms`)
    } catch (openaiError: any) {
      clearTimeout(timeoutId)
      console.error('[extractIdeaSummary] OpenAI error:', openaiError.message)
      
      if (openaiError.name === 'AbortError' || openaiError.code === 'ABORT_ERR') {
        throw new Error('Idea extraction timed out. Please try with shorter content.')
      }
      
      if (openaiError.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.')
      }
      if (openaiError.status === 401) {
        throw new Error('OpenAI API key is invalid.')
      }
      throw new Error(`OpenAI API error: ${openaiError.message || 'Unknown error'}`)
    }
    
    const content = response.choices[0]?.message?.content || '{}'
    
    // 4. Parse and validate JSON
    let parsed: IdeaSummary
    try {
      parsed = JSON.parse(content) as IdeaSummary
      console.log(`[extractIdeaSummary] Extraction complete in ${Date.now() - startTime}ms`)
    } catch (parseError: any) {
      console.error('[extractIdeaSummary] Failed to parse OpenAI response:', parseError)
      console.error('[extractIdeaSummary] Response content:', content.substring(0, 500))
      throw new Error('Failed to parse idea summary response. Please try again.')
    }
    
    // 5. Validate required fields
    if (!parsed.summary || !parsed.problemStatement || !parsed.solutionStatement || 
        !parsed.targetMarket || !parsed.keyDifferentiator) {
      throw new Error('Incomplete idea summary extracted. Missing required fields.')
    }
    
    return parsed
    
  } catch (error: any) {
    console.error('[extractIdeaSummary] Error:', error)
    throw new Error(error.message || 'Failed to extract idea summary')
  }
}
