import { FixedExpenseItem } from '@/types/budget';
import { FixedExpensesSummary } from '../types/fixed-expenses.types';

export class FixedExpensesService {
  /**
   * Computes statistics and summaries for a collection of fixed expenses.
   */
  calculateSummary(items: readonly FixedExpenseItem[], monthlyIncome: number): FixedExpensesSummary {
    const totalMonthly = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const creditsCount = items.filter((item) => item.isCredit).length;
    const debtRatio = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;

    return {
      totalMonthly,
      activeCount: items.length,
      creditsCount,
      debtRatio: Math.round(debtRatio * 10) / 10,
    };
  }
}

export const fixedExpensesService = new FixedExpensesService();
