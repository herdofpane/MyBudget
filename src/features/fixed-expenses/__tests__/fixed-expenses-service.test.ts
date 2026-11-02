import { describe, it, expect } from 'vitest';
import { FixedExpensesService } from '../services/fixed-expenses-service';
import { FixedExpenseItem } from '@/types/budget';

describe('FixedExpensesService - Charges Fixes Metrics', () => {
  const service = new FixedExpensesService();

  it('calculates total monthly burden and debt ratio correctly', () => {
    const items: FixedExpenseItem[] = [
      {
        id: '1',
        label: 'Loyer',
        amount: 800,
        category: 'logement',
        icon: 'home',
        isCredit: false,
      },
      {
        id: '2',
        label: 'Prêt Auto',
        amount: 200,
        category: 'credit',
        icon: 'car',
        isCredit: true,
      },
    ];

    const summary = service.calculateSummary(items, 2500);

    expect(summary.totalMonthly).toBe(1000);
    expect(summary.creditsCount).toBe(1);
    expect(summary.debtRatio).toBe(40);
  });
});
