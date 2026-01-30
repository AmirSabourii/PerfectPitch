import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@/lib/services/creditService';
import { getActionCost, CreditAction } from '@/lib/creditSystem';

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // بررسی موجودی
    const hasEnough = await creditService.hasEnoughCredits(
      userId,
      action as CreditAction
    );

    if (!hasEnough) {
      const userCredits = await creditService.getUserCredits(userId);
      return NextResponse.json(
        {
          hasEnoughCredits: false,
          remainingCredits: userCredits?.remainingCredits || 0,
          requiredCredits: getActionCost(action as CreditAction),
          message: 'موجودی Credit کافی نیست',
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      hasEnoughCredits: true,
      message: 'موجودی کافی است',
    });
  } catch (error) {
    console.error('Credit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check credits' },
      { status: 500 }
    );
  }
}
