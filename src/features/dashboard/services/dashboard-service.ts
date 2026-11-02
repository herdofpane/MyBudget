import { BudgetData } from '@/types/budget';
import { DashboardMetrics } from '../types/dashboard.types';

export class DashboardService {
  /**
   * Computes high-level aggregated metrics for the dashboard view.
   */
  calculateMetrics(
    budget: BudgetData,
    totalFixed: number,
    totalVariableSmoothed: number
  ): DashboardMetrics {
    const monthlyIncome = budget.income;
    const disposableIncome = monthlyIncome - totalFixed - totalVariableSmoothed;
    const totalSavings = budget.savingsAccount ?? 0;

    return {
      monthlyIncome,
      totalFixed,
      totalVariableSmoothed,
      disposableIncome,
      totalSavings,
      checkingAccount: budget.checkingAccount ?? 0,
      savingsAccount: budget.savingsAccount ?? 0,
    };
  }
}

export const dashboardService = new DashboardService();
