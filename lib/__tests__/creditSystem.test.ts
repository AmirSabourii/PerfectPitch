import {
  CREDIT_PRICE,
  MIN_CREDITS,
  MAX_CREDITS,
  calculateCreditPackage,
  hasEnoughCredits,
  calculateRemainingCredits,
  getActionCost,
  canPerformAction,
  suggestCreditAmount,
  formatPrice,
  formatCredits,
  UserCredits,
} from '../creditSystem';

describe('Credit System', () => {
  describe('calculateCreditPackage', () => {
    it('should calculate correct package for valid credits', () => {
      const package10 = calculateCreditPackage(10);
      expect(package10.credits).toBe(10);
      expect(package10.price).toBe(30); // 10 * $3
      expect(package10.pricePerCredit).toBe(3);
    });

    it('should throw error for credits below minimum', () => {
      expect(() => calculateCreditPackage(3)).toThrow();
    });

    it('should throw error for credits above maximum', () => {
      expect(() => calculateCreditPackage(60)).toThrow();
    });

    it('should handle edge cases', () => {
      const min = calculateCreditPackage(MIN_CREDITS);
      expect(min.price).toBe(MIN_CREDITS * CREDIT_PRICE);

      const max = calculateCreditPackage(MAX_CREDITS);
      expect(max.price).toBe(MAX_CREDITS * CREDIT_PRICE);
    });
  });

  describe('hasEnoughCredits', () => {
    const mockUserCredits: UserCredits = {
      userId: 'test-user',
      totalCredits: 20,
      usedCredits: 10,
      remainingCredits: 10,
      purchaseHistory: [],
      usageHistory: [],
      lastUpdated: new Date(),
    };

    it('should return true when user has enough credits', () => {
      expect(hasEnoughCredits(mockUserCredits, 5)).toBe(true);
    });

    it('should return false when user does not have enough credits', () => {
      expect(hasEnoughCredits(mockUserCredits, 15)).toBe(false);
    });

    it('should return true when required credits equals remaining', () => {
      expect(hasEnoughCredits(mockUserCredits, 10)).toBe(true);
    });
  });

  describe('calculateRemainingCredits', () => {
    it('should calculate remaining credits correctly', () => {
      const userCredits: UserCredits = {
        userId: 'test-user',
        totalCredits: 30,
        usedCredits: 12,
        remainingCredits: 18,
        purchaseHistory: [],
        usageHistory: [],
        lastUpdated: new Date(),
      };

      expect(calculateRemainingCredits(userCredits)).toBe(18);
    });

    it('should handle zero usage', () => {
      const userCredits: UserCredits = {
        userId: 'test-user',
        totalCredits: 20,
        usedCredits: 0,
        remainingCredits: 20,
        purchaseHistory: [],
        usageHistory: [],
        lastUpdated: new Date(),
      };

      expect(calculateRemainingCredits(userCredits)).toBe(20);
    });
  });

  describe('getActionCost', () => {
    it('should return correct cost for pitch_analysis', () => {
      expect(getActionCost('pitch_analysis')).toBe(1);
    });

    it('should return correct cost for deep_research', () => {
      expect(getActionCost('deep_research')).toBe(2);
    });

    it('should return correct cost for realtime_session', () => {
      expect(getActionCost('realtime_session')).toBe(1);
    });
  });

  describe('canPerformAction', () => {
    const mockUserCredits: UserCredits = {
      userId: 'test-user',
      totalCredits: 20,
      usedCredits: 15,
      remainingCredits: 5,
      purchaseHistory: [],
      usageHistory: [],
      lastUpdated: new Date(),
    };

    it('should allow pitch_analysis with enough credits', () => {
      expect(canPerformAction(mockUserCredits, 'pitch_analysis')).toBe(true);
    });

    it('should not allow deep_research without enough credits', () => {
      const lowCredits: UserCredits = {
        ...mockUserCredits,
        remainingCredits: 1,
      };
      expect(canPerformAction(lowCredits, 'deep_research')).toBe(false);
    });
  });

  describe('suggestCreditAmount', () => {
    it('should suggest credits with 20% buffer', () => {
      expect(suggestCreditAmount(10)).toBe(12); // 10 * 1.2
    });

    it('should not suggest below minimum', () => {
      expect(suggestCreditAmount(2)).toBe(MIN_CREDITS);
    });

    it('should not suggest above maximum', () => {
      expect(suggestCreditAmount(100)).toBe(MAX_CREDITS);
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(30)).toBe('$30.00');
      expect(formatPrice(15.5)).toBe('$15.50');
      expect(formatPrice(150)).toBe('$150.00');
    });
  });

  describe('formatCredits', () => {
    it('should format single credit', () => {
      expect(formatCredits(1)).toBe('1 Credit');
    });

    it('should format multiple credits', () => {
      expect(formatCredits(10)).toBe('10 Credits');
      expect(formatCredits(0)).toBe('0 Credits');
    });
  });
});
