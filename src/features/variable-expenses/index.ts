export { VariableExpenseRow } from './components/variable-expense-row';
export { VariableExpenseModal } from './components/variable-expense-modal';
export { VariableExpensesStats } from './components/variable-expenses-stats';
export { VariableExpensesEmpty } from './components/variable-expenses-empty';

export { useVariableExpenses } from './hooks/use-variable-expenses';

export { variableExpensesService, VariableExpensesService } from './services/variable-expenses-service';
export type {
  VariableCategory,
  ExpenseRecord,
  VariableExpensesSummary,
} from './types/variable-expenses.types';
