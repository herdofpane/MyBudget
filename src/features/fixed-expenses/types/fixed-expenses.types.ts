export type {
  FixedCategoryType,
  FixedExpenseActivationType,
  FixedExpenseItem,
} from '@/types/budget';

export interface FixedExpensesSummary {
  readonly totalMonthly: number;
  readonly activeCount: number;
  readonly creditsCount: number;
  readonly debtRatio: number;
}
