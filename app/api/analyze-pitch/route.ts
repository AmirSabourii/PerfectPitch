import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { analyzePitchDeck } from '@/lib/aiAnalyzer'
import { adminAuth, isAdminInitialized } from '@/lib/admin'
import { checkUsage, incrementUsage } from '@/lib/limits'
import { withTimeout, TIMEOUTS, MAX_CONTENT_LENGTH } from '@/lib/timeout'

// Note: maxDuration only works on Vercel, not Netlify
// Netlify free tier: 10s, Pro tier: 26s
export const maxDuration = 300 // Ignored on Netlify
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('[analyze-pitch] Request started')
  
  try {
    // 1. Verify User - FAST PATH
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[analyze-pitch] No auth header')
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]

    // Check Firebase Admin initialization immediately
    if (!isAdminInitialized() || !adminAuth) {
      console.error('[analyze-pitch] Firebase Admin not initialized')
      return NextResponse.json(
        { error: 'Authentication service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    console.log('[analyze-pitch] Starting token verification')
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await withTimeout(
        adminAuth.verifyIdToken(token),
        TIMEOUTS.FIREBASE_OPERATION,
        'Authentication timed out'
      ) as admin.auth.DecodedIdToken
      console.log(`[analyze-pitch] Token verified in ${Date.now() - startTime}ms`)
    } catch (e: any) {
      const elapsed = Date.now() - startTime
      if (e.message?.includes('timed out')) {
        console.error('='.repeat(80))
        console.error('[analyze-pitch] 504 TIMEOUT - AUTH TOKEN VERIFICATION:')
        console.error('='.repeat(80))
        console.error('Elapsed time:', elapsed, 'ms')
        console.error('Error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
        console.error('TIMEOUTS.FIREBASE_OPERATION:', TIMEOUTS.FIREBASE_OPERATION, 'ms')
        console.error('='.repeat(80))
        
        return NextResponse.json(
          { 
            error: 'Authentication timed out. Please try again.',
            details: {
              elapsed: elapsed,
              timeout: TIMEOUTS.FIREBASE_OPERATION
            }
          },
          { status: 504 }
        )
      }
      console.error("[analyze-pitch] Token verification failed:", e.message)
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const uid = decodedToken.uid

    // 2. Check Limits
    console.log('[analyze-pitch] Checking usage limits')
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
    console.log('[analyze-pitch] Parsing request body')
    let body: any
    try {
      body = await withTimeout(
        request.json(),
        TIMEOUTS.FIREBASE_OPERATION,
        'Request body parsing timed out'
      )
    } catch (e: any) {
      const elapsed = Date.now() - startTime
      if (e.message?.includes('timed out')) {
        console.error('='.repeat(80))
        console.error('[analyze-pitch] 504 TIMEOUT - REQUEST BODY PARSING:')
        console.error('='.repeat(80))
        console.error('Elapsed time:', elapsed, 'ms')
        console.error('Error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
        console.error('TIMEOUTS.FIREBASE_OPERATION:', TIMEOUTS.FIREBASE_OPERATION, 'ms')
        console.error('='.repeat(80))
        
        return NextResponse.json(
          { 
            error: 'Request body too large or parsing timed out. Please try with smaller content.',
            details: {
              elapsed: elapsed,
              timeout: TIMEOUTS.FIREBASE_OPERATION
            }
          },
          { status: 504 }
        )
      }
      console.error('[analyze-pitch] Body parsing failed:', e.message)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    let { transcript, file_context, stage, industry, targetAudience } = body

    if (!transcript && !file_context) {
      console.log('[analyze-pitch] No input provided')
      return NextResponse.json(
        { error: 'No input provided (transcript or file)' },
        { status: 400 }
      )
    }

    // Truncate content to prevent timeout - prioritize file_context for file-only mode
    if (file_context && file_context.length > MAX_CONTENT_LENGTH) {
      console.warn(`[analyze-pitch] File context too long (${file_context.length} chars), truncating to ${MAX_CONTENT_LENGTH}`)
      file_context = file_context.substring(0, MAX_CONTENT_LENGTH) + '\n\n[CONTENT TRUNCATED - ANALYSIS BASED ON FIRST PORTION]'
    }
    
    if (transcript && transcript.length > MAX_CONTENT_LENGTH) {
      console.warn(`[analyze-pitch] Transcript too long (${transcript.length} chars), truncating to ${MAX_CONTENT_LENGTH}`)
      transcript = transcript.substring(0, MAX_CONTENT_LENGTH) + '\n\n[TRANSCRIPT TRUNCATED - ANALYSIS BASED ON FIRST PORTION]'
    }

    // For file-only mode, use only file_context to avoid duplication
    const finalTranscript = file_context 
      ? (transcript ? `CONTEXT FROM DOCUMENTS:\n${file_context}\n\nREMAINING TRANSCRIPT:\n${transcript}` : file_context)
      : transcript

    // Combine transcript and file context with timeout
    console.log(`[analyze-pitch] Starting AI analysis (elapsed: ${Date.now() - startTime}ms)`)
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

    console.log(`[analyze-pitch] Analysis complete in ${Date.now() - startTime}ms`)

    // 3. Increment usage on success (don't wait for it)
    incrementUsage(uid, 'analysis').catch(err => {
      console.error('[analyze-pitch] Failed to increment usage:', err)
    })

    return NextResponse.json(fullAnalysis)
  } catch (error: any) {
    const elapsed = Date.now() - startTime
    const isTimeout = error.message?.includes('timed out') || error.message?.includes('timeout')
    
    // Full logging for 504 errors
    if (isTimeout) {
      console.error('='.repeat(80))
      console.error('[analyze-pitch] 504 TIMEOUT ERROR - FULL DETAILS:')
      console.error('='.repeat(80))
      console.error('Elapsed time:', elapsed, 'ms')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
      console.error('Error code:', error.code)
      console.error('Error type:', error.type)
      console.error('Error status:', error.status)
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      console.error('TIMEOUTS.OPENAI_ANALYSIS:', TIMEOUTS.OPENAI_ANALYSIS, 'ms')
      console.error('MAX_CONTENT_LENGTH:', MAX_CONTENT_LENGTH)
      console.error('='.repeat(80))
      
      return NextResponse.json(
        { 
          error: 'Analysis timed out. Please try with shorter content or try again later.',
          details: {
            elapsed: elapsed,
            timeout: TIMEOUTS.OPENAI_ANALYSIS,
            error: error.message
          }
        },
        { status: 504 }
      )
    }

    // Log other errors too
    console.error(`[analyze-pitch] Error after ${elapsed}ms:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      type: error.type,
      status: error.status
    })

    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
