export { FixedExpenseRow } from './components/fixed-expense-row';
export { FixedExpenseModal } from './components/fixed-expense-modal';
export { FixedExpensesStats } from './components/fixed-expenses-stats';
export { FixedExpensesMonthSelector } from './components/fixed-expenses-month-selector';
export { FixedExpensesEmpty } from './components/fixed-expenses-empty';

export { useFixedExpenses } from './hooks/use-fixed-expenses';
export { useExpenseForm } from './hooks/use-expense-form';
export { useSimulationMonth } from './hooks/use-simulation-month';

export { fixedExpensesService, FixedExpensesService } from './services/fixed-expenses-service';
export type {
  FixedCategoryType,
  FixedExpenseActivationType,
  FixedExpenseItem,
  FixedExpensesSummary,
} from './types/fixed-expenses.types';
