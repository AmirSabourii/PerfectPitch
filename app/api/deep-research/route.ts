import { NextRequest, NextResponse } from 'next/server'
import { performDeepResearch } from '@/lib/deepResearchAnalyzer'
import { IdeaSummary } from '@/lib/types'

export const maxDuration = 300 // 5 minutes for deep research

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

    // Perform deep research
    const result = await performDeepResearch(ideaSummary, language)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[deep-research] Error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to perform deep research',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
