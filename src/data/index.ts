import {
  BudgetData,
  FixedExpenseItem,
  VariableCategory,
  ExpenseRecord,
  FixedCategoryType,
  CategoryMeta,
  PresetIcon,
} from '@/types';

// Données initiales du budget (synchronisées avec le modèle mensuel et ponctuel)
export const DEFAULT_BUDGET: BudgetData = {
  income: 977,
  fixedExpenses: 0,
  checkingAccount: 977,
  savingsAccount: 0,
  targetNecessary: 123,
  targetFacultative: 130,
  oneTimeIncome: {
    amount: 566.17,
    necessary: 198.16,
    facultative: 136.79,
    savings: 231.22,
  },
};

// Liste des charges fixes par défaut (vide par défaut)
export const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] = [];

// Liste des charges variables par défaut (vide par défaut)
export const DEFAULT_VARIABLE_CATEGORIES: VariableCategory[] = [];

// Historique des dépenses initial (vide par défaut)
export const DEFAULT_EXPENSE_HISTORY: ExpenseRecord[] = [];


// Configuration visuelle des catégories fixes
export const CATEGORY_CONFIG: Record<FixedCategoryType, CategoryMeta> = {
  logement: {
    label: 'Logement & Loyer',
    icon: 'home-outline',
    color: '#9b6fba',
    bg: '#f3eef8',
  },
  energie: {
    label: 'Énergie & Eau',
    icon: 'flash-outline',
    color: '#d9822b',
    bg: '#fcf2e8',
  },
  assurance: {
    label: 'Assurances',
    icon: 'shield-checkmark-outline',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  abonnements: {
    label: 'Abonnements & Box',
    icon: 'wifi-outline',
    color: '#8557a5',
    bg: '#f3eef8',
  },
  transport: {
    label: 'Transport & Véhicule',
    icon: 'car-outline',
    color: '#0891b2',
    bg: '#ecfeff',
  },
  credit: {
    label: 'Crédits & Emprunts',
    icon: 'card-outline',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  autre: {
    label: 'Autres charges',
    icon: 'receipt-outline',
    color: '#64748b',
    bg: '#f8fafc',
  },
};

// Presets d'icônes pour charges variables
export const PRESET_ICONS: PresetIcon[] = [
  { icon: 'cart-outline', label: 'Courses' },
  { icon: 'restaurant-outline', label: 'Resto' },
  { icon: 'shirt-outline', label: 'Shopping' },
  { icon: 'car-sport-outline', label: 'Auto' },
  { icon: 'medkit-outline', label: 'Santé' },
  { icon: 'football-outline', label: 'Sport' },
  { icon: 'airplane-outline', label: 'Voyage' },
  { icon: 'film-outline', label: 'Cinéma' },
  { icon: 'construct-outline', label: 'Brico' },
  { icon: 'gift-outline', label: 'Cadeaux' },
  { icon: 'cafe-outline', label: 'Café' },
  { icon: 'basket-outline', label: 'Marché' },
];

// Presets de couleurs pour charges variables
export const PRESET_COLORS: string[] = [
  '#9b6fba',
  '#d9822b',
  '#8557a5',
  '#2563eb',
  '#1b9963',
  '#0891b2',
  '#e11d48',
  '#d97706',
];
