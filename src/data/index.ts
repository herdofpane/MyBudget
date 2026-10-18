import {
  BudgetData,
  FixedExpenseItem,
  VariableCategory,
  ExpenseRecord,
  FixedCategoryType,
  CategoryMeta,
  PresetIcon,
} from '@/types';

// Constantes métier par défaut du budget standard Klyro
export const DEFAULT_INCOME = 977;
export const DEFAULT_TARGET_NECESSARY = 123;
export const DEFAULT_TARGET_FACULTATIVE = 130;
export const DEFAULT_ONE_TIME_AMOUNT = 566.17;
export const DEFAULT_ONE_TIME_NECESSARY = 198.16;
export const DEFAULT_ONE_TIME_FACULTATIVE = 136.79;
export const DEFAULT_ONE_TIME_SAVINGS = 231.22;

// Données initiales du budget (synchronisées avec le modèle mensuel et ponctuel)
export const DEFAULT_BUDGET: BudgetData = {
  income: DEFAULT_INCOME,
  fixedExpenses: 0,
  checkingAccount: DEFAULT_INCOME,
  savingsAccount: 0,
  targetNecessary: DEFAULT_TARGET_NECESSARY,
  targetFacultative: DEFAULT_TARGET_FACULTATIVE,
  oneTimeIncome: {
    amount: DEFAULT_ONE_TIME_AMOUNT,
    necessary: DEFAULT_ONE_TIME_NECESSARY,
    facultative: DEFAULT_ONE_TIME_FACULTATIVE,
    savings: DEFAULT_ONE_TIME_SAVINGS,
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

// Presets d'icônes pour charges fixes (mode modification manuelle)
export const FIXED_PRESET_ICONS: PresetIcon[] = [
  { icon: 'home-outline', label: 'Logement' },
  { icon: 'flash-outline', label: 'Énergie' },
  { icon: 'shield-checkmark-outline', label: 'Assurance' },
  { icon: 'wifi-outline', label: 'Internet' },
  { icon: 'play-circle-outline', label: 'Streaming' },
  { icon: 'car-sport-outline', label: 'Auto' },
  { icon: 'train-outline', label: 'Transport' },
  { icon: 'card-outline', label: 'Banque' },
  { icon: 'cash-outline', label: 'Crédit' },
  { icon: 'medkit-outline', label: 'Santé' },
  { icon: 'barbell-outline', label: 'Sport' },
  { icon: 'document-text-outline', label: 'Impôts' },
  { icon: 'school-outline', label: 'École' },
  { icon: 'paw-outline', label: 'Animaux' },
  { icon: 'receipt-outline', label: 'Autre' },
];

