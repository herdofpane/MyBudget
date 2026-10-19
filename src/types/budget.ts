export interface NecessaryBreakdown {
  groceries: number;   // Course (Alimentation/Entretien) : 49%
  transport: number;   // Transports (Essence/Tickets) : 37%
  hygiene: number;     // Hygiène & Santé : 14%
  total: number;
}

export interface FacultativeBreakdown {
  leisure: number;     // Activité, Loisir & Culture : 37%
  restaurants: number; // Resto, Cafés : 26%
  clothing: number;    // Habillement : 21%
  misc: number;        // Divers & Imprévus : 16%
  total: number;
}

export interface OneTimeIncomeData {
  amount: number;       // Montant ponctuel reçu (par défaut : 0 €)
  necessary: number;    // Seuil de survie / nécessaire (par défaut : 0 €)
  facultative?: number; // Budget plaisir / facultatif optionnel
  savings: number;      // Épargne calculée
}

export interface BudgetData {
  income: number;             // Revenu mensuel net (par défaut : 0 €)
  fixedExpenses: number;      // Somme des charges fixes (ex : 0 €)
  checkingAccount: number;    // Montant compte courant (par défaut : 0 €)
  savingsAccount: number;     // Montant épargne (par défaut : 0 €)
  targetNecessary?: number;   // Montant nécessaire / seuil survie (ex : charges variables ou personnalisé)
  isCustomTargetNecessary?: boolean; // Indique si le seuil nécessaire a été personnalisé par l'utilisateur
  targetFacultative?: number; // Montant plaisir / facultatif
  oneTimeIncome?: OneTimeIncomeData;
}

export type FixedCategoryType =
  | 'logement'
  | 'energie'
  | 'assurance'
  | 'abonnements'
  | 'transport'
  | 'credit'
  | 'autre';

export type FixedExpenseActivationType = 'all' | 'starting_from' | 'only_month';

export interface FixedExpenseItem {
  id: string;
  label: string;
  amount: number;
  category: FixedCategoryType;
  icon: string;
  dueDay?: number;         // Optionnel : jour d'échéance
  isPaid?: boolean;        // Optionnel : statut prélevé
  notes?: string;
  isCredit?: boolean;             // Si true : charge temporaire sur durée déterminée (crédit)
  durationMonths?: number;        // Durée totale du crédit en mois (ex: 6, 12, 24, 36)
  paidMonthsCount?: number;       // Nombre de mensualités déjà honorées
  startMonth?: string;            // Mois de début au format YYYY-MM (ex: "2026-10")
  activationType?: FixedExpenseActivationType; // 'all' (tous les mois), 'starting_from' (à partir de), 'only_month' (uniquement ce mois)
  targetMonth?: string;           // Mois d'application cible au format YYYY-MM (ex: "2026-11")
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
  advanceCreditMonth: (id: string) => Promise<void>;
  addVariableCategory: (category: Omit<VariableCategory, 'id'>) => Promise<void>;
  updateVariableCategory: (category: VariableCategory) => Promise<void>;
  deleteVariableCategory: (id: string) => Promise<void>;
  addExpenseToCategory: (categoryId: string, amount: number, label: string) => Promise<void>;
  resetMonthStatus: () => Promise<void>;
}
