// Credit Service - Firebase Integration
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  UserCredits,
  CreditPurchase,
  CreditUsage,
  CreditAction,
  getActionCost,
  calculateRemainingCredits,
} from '../creditSystem';

export class CreditService {
  private creditsCollection = collection(db, 'userCredits');
  private purchasesCollection = collection(db, 'creditPurchases');
  private usageCollection = collection(db, 'creditUsage');

  // دریافت موجودی credit کاربر
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    const creditRef = doc(this.creditsCollection, userId);
    const creditSnap = await getDoc(creditRef);

    if (!creditSnap.exists()) {
      // ایجاد رکورد اولیه برای کاربر جدید
      const initialCredits: UserCredits = {
        userId,
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        purchaseHistory: [],
        usageHistory: [],
        lastUpdated: new Date(),
      };
      await setDoc(creditRef, {
        ...initialCredits,
        lastUpdated: Timestamp.now(),
      });
      return initialCredits;
    }

    const data = creditSnap.data();
    return {
      ...data,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    } as UserCredits;
  }

  // خرید credit جدید
  async purchaseCredits(
    userId: string,
    credits: number,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<CreditPurchase> {
    const purchaseRef = doc(this.purchasesCollection);
    const now = Timestamp.now();

    const purchase: CreditPurchase = {
      id: purchaseRef.id,
      userId,
      credits,
      amount,
      paymentMethod,
      status: 'completed',
      purchasedAt: now.toDate(),
      transactionId,
    };

    // استفاده از transaction برای اطمینان از consistency
    await runTransaction(db, async (transaction) => {
      const creditRef = doc(this.creditsCollection, userId);
      const creditSnap = await transaction.get(creditRef);

      if (!creditSnap.exists()) {
        // ایجاد رکورد جدید
        transaction.set(creditRef, {
          userId,
          totalCredits: credits,
          usedCredits: 0,
          remainingCredits: credits,
          purchaseHistory: [purchase],
          usageHistory: [],
          lastUpdated: now,
        });
      } else {
        // به‌روزرسانی رکورد موجود
        transaction.update(creditRef, {
          totalCredits: increment(credits),
          remainingCredits: increment(credits),
          purchaseHistory: arrayUnion(purchase),
          lastUpdated: now,
        });
      }

      // ذخیره رکورد خرید
      transaction.set(purchaseRef, {
        ...purchase,
        purchasedAt: now,
      });
    });

    return purchase;
  }

  // استفاده از credit
  async useCredits(
    userId: string,
    action: CreditAction,
    resourceId: string
  ): Promise<CreditUsage> {
    const cost = getActionCost(action);
    const usageRef = doc(this.usageCollection);
    const now = Timestamp.now();

    const usage: CreditUsage = {
      id: usageRef.id,
      userId,
      credits: cost,
      action,
      resourceId,
      usedAt: now.toDate(),
    };

    // استفاده از transaction
    await runTransaction(db, async (transaction) => {
      const creditRef = doc(this.creditsCollection, userId);
      const creditSnap = await transaction.get(creditRef);

      if (!creditSnap.exists()) {
        throw new Error('User credits not found');
      }

      const currentCredits = creditSnap.data();
      const remaining = currentCredits.remainingCredits || 0;

      if (remaining < cost) {
        throw new Error('Insufficient credits');
      }

      // کسر credit
      transaction.update(creditRef, {
        usedCredits: increment(cost),
        remainingCredits: increment(-cost),
        usageHistory: arrayUnion(usage),
        lastUpdated: now,
      });

      // ذخیره رکورد استفاده
      transaction.set(usageRef, {
        ...usage,
        usedAt: now,
      });
    });

    return usage;
  }

  // بررسی موجودی کافی
  async hasEnoughCredits(
    userId: string,
    action: CreditAction
  ): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    if (!credits) return false;

    const cost = getActionCost(action);
    return credits.remainingCredits >= cost;
  }

  // دریافت تاریخچه خرید
  async getPurchaseHistory(userId: string): Promise<CreditPurchase[]> {
    const credits = await this.getUserCredits(userId);
    return credits?.purchaseHistory || [];
  }

  // دریافت تاریخچه استفاده
  async getUsageHistory(userId: string): Promise<CreditUsage[]> {
    const credits = await this.getUserCredits(userId);
    return credits?.usageHistory || [];
  }

  // بازگشت credit (در صورت خطا یا لغو)
  async refundCredits(
    userId: string,
    credits: number,
    reason: string
  ): Promise<void> {
    const creditRef = doc(this.creditsCollection, userId);
    await updateDoc(creditRef, {
      usedCredits: increment(-credits),
      remainingCredits: increment(credits),
      lastUpdated: Timestamp.now(),
    });
  }
}

export const creditService = new CreditService();
