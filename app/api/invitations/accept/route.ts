import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.token || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const membership = await invitationService.acceptInvitation(
      body.token,
      body.userId
    );
    
    return NextResponse.json(membership);
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
