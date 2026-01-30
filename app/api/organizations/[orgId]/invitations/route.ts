import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';
import { organizationService } from '@/lib/services/organizationService';
import { emailService } from '@/lib/services/emailService';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const invitations = await invitationService.listInvitations(params.orgId);
    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const invitation = await invitationService.createInvitation(
      params.orgId,
      body.email,
      body.invitedBy,
      body.programId
    );
    
    // ارسال ایمیل
    try {
      const organization = await organizationService.getOrganization(params.orgId);
      if (organization) {
        await emailService.sendInvitationEmail(invitation, organization);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // ایمیل ارسال نشد اما invitation ساخته شد
    }
    
    return NextResponse.json(invitation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
