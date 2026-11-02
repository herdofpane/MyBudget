import { describe, it, expect } from 'vitest';
import { DashboardService } from '../services/dashboard-service';
import { BudgetData } from '@/types/budget';

describe('DashboardService - Financial Overview', () => {
  const service = new DashboardService();

  it('calculates disposable income and savings totals accurately', () => {
    const budget: BudgetData = {
      income: 3000,
      fixedExpenses: 1000,
      checkingAccount: 1200,
      savingsAccount: 8000,
    };

    const metrics = service.calculateMetrics(budget, 1000, 500);

    expect(metrics.disposableIncome).toBe(1500);
    expect(metrics.totalSavings).toBe(8000);
    expect(metrics.checkingAccount).toBe(1200);
  });
});
