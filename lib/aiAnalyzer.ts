import OpenAI from 'openai'
import { SlideContent } from './pdfProcessor'
import { DeepAnalysisResult } from './types'
import { TIMEOUTS } from './timeout'

// Lazily instantiate the OpenAI client so builds don't require the env var
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

// --- Interfaces ---
// Moved to lib/types.ts

// --- Main Function ---

export async function analyzePitchDeck(
  input: {
    slides?: SlideContent[]
    transcript?: string
    images?: string[]
    stage?: string // New
    industry?: string // New
    targetAudience?: string // New
  }
): Promise<DeepAnalysisResult> {
  const startTime = Date.now()
  console.log('[analyzePitchDeck] Starting analysis')
  
  try {
    // 1. Prepare Context
    let contentContext = ''

    // Truncate transcript if too long (additional safety check)
    const MAX_TRANSCRIPT_LENGTH = 8000 // Reduced for Netlify FREE TIER (10s limit)
    let processedTranscript = input.transcript
    if (processedTranscript && processedTranscript.length > MAX_TRANSCRIPT_LENGTH) {
      console.warn(`[analyzePitchDeck] Transcript too long (${processedTranscript.length} chars), truncating`)
      processedTranscript = processedTranscript.substring(0, MAX_TRANSCRIPT_LENGTH) + '\n\n[CONTENT TRUNCATED]'
    }

    if (processedTranscript) {
      contentContext += `TRANSCRIPT:\n${processedTranscript}\n\n`
    }

    if (input.slides && input.slides.length > 0) {
      const slidesText = input.slides
        .map((slide) => `Slide ${slide.pageNumber}:\n${slide.text}`)
        .join('\n---\n')
      // Truncate slides if too long
      const MAX_SLIDES_LENGTH = 8000 // Reduced for Netlify FREE TIER (10s limit)
      const finalSlidesText = slidesText.length > MAX_SLIDES_LENGTH 
        ? slidesText.substring(0, MAX_SLIDES_LENGTH) + '\n\n[SLIDES CONTENT TRUNCATED]'
        : slidesText
      contentContext += `SLIDES CONTENT:\n${finalSlidesText}\n\n`
    }

    // 2. Construct System Prompt (Simplified for lighter model)
    const stage = input.stage || 'Seed'
    const industry = input.industry || 'Tech/SaaS'
    const audience = input.targetAudience || 'Investors'
    
    const systemPrompt = `VC Analyst evaluating pitch. Stage: ${stage}, Industry: ${industry}, Audience: ${audience}. 
Be skeptical and direct. Check for contradictions between transcript and slides.

6-Pillar Framework:
1. Structure: Problem(15%), Solution(15%), Market(10%), Product(10%), BusinessModel(10%), Traction(10%), Team(5%), Ask(5%)
2. Clarity: Jargon check, clarity test
3. Logic: Gaps, contradictions
4. Persuasion: Evidence, differentiation, urgency
5. Audience Fit: Right fit?
6. Score: A=Investable, B=Meeting, C=Keep in touch, D=Pass, F=Delete

Output JSON:
{
  "overallScore": number,
  "grade": "A"|"B"|"C"|"D"|"F",
  "summary": "Brief summary",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "risks": ["..."],
  "actionItems": ["..."],
  "assets": {"elevatorPitch": "...", "coldEmail": "..."},
  "pillars": {
    "structure": {"score": number, "breakdown": {"problem": {"present": bool, "score": number, "feedback": "..."}, "solution": {...}, "market": {...}, "product": {...}, "businessModel": {...}, "traction": {...}, "team": {...}, "ask": {...}}},
    "clarity": {"score": number, "metrics": {"averageSentenceLength": "Short/Medium/Long", "buzzwordDensity": "Low/Medium/High", "definitionCoverage": "Good/Fair/Poor"}, "feedback": ["..."]},
    "logic": {"flowScore": number, "gaps": ["..."], "contradictions": ["..."]},
    "persuasion": {"score": number, "elements": {"evidenceBased": number, "differentiation": number, "urgency": number, "socialProof": number}},
    "audience": {"score": number, "fitAnalysis": "...", "investorReadiness": "Pre-Seed"|"Seed"|"Series A"|"Not Ready"}
  },
  "suggestedRewrite": "...",
  "investorQuestions": ["..."]
}`

    // 3. Prepare Image Messages
    const conversationMessages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `PITCH CONTENT TO ANALYZE:\n${contentContext}` },
    ]

    if (input.images && input.images.length > 0) {
      // ... (keep logic for images if needed, though mostly for slides)
      const imageMessages = input.images.map((img) => ({
        type: 'image_url',
        image_url: { url: img },
      }))
      conversationMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Visuals from the pitch deck:' },
          ...imageMessages
        ]
      })
    }

    // 4. Call OpenAI with AbortController for timeout
    console.log(`[analyzePitchDeck] Calling OpenAI (elapsed: ${Date.now() - startTime}ms)`)
    
    // Create AbortController for request timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn(`[analyzePitchDeck] Aborting OpenAI request after ${TIMEOUTS.OPENAI_ANALYSIS}ms`)
      controller.abort()
    }, TIMEOUTS.OPENAI_ANALYSIS)
    
    let response: any
    try {
      const openai = getOpenAIClient()
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Lighter model for speed
        messages: conversationMessages,
        response_format: { type: 'json_object' },
        max_tokens: 1500, // Reduced from 2000 for faster response on free tier
        temperature: 0.5,
      }, {
        signal: controller.signal, // Pass abort signal
      })
      clearTimeout(timeoutId)
      console.log(`[analyzePitchDeck] OpenAI responded in ${Date.now() - startTime}ms`)
    } catch (openaiError: any) {
      clearTimeout(timeoutId)
      console.error('[analyzePitchDeck] OpenAI error:', openaiError.message)
      
      // Handle abort/timeout
      if (openaiError.name === 'AbortError' || openaiError.code === 'ABORT_ERR') {
        throw new Error('AI analysis timed out. Please try with shorter content.')
      }
      
      // Handle OpenAI-specific errors
      if (openaiError.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.')
      }
      if (openaiError.status === 401) {
        throw new Error('OpenAI API key is invalid.')
      }
      throw new Error(`OpenAI API error: ${openaiError.message || 'Unknown error'}`)
    }

    const content = response.choices[0]?.message?.content || '{}'
    
    // Parse JSON with error handling
    let parsed: DeepAnalysisResult
    try {
      parsed = JSON.parse(content) as DeepAnalysisResult
      console.log(`[analyzePitchDeck] Analysis complete in ${Date.now() - startTime}ms`)
    } catch (parseError: any) {
      console.error('[analyzePitchDeck] Failed to parse OpenAI response:', parseError)
      console.error('[analyzePitchDeck] Response content:', content.substring(0, 500))
      throw new Error('Failed to parse AI analysis response. Please try again.')
    }

    return parsed

  } catch (error: any) {
    console.error('[analyzePitchDeck] Error:', error)
    // Rethrow with better error message
    throw new Error(error.message || 'Failed to analyze pitch')
  }
}
