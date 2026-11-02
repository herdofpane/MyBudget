import { describe, it, expect } from 'vitest';
import { VariableExpensesService } from '../services/variable-expenses-service';
import { VariableCategory } from '@/types/budget';

describe('VariableExpensesService - Charges Variables & Lissage', () => {
  const service = new VariableExpensesService();

  it('accurately computes smoothed total and current month spending', () => {
    const categories: VariableCategory[] = [
      {
        id: 'v1',
        label: 'Courses',
        estimatedBudget: 400,
        spent: 150,
        icon: 'cart',
        color: '#10b981',
      },
      {
        id: 'v2',
        label: 'Vacances',
        estimatedBudget: 200,
        spent: 50,
        icon: 'airplane',
        color: '#3b82f6',
      },
    ];

    const summary = service.calculateSummary(categories);

    expect(summary.totalSmoothedMonthly).toBe(600);
    expect(summary.totalSpentCurrentMonth).toBe(200);
    expect(summary.categoriesCount).toBe(2);
  });
});
