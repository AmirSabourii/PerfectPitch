import { NextResponse } from 'next/server'
import { analyzePitchDeck } from '@/lib/aiAnalyzer'
import { adminAuth, isAdminInitialized } from '@/lib/admin'
import { checkUsage, incrementUsage } from '@/lib/limits'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]

    if (!isAdminInitialized() || !adminAuth) {
      console.error('Firebase Admin not initialized')
      return NextResponse.json(
        { error: 'Authentication service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    let decodedToken;
    try {
      decodedToken = await withTimeout(
        adminAuth.verifyIdToken(token),
        TIMEOUTS.FIREBASE_OPERATION,
        'Authentication timed out'
      )
    } catch (e: any) {
      console.error("Token verification failed:", e.message)
      if (e.message?.includes('timed out')) {
        return NextResponse.json(
          { error: 'Authentication timed out. Please try again.' },
          { status: 504 }
        )
      }
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const uid = decodedToken.uid

    // 2. Check Limits
    const limitCheck = await checkUsage(uid, 'analysis')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          code: 'LIMIT_REACHED',
          requiresUpgrade: true
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { transcript, file_context, stage, industry, targetAudience } = body

    if (!transcript && !file_context) {
      return NextResponse.json(
        { error: 'No input provided (transcript or file)' },
        { status: 400 }
      )
    }

    // Validate input size to prevent timeout
    const totalLength = (transcript?.length || 0) + (file_context?.length || 0)
    if (totalLength > 50000) {
      return NextResponse.json(
        { error: 'Input too long. Please reduce transcript or file content size.' },
        { status: 400 }
      )
    }

    // Combine transcript and file context with timeout
    const fullAnalysis = await withTimeout(
      analyzePitchDeck({
        transcript: file_context ? `CONTEXT FROM DOCUMENTS:\n${file_context}\n\nREMAINING TRANSCRIPT:\n${transcript}` : transcript,
        stage,
        industry,
        targetAudience
      }),
      TIMEOUTS.OPENAI_ANALYSIS,
      'Analysis timed out. Please try with shorter content or try again later.'
    )

    // 3. Increment usage on success (don't wait for it)
    incrementUsage(uid, 'analysis').catch(err => {
      console.error('Failed to increment usage:', err)
    })

    return NextResponse.json(fullAnalysis)
  } catch (error: any) {
    console.error('Error in analyze-pitch:', error.message)
    
    // Handle timeout errors
    if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Analysis timed out. Please try with shorter content or try again later.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
