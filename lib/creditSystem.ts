// Credit-Based Payment System
// هر تحلیل = 3 دلار
// محدوده خرید: 5 تا 50 credit

export const CREDIT_PRICE = 3; // دلار به ازای هر credit
export const MIN_CREDITS = 5;
export const MAX_CREDITS = 50;

export interface CreditPackage {
  credits: number;
  price: number;
  pricePerCredit: number;
}

export interface UserCredits {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  purchaseHistory: CreditPurchase[];
  usageHistory: CreditUsage[];
  lastUpdated: Date;
}

export interface CreditPurchase {
  id: string;
  userId: string;
  credits: number;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: Date;
  transactionId?: string;
}

export interface CreditUsage {
  id: string;
  userId: string;
  credits: number;
  action: 'pitch_analysis' | 'deep_research' | 'realtime_session';
  resourceId: string; // pitch ID, research ID, etc.
  usedAt: Date;
}

// محاسبه قیمت بسته credit
export function calculateCreditPackage(credits: number): CreditPackage {
  if (credits < MIN_CREDITS || credits > MAX_CREDITS) {
    throw new Error(`Credits must be between ${MIN_CREDITS} and ${MAX_CREDITS}`);
  }

  const price = credits * CREDIT_PRICE;
  const pricePerCredit = CREDIT_PRICE;

  return {
    credits,
    price,
    pricePerCredit,
  };
}

// بررسی موجودی credit کافی
export function hasEnoughCredits(
  userCredits: UserCredits,
  requiredCredits: number
): boolean {
  return userCredits.remainingCredits >= requiredCredits;
}

// محاسبه credit باقیمانده
export function calculateRemainingCredits(userCredits: UserCredits): number {
  return userCredits.totalCredits - userCredits.usedCredits;
}

// هزینه هر عملیات به credit
export const CREDIT_COSTS = {
  pitch_analysis: 1, // 1 credit = 3 دلار
  deep_research: 2, // 2 credit = 6 دلار
  realtime_session: 1, // 1 credit = 3 دلار
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// دریافت هزینه عملیات
export function getActionCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

// بررسی امکان انجام عملیات
export function canPerformAction(
  userCredits: UserCredits,
  action: CreditAction
): boolean {
  const cost = getActionCost(action);
  return hasEnoughCredits(userCredits, cost);
}

// پیشنهاد تعداد credit بر اساس استفاده
export function suggestCreditAmount(monthlyUsage: number): number {
  // محاسبه بر اساس استفاده ماهانه + 20% بافر
  const suggested = Math.ceil(monthlyUsage * 1.2);
  
  // محدود کردن به محدوده مجاز
  return Math.max(MIN_CREDITS, Math.min(MAX_CREDITS, suggested));
}

// محاسبه تخفیف برای خرید بالا (اختیاری)
export function calculateDiscount(credits: number): number {
  // بدون تخفیف - قیمت ثابت
  return 0;
}

// فرمت نمایش قیمت
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// فرمت نمایش credit
export function formatCredits(credits: number): string {
  return `${credits} Credit${credits !== 1 ? 's' : ''}`;
}
