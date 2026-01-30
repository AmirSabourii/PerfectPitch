import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await invitationService.getInvitationByToken(params.token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // بررسی وضعیت
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is not pending' },
        { status: 400 }
      );
    }

    // بررسی انقضا
    if (invitation.expiresAt.toMillis() < Date.now()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // فقط ایمیل را برگردان (نه token)
    return NextResponse.json({
      email: invitation.email,
      organizationId: invitation.organizationId,
      programId: invitation.programId,
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
