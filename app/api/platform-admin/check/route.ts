import { NextRequest, NextResponse } from 'next/server';
import { platformAdminService } from '@/lib/services/platformAdminService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const isPlatformAdmin = await platformAdminService.isPlatformAdmin(userId);
    
    return NextResponse.json({ isPlatformAdmin });
  } catch (error) {
    console.error('Error checking platform admin:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
