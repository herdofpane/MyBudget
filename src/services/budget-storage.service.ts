import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '@/constants';
import {
  BudgetData,
  FixedExpenseItem,
  VariableCategory,
  ExpenseRecord,
} from '@/types';
import {
  DEFAULT_BUDGET,
  DEFAULT_FIXED_EXPENSES,
  DEFAULT_VARIABLE_CATEGORIES,
  DEFAULT_EXPENSE_HISTORY,
} from '@/data';

export interface PersistedBudgetState {
  budget: BudgetData;
  fixedExpensesList: FixedExpenseItem[];
  variableCategories: VariableCategory[];
  expenseHistory: ExpenseRecord[];
}

/**
 * Isolated storage service (SOLID Layer 3)
 * Single responsibility: handles local persistence via AsyncStorage and serializes I/O writes.
 */
class BudgetStorageService {
  private writeQueue: Promise<void> = Promise.resolve();

  /**
   * Generates a collision-resistant unique identifier (timestamp + random alphanumeric).
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Legacy mock IDs to purge if found in existing user storage.
   */
  private readonly legacyMockFixedIds = new Set(['1', '2', '3']);
  private readonly legacyMockVarIds = new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']);
  private readonly legacyMockHistoryIds = new Set(['h1', 'h2', 'h3']);

  /**
   * Loads persisted budget state with sanitization and fallback defaults.
   */
  async loadState(): Promise<PersistedBudgetState> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          budget: DEFAULT_BUDGET,
          fixedExpensesList: DEFAULT_FIXED_EXPENSES,
          variableCategories: DEFAULT_VARIABLE_CATEGORIES,
          expenseHistory: DEFAULT_EXPENSE_HISTORY,
        };
      }

      const parsed = JSON.parse(raw);

      // Purge legacy test/demonstration mock items
      const fixedExpensesList: FixedExpenseItem[] = Array.isArray(parsed.fixedExpensesList)
        ? parsed.fixedExpensesList.filter(
            (item: FixedExpenseItem) =>
              !(
                this.legacyMockFixedIds.has(item.id) &&
                ['Abonnements & Forfait mobile', 'Assurance', 'Frais bancaires & divers'].includes(
                  item.label
                )
              )
          )
        : DEFAULT_FIXED_EXPENSES;

      const variableCategories: VariableCategory[] = Array.isArray(parsed.variableCategories)
        ? parsed.variableCategories.filter(
            (cat: VariableCategory) =>
              !(
                this.legacyMockVarIds.has(cat.id) &&
                [
                  'Alimentation & Courses',
                  'Sorties & Restaurants',
                  'Shopping & Habillement',
                  'Carburant & Déplacements',
                  'Santé, Beauté & Bien-être',
                  'Loisirs, Sport & Vacances',
                ].includes(cat.label)
              )
          )
        : DEFAULT_VARIABLE_CATEGORIES;

      const expenseHistory: ExpenseRecord[] = Array.isArray(parsed.expenseHistory)
        ? parsed.expenseHistory.filter(
            (rec: ExpenseRecord) => !this.legacyMockHistoryIds.has(rec.id)
          )
        : DEFAULT_EXPENSE_HISTORY;

      const sumFixed = fixedExpensesList.reduce((sum, item) => sum + (item.amount || 0), 0);
      const cleanedFixedExpenses = sumFixed > 0 ? Math.round(sumFixed * 100) / 100 : 0;

      const isCustomTargetNecessary =
        parsed.budget?.isCustomTargetNecessary === true &&
        parsed.budget?.targetNecessary !== 123;

      const budget: BudgetData = parsed.budget
        ? {
            ...DEFAULT_BUDGET,
            ...parsed.budget,
            income: parsed.budget.income ?? 0,
            checkingAccount: parsed.budget.checkingAccount ?? (parsed.budget.income ?? 0),
            fixedExpenses:
              parsed.budget.fixedExpenses === 61.73 ? cleanedFixedExpenses : (parsed.budget.fixedExpenses ?? cleanedFixedExpenses),
            targetNecessary:
              parsed.budget.targetNecessary === 123 && !parsed.budget.isCustomTargetNecessary
                ? 0
                : (parsed.budget.targetNecessary ?? 0),
            isCustomTargetNecessary,
            oneTimeIncome: parsed.budget.oneTimeIncome ?? DEFAULT_BUDGET.oneTimeIncome,
          }
        : DEFAULT_BUDGET;

      const cleanedState: PersistedBudgetState = {
        budget,
        fixedExpensesList,
        variableCategories,
        expenseHistory,
      };

      // Resynchronize if legacy mock charges or default targetNecessary were detected
      if (
        (parsed.fixedExpensesList && parsed.fixedExpensesList.length !== fixedExpensesList.length) ||
        (parsed.variableCategories && parsed.variableCategories.length !== variableCategories.length) ||
        (parsed.budget && (
          parsed.budget.fixedExpenses === 61.73 ||
          (parsed.budget.targetNecessary === 123 && !parsed.budget.isCustomTargetNecessary)
        ))
      ) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
      }

      return cleanedState;
    } catch (error) {
      console.warn('[BudgetStorageService] Failed to load persisted state:', error);
      return {
        budget: DEFAULT_BUDGET,
        fixedExpensesList: DEFAULT_FIXED_EXPENSES,
        variableCategories: DEFAULT_VARIABLE_CATEGORIES,
        expenseHistory: DEFAULT_EXPENSE_HISTORY,
      };
    }
  }

  /**
   * Serializes write operations to prevent file I/O race conditions.
   */
  async saveState(state: PersistedBudgetState): Promise<void> {
    this.writeQueue = this.writeQueue
      .catch((queueError) => {
        console.warn('[BudgetStorageService] Previous write failed, continuing queue:', queueError);
      })
      .then(async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error('[BudgetStorageService] Failed to save state:', error);
          throw error;
        }
      });

    return this.writeQueue;
  }
}

export const budgetStorageService = new BudgetStorageService();
