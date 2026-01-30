import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/services/organizationService';

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params (in production, get from auth token)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const organizations = await organizationService.getUserOrganizations(userId);
    
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
