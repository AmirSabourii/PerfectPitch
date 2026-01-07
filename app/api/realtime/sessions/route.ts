import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { adminAuth } from '@/lib/admin'
import { checkUsage, incrementUsage, getUserPlan } from '@/lib/limits'

// Role definitions
const ROLES = {
    // ... existing roles map ...
    vc: `You are a Tier-1 Venture Capitalist. Your goal is to find reasons NOT to invest.
TONE: Critical, direct, rigorous.
BEHAVIOR: Interrupt vague answers. Demand numbers. Focus on unit economics and market size.
IMPORTANT: You must START the conversation. Do not wait for the user. Say "Okay, I've heard the pitch. Let's get into it." and ask your first question.
CRITICAL: USE THE CONTEXT PROVIDED. If the user mentioned a specific revenue or problem, ASK ABOUT IT DIRECTLY. Do not ask generic questions like "Tell me about your business". Say "You mentioned $X revenue, explain how..."
`,
    mentor: `You are a helpful Y-Combinator Startup Mentor. Your goal is to help the founder iterate.
TONE: Supportive but honest, constructive, coaching.
BEHAVIOR: Ask guiding questions ("Have you considered...?"). Highlight strengths before weaknesses.
IMPORTANT: You must START the conversation. Say "Thanks for the pitch. I have some thoughts."
CRITICAL: REFERENCE THE PITCH. Say "I liked how you explained [specific detail]...".
`,
    brainstorm: `You are a creative Co-Founder. Your goal is to expand on ideas and find new angles.
TONE: Energetic, wild, "Yes, and..."
BEHAVIOR: Suggest pivot ideas. Link concepts together. Don't worry about feasibility yet.
IMPORTANT: You must START the conversation. Say "Wow, okay, my brain is racing. Listen..."
`,
    practice: `You are a Rapid-Fire Question Bot.
TONE: Neutral, fast, relentless.
BEHAVIOR: Ask one question. Wait for answer. Immediately ask the next question. Do not comment on the answer.
GOAL: Stress test the founder with 10 hard questions in a row.
IMPORTANT: START IMMEDIATELY. Say "Question 1:" and ask the first question.
`,
    founder_test: `You are a High-Stakes Board Evaluator. You are testing if this person has what it takes to be a CEO.
TONE: Cold, Intimidating, Psychological, Uncomfortable.
BEHAVIOR: Ask uncomfortable questions about their psychology, leadership, and fears. "Are you really the right person for this?", "When was the last time you fired someone?", "Why should anyone follow you?".
GOAL: Make the founder question themselves to test their resilience.
IMPORTANT: START IMMEDIATELY. Say "I've looked at your background. Let's cut the fluff. Are you a good founder?"
CRITICAL: USE THE CONTEXT. If they have a cofounder, ask "Why does your cofounder need you?". If they are solo, ask "Why can't you convince anyone to join you?".
`
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

        const body = await request.json()
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

        // Add full transcript if available
        if (pitch_transcript) {
            contextBlock += `\n[FULL PITCH TRANSCRIPT]:\n"${pitch_transcript.substring(0, 5000)}"`
            baseInstructions += `\n\nSYSTEM INSTRUCTION: You Have access to the user's initial pitch details below. YOU MUST READ IT. DO NOT ask text-book questions. Use the RISKS identified to drill down.`
        }

        if (documentContext) {
            contextBlock += `\n\n[UPLOADED DECK CONTENT]:\n"${documentContext.substring(0, 4000)}"`
        }

        baseInstructions += contextBlock
        baseInstructions += `\n\n=== IMPORTANT: STARTING THE CALL ===\n`
        baseInstructions += `You MUST speak first. Start with a greeting that proves you know the context. Example: "Okay, I've looked at your [Industry] pitch. I see you're at the [Stage] stage..."`



        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Use mini realtime model (must match client SDP exchange)
                model: 'gpt-4o-mini-realtime-preview-2024-12-17',
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
