export interface BudgetData {
  income: number;          // Revenu mensuel net
  fixedExpenses: number;   // Somme des charges fixes
  checkingAccount: number; // Montant compte courant
  savingsAccount: number;  // Montant épargne
}

export type FixedCategoryType =
  | 'logement'
  | 'energie'
  | 'assurance'
  | 'abonnements'
  | 'transport'
  | 'credit'
  | 'autre';

export interface FixedExpenseItem {
  id: string;
  label: string;
  amount: number;
  category: FixedCategoryType;
  icon: string;
  dueDay?: number;         // Optionnel : jour d'échéance
  isPaid?: boolean;        // Optionnel : statut prélevé
  notes?: string;
}

export interface VariableCategory {
  id: string;
  label: string;
  totalAmount?: number;    // Montant total du poste de charge
  durationMonths?: number; // Durée de vie sur X mois (ex : 1, 3, 6, 12)
  estimatedBudget: number; // Impact mensuel lissé = totalAmount / durationMonths
  spent: number;           // Montant réel dépensé ce mois
  icon: string;
  color: string;
}

export interface ExpenseRecord {
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  date: string;
}

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export interface PresetIcon {
  icon: string;
  label: string;
}

export interface InitialDataPayload {
  budget: BudgetData;
  fixedExpenses: FixedExpenseItem[];
  variableCategories: VariableCategory[];
  expenseHistory: ExpenseRecord[];
}

export interface BudgetContextType {
  budget: BudgetData;
  fixedExpensesList: FixedExpenseItem[];
  variableCategories: VariableCategory[];
  expenseHistory: ExpenseRecord[];
  isLoading: boolean;
  totalBalance: number;
  totalFixedExpenses: number;
  totalPaidFixedExpenses: number;
  totalRemainingFixedExpenses: number;
  remainingAllowance: number;
  totalEstimatedVariable: number;
  totalSpentVariable: number;
  projectedSavings: number;
  actualRemainingAllowance: number;
  fixedExpenseRatio: number;
  variableExpenseRatio: number;
  savingsCapacityRatio: number;
  saveBudget: (newBudget: BudgetData) => Promise<void>;
  updateItem: (key: keyof BudgetData, value: number) => Promise<void>;
  addFixedExpense: (item: Omit<FixedExpenseItem, 'id'>) => Promise<void>;
  updateFixedExpense: (item: FixedExpenseItem) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  toggleFixedExpensePaid: (id: string) => Promise<void>;
  addVariableCategory: (category: Omit<VariableCategory, 'id'>) => Promise<void>;
  updateVariableCategory: (category: VariableCategory) => Promise<void>;
  deleteVariableCategory: (id: string) => Promise<void>;
  addExpenseToCategory: (categoryId: string, amount: number, label: string) => Promise<void>;
  resetMonthStatus: () => Promise<void>;
}
