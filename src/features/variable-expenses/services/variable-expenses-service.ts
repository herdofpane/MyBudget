import { VariableCategory } from '@/types/budget';
import { VariableExpensesSummary } from '../types/variable-expenses.types';

export class VariableExpensesService {
  /**
   * Computes smoothed monthly budget allocation across all variable categories.
   */
  calculateSummary(categories: readonly VariableCategory[]): VariableExpensesSummary {
    const totalSmoothedMonthly = categories.reduce(
      (sum, cat) => sum + (cat.estimatedBudget || 0),
      0
    );
    const totalSpentCurrentMonth = categories.reduce(
      (sum, cat) => sum + (cat.spent || 0),
      0
    );

    return {
      totalSmoothedMonthly: Math.round(totalSmoothedMonthly * 100) / 100,
      totalSpentCurrentMonth: Math.round(totalSpentCurrentMonth * 100) / 100,
      categoriesCount: categories.length,
    };
  }
}

export const variableExpensesService = new VariableExpensesService();
