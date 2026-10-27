import { describe, it, expect } from 'vitest';
import { generateBudgetCsv } from '../csv-export';
import { DEFAULT_BUDGET } from '@/data';

describe('CSV Export Utility', () => {
  it('generates a formatted CSV with budget summary, fixed and variable expenses', () => {
    const fixedExpenses = [
      {
        id: '1',
        name: 'Loyer & Charges',
        amount: 850,
        category: 'housing',
        icon: 'home-outline',
        color: '#3b82f6',
        isCredit: false,
      },
    ];

    const variableCategories = [
      {
        id: 'v1',
        name: 'Alimentation',
        category: 'groceries',
        estimatedMonthly: 400,
        smoothingMonths: 1,
        color: '#10b981',
        icon: 'cart-outline',
      },
    ];

    const csv = generateBudgetCsv(DEFAULT_BUDGET, fixedExpenses, variableCategories);

    expect(csv).toContain('--- SYNTHESE DU BUDGET ---');
    expect(csv).toContain('--- CHARGES FIXES & EMPRUNTS ---');
    expect(csv).toContain('"Loyer & Charges"');
    expect(csv).toContain('--- CHARGES VARIABLES & LISSAGE ---');
    expect(csv).toContain('"Alimentation"');
  });
});
