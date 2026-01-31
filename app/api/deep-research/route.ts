import { NextRequest, NextResponse } from 'next/server'
import { performDeepResearch, DeepResearchError } from '@/lib/deepResearchAnalyzer'
import { performTavilyDeepResearch } from '@/lib/tavilyDeepResearch'
import { IdeaSummary } from '@/lib/types'

export const maxDuration = 300 // 5 minutes for deep research (Tavily can take ~90s)

/** Use Tavily when TAVILY_API_KEY is set; fall back to OpenAI. Set DEEP_RESEARCH_PROVIDER=openai to force OpenAI. */
function useTavily(): boolean {
  const key = process.env.TAVILY_API_KEY?.trim()
  if (!key) return false
  if (process.env.DEEP_RESEARCH_PROVIDER === 'openai') return false
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ideaSummary, language = 'en' } = body as {
      ideaSummary: IdeaSummary
      language: 'en' | 'fa'
    }

    // Validate input
    if (!ideaSummary || !ideaSummary.summary) {
      return NextResponse.json(
        { error: 'Idea summary is required' },
        { status: 400 }
      )
    }

    // Perform deep research: Tavily (tested implementation) when key is set, else OpenAI
    const useTavilyProvider = useTavily()
    const result = useTavilyProvider
      ? await performTavilyDeepResearch(ideaSummary, language)
      : await performDeepResearch(ideaSummary, language)

    return NextResponse.json(result)
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; statusCode?: number }
    console.error('[deep-research] Error:', err)

    const statusCode =
      error instanceof DeepResearchError ? error.statusCode : err.statusCode ?? 500
    const message = err.message ?? 'Failed to perform deep research'
    const code = error instanceof DeepResearchError ? error.code : err.code ?? 'UNKNOWN_ERROR'

    return NextResponse.json(
      { error: message, code },
      { status: statusCode }
    )
  }
}
