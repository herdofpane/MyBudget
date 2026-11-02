export type { VariableCategory, ExpenseRecord } from '@/types/budget';

export interface VariableExpensesSummary {
  readonly totalSmoothedMonthly: number;
  readonly totalSpentCurrentMonth: number;
  readonly categoriesCount: number;
}
