import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

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
    const audioFile = formData.get('audio')

    if (!(audioFile instanceof Blob)) {
      console.error('No valid audio file found in formData. Received:', audioFile)
      return NextResponse.json(
        { error: 'Audio file was not received correctly' },
        { status: 400 }
      )
    }

    const fileName =
      (audioFile as any).name && typeof (audioFile as any).name === 'string'
        ? (audioFile as any).name
        : 'recording.webm'

    console.log('Audio file received:', {
      name: fileName,
      type: (audioFile as any).type,
      // size is only available on Blob/File
      size: (audioFile as Blob).size,
    })

    // Convert Blob from the request into a Node-compatible File using OpenAI helper
    const arrayBuffer = await (audioFile as Blob).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const file = await toFile(buffer, fileName, {
      contentType: (audioFile as any).type || 'audio/webm',
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

