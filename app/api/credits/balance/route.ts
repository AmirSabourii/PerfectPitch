import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@/lib/services/creditService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const userCredits = await creditService.getUserCredits(userId);

    return NextResponse.json({
      success: true,
      credits: userCredits,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
