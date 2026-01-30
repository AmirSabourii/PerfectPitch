import { NextRequest, NextResponse } from 'next/server';
import { platformAdminService } from '@/lib/services/platformAdminService';

// این endpoint فقط برای اولین بار استفاده می‌شود
// بعد از اولین setup باید غیرفعال شود
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, setupKey } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // بررسی کلید امنیتی (در production باید از env variable استفاده کنید)
    const SETUP_KEY = process.env.PLATFORM_ADMIN_SETUP_KEY || 'demo-setup-key-123';
    
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    // بررسی که آیا قبلاً platform admin وجود دارد
    const existingAdmins = await platformAdminService.listPlatformAdmins();
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Platform admin already exists. Use admin panel to add more admins.' },
        { status: 403 }
      );
    }

    // اضافه کردن اولین platform admin
    await platformAdminService.addPlatformAdmin(userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'You are now a platform admin!' 
    });
  } catch (error) {
    console.error('Error setting up platform admin:', error);
    return NextResponse.json(
      { error: 'Failed to setup platform admin' },
      { status: 500 }
    );
  }
}
