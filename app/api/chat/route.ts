import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { messages, pitchContext, isInitial } = await request.json()

    const systemPrompt = `You are a tough Tier-1 Venture Capitalist conducting a live Q&A session with a startup founder.

Context from their pitch:
- Pitch Summary: ${pitchContext.pitch_summary}
- Weak Points: ${pitchContext.weak_points.join(', ')}
- Red Flags: ${pitchContext.red_flags.join(', ')}
- Prepared Questions: ${pitchContext.questions_for_founder.join('; ')}

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      temperature: 0.8,
      max_tokens: 500,
    })

    const aiMessage = response.choices[0]?.message?.content || ''

    return NextResponse.json({
      message: aiMessage,
    })
  } catch (error: any) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش پیام' },
      { status: 500 }
    )
  }
}

