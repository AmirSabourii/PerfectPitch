import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This is a WebSocket handler for Next.js
// Note: Next.js doesn't natively support WebSocket, so we'll need to use a workaround
// For production, consider using a separate WebSocket server or upgrading to Next.js with proper WS support

export async function GET(request: NextRequest) {
  // This endpoint will be used to establish WebSocket connection
  // In a real implementation, you'd use a WebSocket server library
  // For now, we'll create an API route that proxies to OpenAI Realtime API
  
  return new Response('WebSocket endpoint - use client-side WebSocket connection', {
    status: 200,
  })
}

// Alternative: Create a server-side API route that uses OpenAI Realtime API
// The client will connect directly to OpenAI with a session token from our server

export async function POST(request: NextRequest) {
  try {
    const { pitchContext } = await request.json()

    // Create a Realtime API session
    // Note: OpenAI Realtime API requires direct WebSocket connection from client
    // We'll return session configuration instead
    
    const sessionConfig = {
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'alloy',
      instructions: `You are a tough Tier-1 Venture Capitalist conducting a live Q&A session with a startup founder.

Context from their pitch:
- Pitch Summary: ${pitchContext.pitch_summary}
- Weak Points: ${pitchContext.weak_points.join(', ')}
- Red Flags: ${pitchContext.red_flags.join(', ')}
- Prepared Questions: ${pitchContext.questions_for_founder.join('; ')}

Your role:
- Ask challenging questions based on the context
- Interrupt if answers are vague or evasive
- Follow up immediately on weak points
- Be direct and critical like a real VC
- Keep questions short and to the point
- Challenge assumptions aggressively

Start by asking one of the prepared questions or a challenging follow-up based on the pitch analysis.`,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      temperature: 0.8,
      max_response_output_tokens: 4096,
    }

    return new Response(JSON.stringify(sessionConfig), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'خطا در ایجاد جلسه' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

