import OpenAI from 'openai'
import { SlideContent } from './pdfProcessor'
import { DeepAnalysisResult } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  try {
    // 1. Prepare Context
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

    // 2. Construct System Prompt
    const systemPrompt = `
You are a world-class Venture Capital Analyst and Pitch Coach (Partner level at Sequoia/a16z). 
You evaluate pitches using a strict "6-Pillar Framework" considering the startup's STAGE and INDUSTRY.

CONTEXT:
- Startup Stage: ${input.stage || 'Unknown (Assume Seed)'}
- Industry: ${input.industry || 'Unknown (Assume Tech/SaaS)'}
- Target Audience: ${input.targetAudience || 'Investors'}

Your goal is to provide a HARD-HITTING, SKEPTICAL, and ACTIONABLE audit. 
DO NOT be nice. Be accurate. If a Pre-Seed startup has no traction, that's fine, but if a Series A has no revenue, DESTROY existing score.

INPUT: A pitch transcript and/or slide text.

CRITICAL INSTRUCTION: 
- CROSS-REFERENCE the audio transcript with slide text. If the speaker says "We have $1M ARR" but slides show "$500k", FLAG IT as a contradiction.
- If the text is purely from a PDF (no audio), analyze the deck as a "Send-ahead Deck".

YOU MUST OUTPUT JSON matching the schema below.
LANGUAGE: All output MUST be in ENGLISH.

--- 6-PILLAR FRAMEWORK ---

1. **Structure (Structure Quality)**
   Evaluate based on ${input.stage || 'Seed'} expectations.
   Weights: Problem(15%), Solution(15%), Market(10%), Product(10%), BusinessModel(10%), Traction(10%), Team(5%), Ask(5%).
   
2. **Clarity**
   - Jargon/Buzzword check.
   - "Grandma Test": Could a non-expert understand?

3. **Logical Flow (Gaps & Contradictions)**
   - **CROSS-CHECK**: Did the speaker contradict the slides? 
   - Does the Ask match the Milestones?

4. **Persuasiveness (Skeptic Mode)**
   - Identify "Hand-waving" (claims without evidence).
   - Differentiation: Is it a real moat or just a feature?

5. **Audience Fit**
   - Is this right for ${input.targetAudience}?

6. **Final Score**
   - Be STRICT. A=Investable now. B=Meeting worthy. C=Keep in touch. D=Pass. F=Auto-delete.

--- JSON OUTPUT SCHEMA ---

{
  "overallScore": number,
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "summary": "Executive summary (English). Be direct.",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "risks": ["Major Risk 1 (e.g. Regulatory, Competition)", "Risk 2"],
  "actionItems": ["Action 1: Fix slide 3...", "Action 2: Clarify GTM..."],
  "assets": {
    "elevatorPitch": "A punchy 30-second version of this pitch.",
    "coldEmail": "A short, compelling cold email to an investor attaching this deck."
  },
  "pillars": {
    "structure": {
      "score": number,
      "breakdown": {
        "problem": { "present": boolean, "score": number, "feedback": "string" },
        "solution": { "present": boolean, "score": number, "feedback": "..." },
        "market": { "present": boolean, "score": number, "feedback": "..." },
        "product": { "present": boolean, "score": number, "feedback": "..." },
        "businessModel": { "present": boolean, "score": number, "feedback": "..." },
        "traction": { "present": boolean, "score": number, "feedback": "..." },
        "team": { "present": boolean, "score": number, "feedback": "..." },
        "ask": { "present": boolean, "score": number, "feedback": "..." }
      }
    },
    "clarity": {
      "score": number,
      "metrics": {
        "averageSentenceLength": "Short/Medium/Long",
        "buzzwordDensity": "Low/Medium/High",
        "definitionCoverage": "Good/Fair/Poor"
      },
      "feedback": ["..."]
    },
    "logic": {
      "flowScore": number,
      "gaps": ["Gap 1"],
      "contradictions": ["Contradiction 1 (e.g. Audio vs Slide mismatch)"]
    },
    "persuasion": {
      "score": number,
      "elements": {
        "evidenceBased": number,
        "differentiation": number,
        "urgency": number,
        "socialProof": number
      }
    },
    "audience": {
      "score": number,
      "fitAnalysis": "...",
      "investorReadiness": "Pre-Seed" | "Seed" | "Series A" | "Not Ready"
    }
  },
  "suggestedRewrite": "Improved elevator pitch paragraph",
  "investorQuestions": ["Killer Question 1", "Killer Question 2"]
}
`

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

    // 4. Call OpenAI with timeout protection
    const { withTimeout, TIMEOUTS } = await import('./timeout')
    
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o', // or gpt-4-turbo
        messages: conversationMessages,
        response_format: { type: 'json_object' },
        max_tokens: 3500,
        temperature: 0.5, // Lower temperature for more consistent scoring
        timeout: TIMEOUTS.OPENAI_ANALYSIS, // Set timeout
      } as any),
      TIMEOUTS.OPENAI_ANALYSIS,
      'AI analysis timed out. Please try again with shorter content.'
    )

    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content) as DeepAnalysisResult

    return parsed

  } catch (error: any) {
    console.error('Error in analyzePitchDeck:', error)
    // Return a dummy error object or rethrow
    // For now, rethrowing to be handled by route
    throw new Error(error.message || 'Failed to analyze pitch')
  }
}
