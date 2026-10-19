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
   * Identifiants des anciens mocks par défaut à purger si présents dans le stockage local
   */
  private readonly legacyMockFixedIds = new Set(['1', '2', '3']);
  private readonly legacyMockVarIds = new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']);
  private readonly legacyMockHistoryIds = new Set(['h1', 'h2', 'h3']);

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

      // Purger les anciennes données de test/démonstration
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

      // Migration / nettoyage : réinitialiser les anciens revenus mock (977 € ou 566.17 €) à 0 par défaut
      const isLegacyIncome = parsed.budget?.income === 977;
      const isLegacyOneTime = parsed.budget?.oneTimeIncome?.amount === 566.17;

      const isCustomTargetNecessary =
        parsed.budget?.isCustomTargetNecessary === true &&
        parsed.budget?.targetNecessary !== 123;

      const budget: BudgetData = parsed.budget
        ? {
            ...DEFAULT_BUDGET,
            ...parsed.budget,
            income: isLegacyIncome ? 0 : (parsed.budget.income ?? 0),
            checkingAccount:
              isLegacyIncome && parsed.budget.checkingAccount === 977
                ? 0
                : (parsed.budget.checkingAccount ?? 0),
            fixedExpenses:
              parsed.budget.fixedExpenses === 61.73 ? cleanedFixedExpenses : (parsed.budget.fixedExpenses ?? cleanedFixedExpenses),
            targetNecessary:
              parsed.budget.targetNecessary === 123 && !parsed.budget.isCustomTargetNecessary
                ? 0
                : (parsed.budget.targetNecessary ?? 0),
            isCustomTargetNecessary,
            oneTimeIncome: isLegacyOneTime
              ? DEFAULT_BUDGET.oneTimeIncome
              : (parsed.budget.oneTimeIncome ?? DEFAULT_BUDGET.oneTimeIncome),
          }
        : DEFAULT_BUDGET;

      const cleanedState: PersistedBudgetState = {
        budget,
        fixedExpensesList,
        variableCategories,
        expenseHistory,
      };

      // Si le stockage contenait les anciens mocks, resynchroniser immédiatement
      if (
        (parsed.fixedExpensesList && parsed.fixedExpensesList.length !== fixedExpensesList.length) ||
        (parsed.variableCategories && parsed.variableCategories.length !== variableCategories.length) ||
        (parsed.budget && (
          parsed.budget.fixedExpenses === 61.73 ||
          isLegacyIncome ||
          isLegacyOneTime ||
          (parsed.budget.targetNecessary === 123 && !parsed.budget.isCustomTargetNecessary)
        ))
      ) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
      }

      return cleanedState;
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
