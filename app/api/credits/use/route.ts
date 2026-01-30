import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@/lib/services/creditService';
import { CreditAction } from '@/lib/creditSystem';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, resourceId } = await request.json();

    if (!userId || !action || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // استفاده از credit
    const usage = await creditService.useCredits(
      userId,
      action as CreditAction,
      resourceId
    );

    // دریافت موجودی جدید
    const userCredits = await creditService.getUserCredits(userId);

    return NextResponse.json({
      success: true,
      usage,
      remainingCredits: userCredits?.remainingCredits || 0,
      message: 'Credit با موفقیت کسر شد',
    });
  } catch (error: any) {
    console.error('Credit usage error:', error);

    if (error.message === 'Insufficient credits') {
      return NextResponse.json(
        { error: 'موجودی Credit کافی نیست' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to use credits' },
      { status: 500 }
    );
  }
}
