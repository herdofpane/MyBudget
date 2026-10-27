import { describe, it, expect } from 'vitest';
import {
  getCreditRemainingMonths,
  getCreditRemainingMonthsInMonth,
  isCreditExpired,
  isCreditExpiredInMonth,
  calculateCreditProgress,
} from '../credit';
import { FixedExpenseItem } from '@/types';

function createMockCreditItem(partial: Partial<FixedExpenseItem> = {}): FixedExpenseItem {
  return {
    id: 'test-credit-1',
    name: 'Auto Loan',
    amount: 250,
    category: 'transport',
    icon: 'car-outline',
    color: '#3b82f6',
    isCredit: true,
    durationMonths: 24,
    paidMonthsCount: 6,
    ...partial,
  };
}

describe('Credit Utilities - Installments and Amortization', () => {
  it('returns Infinity for non-credit items', () => {
    const regularExpense = createMockCreditItem({ isCredit: false });
    expect(getCreditRemainingMonths(regularExpense)).toBe(Infinity);
  });

  it('calculates remaining months via paidMonthsCount', () => {
    const item = createMockCreditItem({ durationMonths: 36, paidMonthsCount: 12 });
    expect(getCreditRemainingMonths(item)).toBe(24);
  });

  it('determines if credit is expired', () => {
    const ongoing = createMockCreditItem({ durationMonths: 12, paidMonthsCount: 5 });
    const finished = createMockCreditItem({ durationMonths: 12, paidMonthsCount: 12 });
    expect(isCreditExpired(ongoing)).toBe(false);
    expect(isCreditExpired(finished)).toBe(true);
  });

  it('calculates credit progress percentage safely between 0 and 1', () => {
    const halfPaid = createMockCreditItem({ durationMonths: 20, paidMonthsCount: 10 });
    expect(calculateCreditProgress(halfPaid)).toBe(0.5);

    const nonCredit = createMockCreditItem({ isCredit: false });
    expect(calculateCreditProgress(nonCredit)).toBe(0);
  });

  it('calculates remaining credit months relative to future target month', () => {
    const item = createMockCreditItem({ durationMonths: 10, paidMonthsCount: 4 });
    // baseMonth = 2026-10, targetMonth = 2026-12 (+2 months)
    const remainingInDec = getCreditRemainingMonthsInMonth(item, '2026-12', '2026-10');
    expect(remainingInDec).toBe(4); // 6 remaining initially - 2 elapsed = 4

    const isExpiredInFuture = isCreditExpiredInMonth(item, '2027-05', '2026-10');
    expect(isExpiredInFuture).toBe(true);
  });
});
