'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState<string | null>(null);
  const [showEmailMismatch, setShowEmailMismatch] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  useEffect(() => {
    if (user && invitationEmail) {
      checkEmailAndAccept();
    }
  }, [user, invitationEmail]);

  const validateInvitation = async () => {
    try {
      // دریافت اطلاعات دعوت‌نامه
      const response = await fetch(`/api/invitations/validate/${token}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvitationEmail(data.email);
        setLoading(false);
      } else {
        setError('دعوت‌نامه نامعتبر یا منقضی شده است');
        setLoading(false);
      }
    } catch (err) {
      setError('خطا در بررسی دعوت‌نامه');
      setLoading(false);
    }
  };

  const checkEmailAndAccept = async () => {
    if (!user || !invitationEmail) return;
    
    // بررسی تطابق ایمیل
    if (user.email?.toLowerCase() !== invitationEmail.toLowerCase()) {
      setShowEmailMismatch(true);
      setLoading(false);
      return;
    }

    // ایمیل مطابقت دارد، دعوت را قبول کن
    await handleAccept();
  };

  const handleAccept = async () => {
    if (!user) {
      // اگر لاگین نیست، به صفحه لاگین بفرست
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }
    
    setAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'خطا در پذیرش دعوت‌نامه');
      }
    } catch (err) {
      setError('خطا در پذیرش دعوت‌نامه');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {accepting ? 'در حال پذیرش دعوت‌نامه...' : 'در حال بررسی...'}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">دعوت‌نامه پذیرفته شد!</h2>
          <p className="text-gray-600 mb-4">
            شما با موفقیت به سازمان اضافه شدید.
          </p>
          <p className="text-sm text-gray-500">
            در حال انتقال به داشبورد...
          </p>
        </div>
      </div>
    );
  }

  if (showEmailMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">ایمیل مطابقت ندارد</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>ایمیل دعوت‌نامه:</strong> {invitationEmail}
            </p>
            <p className="text-sm text-yellow-800">
              <strong>ایمیل شما:</strong> {user?.email}
            </p>
          </div>
          <p className="text-gray-600 mb-4 text-center">
            این دعوت‌نامه برای ایمیل دیگری ارسال شده است.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // خروج و ورود با ایمیل صحیح
                router.push(`/login?email=${invitationEmail}&redirect=/invite/${token}`);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ورود با ایمیل {invitationEmail}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              بازگشت به داشبورد
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">دعوت‌نامه دریافت شد</h2>
          <p className="text-gray-600 mb-4">
            برای پذیرش دعوت‌نامه، لطفاً با ایمیل <strong>{invitationEmail}</strong> وارد شوید.
          </p>
          <button
            onClick={() => router.push(`/login?email=${invitationEmail}&redirect=/invite/${token}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ورود / ثبت‌نام
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطا</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  return null;
}
