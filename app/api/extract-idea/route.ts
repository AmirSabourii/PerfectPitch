import { NextRequest, NextResponse } from 'next/server'
import { extractIdeaSummary } from '@/lib/ideaSummaryExtractor'

export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript, documentContext } = body

    // If no content provided, try to use what we have or return error
    if (!transcript && !documentContext) {
      return NextResponse.json(
        { error: 'No content provided. Please upload a new pitch deck.' },
        { status: 400 }
      )
    }

    // Extract idea summary
    const summary = await extractIdeaSummary({
      transcript: transcript || '',
      slides: documentContext ? [{ pageNumber: 1, text: documentContext }] : undefined
    })

    return NextResponse.json(summary)

  } catch (error: any) {
    console.error('[extract-idea] Error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to extract idea summary' },
      { status: 500 }
    )
  }
}
