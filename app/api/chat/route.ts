import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

let cachedClient: OpenAI | null = null

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.')
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey })
  }
  return cachedClient
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120 // 2 minutes for chat

export async function POST(request: NextRequest) {
  try {
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
          { error: 'Request body parsing timed out. Please try again.' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const { messages, pitchContext, isInitial } = body

    if (!pitchContext) {
      return NextResponse.json(
        { error: 'Pitch context is required' },
        { status: 400 }
      )
    }

    // Simplified prompt for lighter model
    const summary = pitchContext.pitch_summary || 'Not provided'
    const weakPoints = pitchContext.weak_points?.slice(0, 3).join(', ') || 'None'
    const redFlags = pitchContext.red_flags?.slice(0, 2).join(', ') || 'None'
    
    const systemPrompt = `Tough VC Q&A. Context: ${summary}. Weak: ${weakPoints}. Red flags: ${redFlags}. Ask challenging questions. Be direct. Keep responses short. ${isInitial ? 'Start with a question.' : 'Continue tough.'}`

    const conversationMessages: any[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

    // Limit conversation history to save tokens (reduced from 10 to 5)
    const recentMessages = messages.slice(-5);

    // Add conversation history
    recentMessages.forEach((msg: { role: string; content: string }) => {
      conversationMessages.push({
        role: msg.role,
        content: msg.content,
      })
    })

    const openai = getOpenAIClient()
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
      TIMEOUTS.OPENAI_CHAT,
      'Chat request timed out. Please try again.'
    )

    const aiMessage = response.choices[0]?.message?.content || ''

    return NextResponse.json({
      message: aiMessage,
    })
  } catch (error: any) {
    const isTimeout = error.message?.includes('timed out') || error.message?.includes('timeout')
    
    // Full logging for 504 errors
    if (isTimeout) {
      console.error('='.repeat(80))
      console.error('[chat] 504 TIMEOUT ERROR - FULL DETAILS:')
      console.error('='.repeat(80))
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
      console.error('Error code:', error.code)
      console.error('Error type:', error.type)
      console.error('Error status:', error.status)
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      console.error('TIMEOUTS.OPENAI_CHAT:', TIMEOUTS.OPENAI_CHAT, 'ms')
      console.error('='.repeat(80))
      
      return NextResponse.json(
        { 
          error: 'Chat request timed out. Please try again.',
          details: {
            error: error.message,
            timeout: TIMEOUTS.OPENAI_CHAT,
            stack: error.stack
          }
        },
        { status: 504 }
      )
    }
    
    console.error('[chat] Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش پیام' },
      { status: 500 }
    )
  }
}

