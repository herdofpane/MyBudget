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
 * Service de stockage isolé (Couche 3 - Architecture SOLID)
 * Responsable unique de la persistance locale via AsyncStorage et de la sérialisation des I/O.
 */
class BudgetStorageService {
  private writeQueue: Promise<void> = Promise.resolve();

  /**
   * Génère un identifiant unique robuste sans collision (Timestamp + Hash aléatoire)
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Charge l'état budgétaire sauvegardé avec validation et valeurs par défaut
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
      return {
        budget: parsed.budget ? { ...DEFAULT_BUDGET, ...parsed.budget } : DEFAULT_BUDGET,
        fixedExpensesList: Array.isArray(parsed.fixedExpensesList)
          ? parsed.fixedExpensesList
          : DEFAULT_FIXED_EXPENSES,
        variableCategories: Array.isArray(parsed.variableCategories)
          ? parsed.variableCategories
          : DEFAULT_VARIABLE_CATEGORIES,
        expenseHistory: Array.isArray(parsed.expenseHistory)
          ? parsed.expenseHistory
          : DEFAULT_EXPENSE_HISTORY,
      };
    } catch (error) {
      console.warn('[BudgetStorageService] Erreur lors du chargement des données:', error);
      return {
        budget: DEFAULT_BUDGET,
        fixedExpensesList: DEFAULT_FIXED_EXPENSES,
        variableCategories: DEFAULT_VARIABLE_CATEGORIES,
        expenseHistory: DEFAULT_EXPENSE_HISTORY,
      };
    }
  }

  /**
   * Sauvegarde l'état de manière sérialisée (Mutex / Queue) pour éviter les Race Conditions
   */
  async saveState(state: PersistedBudgetState): Promise<void> {
    this.writeQueue = this.writeQueue
      .catch(() => {})
      .then(async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error('[BudgetStorageService] Erreur lors de la sauvegarde:', error);
          throw error;
        }
      });

    return this.writeQueue;
  }
}

export const budgetStorageService = new BudgetStorageService();
