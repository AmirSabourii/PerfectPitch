import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserCredits, CreditAction } from '@/lib/creditSystem';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری موجودی
  const loadCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load credits');
      }

      setCredits(data.credits);
    } catch (err: any) {
      console.error('Load credits error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // بررسی موجودی کافی
  const checkCredits = useCallback(
    async (action: CreditAction): Promise<boolean> => {
      if (!user) return false;

      try {
        const response = await fetch('/api/credits/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, action }),
        });

        const data = await response.json();
        return data.hasEnoughCredits;
      } catch (err) {
        console.error('Check credits error:', err);
        return false;
      }
    },
    [user]
  );

  // استفاده از credit
  const useCredit = useCallback(
    async (action: CreditAction, resourceId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const response = await fetch('/api/credits/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, action, resourceId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to use credit');
        }

        // به‌روزرسانی موجودی محلی
        if (credits) {
          setCredits({
            ...credits,
            usedCredits: credits.usedCredits + data.usage.credits,
            remainingCredits: data.remainingCredits,
          });
        }

        return true;
      } catch (err: any) {
        console.error('Use credit error:', err);
        setError(err.message);
        return false;
      }
    },
    [user, credits]
  );

  // بارگذاری اولیه
  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  return {
    credits,
    loading,
    error,
    loadCredits,
    checkCredits,
    useCredit,
    hasCredits: (credits?.remainingCredits || 0) > 0,
    remainingCredits: credits?.remainingCredits || 0,
  };
}
