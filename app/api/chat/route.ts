import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: TIMEOUTS.OPENAI_CHAT,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { messages, pitchContext, isInitial } = await request.json()

    if (!pitchContext) {
      return NextResponse.json(
        { error: 'Pitch context is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a tough Tier-1 Venture Capitalist conducting a live Q&A session with a startup founder.

Context from their pitch:
- Pitch Summary: ${pitchContext.pitch_summary || 'Not provided'}
- Weak Points: ${pitchContext.weak_points?.join(', ') || 'None specified'}
- Red Flags: ${pitchContext.red_flags?.join(', ') || 'None specified'}
- Prepared Questions: ${pitchContext.questions_for_founder?.join('; ') || 'None specified'}

Your role:
- Ask challenging questions based on the context
- Interrupt if answers are vague or evasive (mention this in your response)
- Follow up immediately on weak points
- Be direct and critical like a real VC
- Keep questions short and to the point
- Challenge assumptions aggressively
- If the answer is vague, call it out and ask for specifics

${isInitial ? `Start by asking one of the prepared questions or a challenging follow-up based on the pitch analysis. Be direct and start immediately with a question.` : 'Continue the conversation. Be tough and challenge their answers.'}`

    const conversationMessages: any[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

    // Limit conversation history to reasonable amount to save tokens
    const recentMessages = messages.slice(-10);

    // Add conversation history
    recentMessages.forEach((msg: { role: string; content: string }) => {
      conversationMessages.push({
        role: msg.role,
        content: msg.content,
      })
    })

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
    console.error('Error in chat:', error.message)
    
    // Handle timeout errors
    if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Chat request timed out. Please try again.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش پیام' },
      { status: 500 }
    )
  }
}

