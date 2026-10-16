import initialBudgetData from './initial-budget.json';
import categoriesData from './categories.json';

import {
  BudgetData,
  FixedExpenseItem,
  VariableCategory,
  ExpenseRecord,
  FixedCategoryType,
  CategoryMeta,
  PresetIcon,
} from '@/types';

// Données initiales du budget
export const DEFAULT_BUDGET: BudgetData = initialBudgetData.budget;

export const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] =
  initialBudgetData.fixedExpenses as FixedExpenseItem[];

export const DEFAULT_VARIABLE_CATEGORIES: VariableCategory[] =
  initialBudgetData.variableCategories as VariableCategory[];

export const DEFAULT_EXPENSE_HISTORY: ExpenseRecord[] =
  initialBudgetData.expenseHistory as ExpenseRecord[];

// Configurations des catégories fixes
export const CATEGORY_CONFIG = categoriesData.fixedCategories as Record<
  FixedCategoryType,
  CategoryMeta
>;

// Presets d'icônes et de couleurs pour les enveloppes variables
export const PRESET_ICONS: PresetIcon[] = categoriesData.presetIcons;

export const PRESET_COLORS: string[] = categoriesData.presetColors;

export default initialBudgetData;
