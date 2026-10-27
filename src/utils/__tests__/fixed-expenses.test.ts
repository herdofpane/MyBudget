import { describe, it, expect } from 'vitest';
import {
  getMonthsDifference,
  addMonthsToMonthStr,
  isChargeActiveInMonth,
} from '../fixed-expenses';
import { FixedExpenseItem } from '@/types';

describe('Fixed Expenses Scheduling Utilities', () => {
  it('calculates calendar month delta accurately', () => {
    expect(getMonthsDifference('2026-01', '2026-06')).toBe(5);
    expect(getMonthsDifference('2026-12', '2027-02')).toBe(2);
    expect(getMonthsDifference('2026-05', '2026-02')).toBe(-3);
  });

  it('adds months to a YYYY-MM string correctly crossing year boundaries', () => {
    expect(addMonthsToMonthStr('2026-10', 2)).toBe('2026-12');
    expect(addMonthsToMonthStr('2026-11', 3)).toBe('2027-02');
    expect(addMonthsToMonthStr('2026-01', 12)).toBe('2027-01');
  });

  it('determines charge activity based on activationType', () => {
    const recurringItem: FixedExpenseItem = {
      id: 'fix-1',
      name: 'Internet',
      amount: 40,
      category: 'bills',
      icon: 'wifi-outline',
      color: '#6366f1',
      activationType: 'all',
    };

    const futureItem: FixedExpenseItem = {
      id: 'fix-2',
      name: 'New Gym',
      amount: 50,
      category: 'leisure',
      icon: 'barbell-outline',
      color: '#ec4899',
      activationType: 'starting_from',
      targetMonth: '2026-12',
    };

    const oneTimeItem: FixedExpenseItem = {
      id: 'fix-3',
      name: 'Annual Insurance',
      amount: 600,
      category: 'insurance',
      icon: 'shield-outline',
      color: '#f59e0b',
      activationType: 'only_month',
      targetMonth: '2026-11',
    };

    // Recurring is active anytime
    expect(isChargeActiveInMonth(recurringItem, '2026-10')).toBe(true);

    // Future item inactive before target, active after
    expect(isChargeActiveInMonth(futureItem, '2026-10')).toBe(false);
    expect(isChargeActiveInMonth(futureItem, '2026-12')).toBe(true);
    expect(isChargeActiveInMonth(futureItem, '2027-01')).toBe(true);

    // One-time only active on exact target month
    expect(isChargeActiveInMonth(oneTimeItem, '2026-10')).toBe(false);
    expect(isChargeActiveInMonth(oneTimeItem, '2026-11')).toBe(true);
    expect(isChargeActiveInMonth(oneTimeItem, '2026-12')).toBe(false);
  });
});
