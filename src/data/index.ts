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
  fixedExpenses: 61.73,
  checkingAccount: 915.27,
  savingsAccount: 579.74,
  targetNecessary: 123,
  targetFacultative: 130,
  oneTimeIncome: {
    amount: 566.17,
    necessary: 198.16,
    facultative: 136.79,
    savings: 231.22,
  },
};

// Liste des charges fixes par défaut (Total = 61.73 € synchronisé avec le tableur CSV)
export const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] = [
  {
    id: '1',
    label: 'Abonnements & Forfait mobile',
    amount: 19.99,
    category: 'abonnements',
    icon: 'phone-portrait-outline',
    dueDay: 5,
    isPaid: true,
  },
  {
    id: '2',
    label: 'Assurance',
    amount: 30.00,
    category: 'assurance',
    icon: 'shield-checkmark-outline',
    dueDay: 10,
    isPaid: true,
  },
  {
    id: '3',
    label: 'Frais bancaires & divers',
    amount: 11.74,
    category: 'autre',
    icon: 'card-outline',
    dueDay: 15,
    isPaid: true,
  },
];

// Liste des charges variables par défaut avec durée de vie et lissage mensuel
export const DEFAULT_VARIABLE_CATEGORIES: VariableCategory[] = [
  {
    id: 'v1',
    label: 'Alimentation & Courses',
    totalAmount: 450,
    durationMonths: 1,
    estimatedBudget: 450,
    spent: 280,
    icon: 'cart-outline',
    color: '#9b6fba',
  },
  {
    id: 'v2',
    label: 'Sorties & Restaurants',
    totalAmount: 220,
    durationMonths: 1,
    estimatedBudget: 220,
    spent: 165,
    icon: 'restaurant-outline',
    color: '#d9822b',
  },
  {
    id: 'v3',
    label: 'Shopping & Habillement',
    totalAmount: 150,
    durationMonths: 1,
    estimatedBudget: 150,
    spent: 65,
    icon: 'shirt-outline',
    color: '#8557a5',
  },
  {
    id: 'v4',
    label: 'Carburant & Déplacements',
    totalAmount: 90,
    durationMonths: 1,
    estimatedBudget: 90,
    spent: 50,
    icon: 'car-sport-outline',
    color: '#2563eb',
  },
  {
    id: 'v5',
    label: 'Santé, Beauté & Bien-être',
    totalAmount: 70,
    durationMonths: 1,
    estimatedBudget: 70,
    spent: 30,
    icon: 'medkit-outline',
    color: '#1b9963',
  },
  {
    id: 'v6',
    label: 'Loisirs, Sport & Vacances',
    totalAmount: 120,
    durationMonths: 1,
    estimatedBudget: 120,
    spent: 75,
    icon: 'football-outline',
    color: '#0891b2',
  },
];

// Historique des dépenses initial
export const DEFAULT_EXPENSE_HISTORY: ExpenseRecord[] = [
  {
    id: 'h1',
    categoryId: 'v1',
    label: 'Courses supermarché',
    amount: 85.5,
    date: '2026-10-14T10:30:00Z',
  },
  {
    id: 'h2',
    categoryId: 'v2',
    label: 'Restaurant italien',
    amount: 45.0,
    date: '2026-10-12T20:15:00Z',
  },
  {
    id: 'h3',
    categoryId: 'v4',
    label: 'Plein essence SP95',
    amount: 50.0,
    date: '2026-10-10T08:45:00Z',
  },
];

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
