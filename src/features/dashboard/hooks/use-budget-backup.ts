import { useState, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { PersistedBudgetState } from '@/types';
import {
  DEFAULT_BUDGET,
  DEFAULT_FIXED_EXPENSES,
  DEFAULT_VARIABLE_CATEGORIES,
  DEFAULT_EXPENSE_HISTORY,
} from '@/data';

export interface BackupPayload {
  readonly version: string;
  readonly exportedAt: string;
  readonly data: PersistedBudgetState;
}

export interface UseBudgetBackupReturn {
  readonly isProcessing: boolean;
  readonly feedback: { type: 'success' | 'error'; message: string } | null;
  readonly clearFeedback: () => void;
  readonly exportBackupToJson: () => string;
  readonly importBackupFromJson: (rawJson: string) => Promise<boolean>;
  readonly resetToDefaults: () => Promise<void>;
}

const BACKUP_VERSION = '1.0.0';

/**
 * Validates whether parsed JSON payload strictly conforms to PersistedBudgetState.
 */
function isValidBudgetPayload(data: unknown): data is PersistedBudgetState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  const hasBudget = candidate.budget && typeof candidate.budget === 'object';
  const hasFixedList = Array.isArray(candidate.fixedExpensesList);
  const hasVarList = Array.isArray(candidate.variableCategories);
  const hasHistory = Array.isArray(candidate.expenseHistory);

  return Boolean(hasBudget && hasFixedList && hasVarList && hasHistory);
}

/**
 * Domain custom hook managing offline backup exports, defensive schema imports, and state resets.
 */
export function useBudgetBackup(): UseBudgetBackupReturn {
  const {
    budget,
    fixedExpensesList,
    variableCategories,
    expenseHistory,
    restoreState,
  } = useBudget();

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const exportBackupToJson = useCallback((): string => {
    const payload: BackupPayload = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        budget,
        fixedExpensesList,
        variableCategories,
        expenseHistory,
      },
    };
    return JSON.stringify(payload, null, 2);
  }, [budget, fixedExpensesList, variableCategories, expenseHistory]);

  const importBackupFromJson = useCallback(
    async (rawJson: string): Promise<boolean> => {
      setIsProcessing(true);
      setFeedback(null);

      try {
        const parsed = JSON.parse(rawJson);
        const candidateState = parsed.data ?? parsed;

        if (!isValidBudgetPayload(candidateState)) {
          setFeedback({
            type: 'error',
            message: 'Fichier invalide : structure de données de budget corrompue ou incompatible.',
          });
          return false;
        }

        await restoreState(candidateState);
        setFeedback({
          type: 'success',
          message: 'Données budgétaires restaurées avec succès.',
        });
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: 'Erreur de lecture : le texte fourni n’est pas un JSON valide.',
        });
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [restoreState]
  );

  const resetToDefaults = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    try {
      await restoreState({
        budget: DEFAULT_BUDGET,
        fixedExpensesList: DEFAULT_FIXED_EXPENSES,
        variableCategories: DEFAULT_VARIABLE_CATEGORIES,
        expenseHistory: DEFAULT_EXPENSE_HISTORY,
      });
      setFeedback({
        type: 'success',
        message: 'Application réinitialisée aux réglages par défaut.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Échec de la réinitialisation des données.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [restoreState]);

  return {
    isProcessing,
    feedback,
    clearFeedback,
    exportBackupToJson,
    importBackupFromJson,
    resetToDefaults,
  };
}
