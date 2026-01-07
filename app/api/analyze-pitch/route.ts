import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { analyzePitchDeck } from '@/lib/aiAnalyzer'
import { adminAuth, isAdminInitialized } from '@/lib/admin'
import { checkUsage, incrementUsage } from '@/lib/limits'
import { withTimeout, TIMEOUTS, MAX_CONTENT_LENGTH } from '@/lib/timeout'

// Increase max duration for long-running analysis (Vercel/Netlify)
export const maxDuration = 300 // 5 minutes
export const runtime = 'nodejs'

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

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await withTimeout(
        adminAuth.verifyIdToken(token),
        TIMEOUTS.FIREBASE_OPERATION,
        'Authentication timed out'
      ) as admin.auth.DecodedIdToken
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

    // Parse request body with timeout protection
    let body: any
    try {
      body = await withTimeout(
        request.json(),
        TIMEOUTS.FIREBASE_OPERATION,
        'Request body parsing timed out'
      )
    } catch (e: any) {
      if (e.message?.includes('timed out')) {
        return NextResponse.json(
          { error: 'Request body too large or parsing timed out. Please try with smaller content.' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    let { transcript, file_context, stage, industry, targetAudience } = body

    if (!transcript && !file_context) {
      return NextResponse.json(
        { error: 'No input provided (transcript or file)' },
        { status: 400 }
      )
    }

    // Truncate content to prevent timeout - prioritize file_context for file-only mode
    if (file_context && file_context.length > MAX_CONTENT_LENGTH) {
      console.warn(`File context too long (${file_context.length} chars), truncating to ${MAX_CONTENT_LENGTH}`)
      file_context = file_context.substring(0, MAX_CONTENT_LENGTH) + '\n\n[CONTENT TRUNCATED - ANALYSIS BASED ON FIRST PORTION]'
    }
    
    if (transcript && transcript.length > MAX_CONTENT_LENGTH) {
      console.warn(`Transcript too long (${transcript.length} chars), truncating to ${MAX_CONTENT_LENGTH}`)
      transcript = transcript.substring(0, MAX_CONTENT_LENGTH) + '\n\n[TRANSCRIPT TRUNCATED - ANALYSIS BASED ON FIRST PORTION]'
    }

    // For file-only mode, use only file_context to avoid duplication
    const finalTranscript = file_context 
      ? (transcript ? `CONTEXT FROM DOCUMENTS:\n${file_context}\n\nREMAINING TRANSCRIPT:\n${transcript}` : file_context)
      : transcript

    // Combine transcript and file context with timeout
    const fullAnalysis = await withTimeout(
      analyzePitchDeck({
        transcript: finalTranscript,
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
