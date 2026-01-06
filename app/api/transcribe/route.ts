import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Check API key first
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set')
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    )
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'فایل صوتی ارسال نشده است' },
        { status: 400 }
      )
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    })

    // Convert File to format compatible with OpenAI SDK
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use toFile helper from OpenAI SDK for better compatibility
    const file = new File([buffer], audioFile.name || 'recording.webm', {
      type: audioFile.type || 'audio/webm',
    })

    console.log('Calling OpenAI Whisper API...')

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      prompt: "Startup pitch, technical, venture capital, SaaS, revenue, growth, slides, English speech.",
      response_format: 'json',
    })

    console.log('Transcription successful:', transcription.text?.substring(0, 100))

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error: any) {
    console.error('Transcription error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status,
      errno: error.errno,
    })

    // More specific error messages
    if (error.code === 'ECONNREFUSED' || error.errno === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to OpenAI API. Check your network connection.' },
        { status: 503 }
      )
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در تبدیل صدا به متن' },
      { status: 500 }
    )
  }
}

