import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for transcription

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
    timeout: TIMEOUTS.OPENAI_TRANSCRIBE, // Set default timeout
  })

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')

    if (!audioFile) {
      console.error('No audio file found in formData. Received:', audioFile)
      return NextResponse.json(
        { error: 'Audio file was not received correctly' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB for Whisper)
    const fileSize = (audioFile as any).size || 0
    if (fileSize > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    const incomingType =
      (audioFile as any).type && typeof (audioFile as any).type === 'string'
        ? (audioFile as any).type
        : undefined

    const fileName =
      (audioFile as any).name && typeof (audioFile as any).name === 'string'
        ? (audioFile as any).name
        : 'recording.webm'

    console.log('Audio file received:', {
      name: fileName,
      type: incomingType,
      size: (audioFile as any).size,
    })

    // Convert the value from the request into a Node-compatible File using OpenAI helper
    const arrayBuffer = await (audioFile as any).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const file = await toFile(buffer, fileName, {
      // Preserve the incoming mime when available (audio/webm or video/webm)
      type: incomingType || 'audio/webm',
    } as any)

    console.log('Calling OpenAI Whisper API...')

    // Transcribe using Whisper with timeout
    const transcription = await withTimeout(
      openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        prompt: "Startup pitch, technical, venture capital, SaaS, revenue, growth, slides, English speech.",
        response_format: 'json',
      }),
      TIMEOUTS.OPENAI_TRANSCRIBE,
      'Transcription request timed out. Please try again with a shorter audio file.'
    )

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

    // Handle timeout errors
    if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Transcription request timed out. Please try again with a shorter audio file.' },
        { status: 504 }
      )
    }

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

