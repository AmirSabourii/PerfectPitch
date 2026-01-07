import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { adminAuth } from '@/lib/admin'
import { checkUsage, incrementUsage, getUserPlan } from '@/lib/limits'

// Increase max duration for realtime session creation
export const maxDuration = 60 // 60 seconds
export const runtime = 'nodejs'

// Role definitions
const ROLES = {
    // ... existing roles map ...
    vc: `Tier-1 VC. Find reasons NOT to invest. Critical, direct. Demand numbers. Focus unit economics. START first. Use context. Ask specific questions.`,
    mentor: `YC Mentor. Help founder iterate. Supportive but honest. Ask guiding questions. Highlight strengths. START first. Reference pitch.`,
    brainstorm: `Creative Co-Founder. Expand ideas. Energetic "Yes, and...". Suggest pivots. START first.`,
    practice: `Rapid-Fire Bot. Neutral, fast. Ask question, wait, next question. No comments. 10 questions. START: "Question 1:"`,
    founder_test: `Board Evaluator. Test CEO potential. Cold, intimidating. Ask about psychology, leadership, fears. START: "Are you a good founder?"`
}

export async function POST(request: Request) {
    try {
        // 1. Verify User
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
        }
        const token = authHeader.split('Bearer ')[1]

        const { isAdminInitialized } = await import('@/lib/admin')
        const { withTimeout, TIMEOUTS } = await import('@/lib/timeout')
        
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
                    { error: 'Request body too large or parsing timed out. Please try again.' },
                    { status: 504 }
                )
            }
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }
        
        const { prompt, role, documentContext, pitch_transcript } = body

        // 2. Check Plan & Role Access
        const userPlan = await getUserPlan(uid)

        if (role === 'founder_test' && userPlan !== 'pro') {
            return NextResponse.json({
                error: 'Founder Test mode is available only on Pro plan.',
                code: 'PREMIUM_FEATURE',
                requiresUpgrade: true
            }, { status: 403 })
        }

        // 3. Check Usage Limits
        const limitCheck = await checkUsage(uid, 'roleplay')
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: limitCheck.message,
                code: 'LIMIT_REACHED',
                requiresUpgrade: true
            }, { status: 403 })
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
        }

        // Resolve instructions
        let baseInstructions = ROLES[role as keyof typeof ROLES] || ROLES['vc']

        // --- CONTEXT INJECTION REFACTOR ---

        let contextBlock = `\n\n=== CONTEXT ===\n`
        if (body.stage) contextBlock += `- Startup Stage: ${body.stage}\n`
        if (body.industry) contextBlock += `- Industry: ${body.industry}\n`
        if (body.targetAudience) contextBlock += `- Target Audience: ${body.targetAudience}\n`

        if (body.analysisSummary) contextBlock += `\n[AI ANALYSIS SUMMARY]:\n"${body.analysisSummary}"\n`
        if (body.risks && body.risks.length > 0) contextBlock += `\n[RED FLAGS / RISKS DETECTED]:\n- ${body.risks.join('\n- ')}\n`

        // Add full transcript if available (reduced length for lighter model)
        if (pitch_transcript) {
            contextBlock += `\n[TRANSCRIPT]:\n"${pitch_transcript.substring(0, 3000)}"`
            baseInstructions += `\n\nUse the pitch details. Ask specific questions based on RISKS.`
        }

        if (documentContext) {
            contextBlock += `\n\n[DECK]:\n"${documentContext.substring(0, 2500)}"`
        }

        baseInstructions += contextBlock
        baseInstructions += `\n\nSTART THE CALL. Speak first. Greet and reference context briefly.`



        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Use lighter realtime model (must match client SDP exchange)
                model: 'gpt-realtime-mini',
                modalities: ['audio', 'text'],
                instructions: baseInstructions,
                // Use only supported voices
                voice: role === 'founder_test'
                    ? 'ash'            // deep/assertive alternative
                    : role === 'mentor'
                        ? 'shimmer'
                        : role === 'brainstorm'
                            ? 'coral'
                            : 'alloy',
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.6,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 600,
                }
            }),
        })

        if (!response.ok) {
            let errorJson: any = null
            try {
                errorJson = await response.json()
            } catch {
                // ignore parse errors
            }
            console.error('OpenAI realtime session error', response.status, errorJson)
            return NextResponse.json(
                { error: 'Failed to create OpenAI session', details: errorJson || await response.text() },
                { status: response.status }
            )
        }

        const data = await response.json()

        // 4. Increment usage on success (don't wait for it)
        incrementUsage(uid, 'roleplay').catch(err => {
            console.error('Failed to increment usage:', err)
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error in realtime/sessions:', error.message)
        
        // Handle timeout errors
        if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
            return NextResponse.json(
                { error: error.message || 'Session creation timed out. Please try again.' },
                { status: 504 }
            )
        }
        
        return NextResponse.json(
            { error: error.message || 'Failed to create session. Please try again.' },
            { status: 500 }
        )
    }
}
