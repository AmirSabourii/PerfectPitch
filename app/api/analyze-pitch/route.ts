import { NextResponse } from 'next/server'
import { analyzePitchDeck } from '@/lib/aiAnalyzer'
import { adminAuth } from '@/lib/admin'
import { checkUsage, incrementUsage } from '@/lib/limits'

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (e) {
      console.error("Token verification failed:", e)
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

    const { transcript, file_context, stage, industry, targetAudience } = await request.json()

    if (!transcript && !file_context) {
      return NextResponse.json(
        { error: 'No input provided (transcript or file)' },
        { status: 400 }
      )
    }

    // Combine transcript and file context
    const fullAnalysis = await analyzePitchDeck({
      transcript: file_context ? `CONTEXT FROM DOCUMENTS:\n${file_context}\n\nREMAINING TRANSCRIPT:\n${transcript}` : transcript,
      stage,
      industry,
      targetAudience
    })

    // 3. Increment usage on success
    await incrementUsage(uid, 'analysis')

    return NextResponse.json(fullAnalysis)
  } catch (error: any) {
    console.error('Error in analyze-pitch:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
