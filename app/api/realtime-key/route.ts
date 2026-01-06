import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This endpoint provides the API key to the client
// In production, you should use a more secure approach like:
// - Server-side WebSocket proxy
// - Temporary session tokens
// - API key rotation

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  // For MVP, we return the key directly
  // TODO: Implement secure session token generation
  return NextResponse.json({ apiKey })
}

