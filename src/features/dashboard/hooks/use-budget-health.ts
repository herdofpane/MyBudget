import { useMemo } from 'react';
import { useBudget } from '@/hooks/use-budget';

export type BudgetHealthStatus = 'optimal' | 'moderate' | 'warning' | 'critical';

export interface BudgetHealthInsight {
  readonly id: string;
  readonly type: 'success' | 'info' | 'warning' | 'alert';
  readonly title: string;
  readonly message: string;
}

export interface UseBudgetHealthReturn {
  readonly income: number;
  readonly totalFixedExpenses: number;
  readonly debtAmount: number;
  readonly debtRatio: number;
  readonly fixedExpenseRatio: number;
  readonly savingsRatio: number;
  readonly resteAVivre: number;
  readonly safetyBufferMonths: number;
  readonly healthScore: number;
  readonly status: BudgetHealthStatus;
  readonly insights: readonly BudgetHealthInsight[];
}

const DEBT_SAFE_THRESHOLD = 33;
const FIXED_EXPENSE_MAX_RATIO = 50;
const RECOMMENDED_BUFFER_MONTHS = 3;

/**
 * Pure calculation helper evaluating composite financial health score (0 - 100).
 */
function calculateHealthScore(
  debtRatio: number,
  fixedRatio: number,
  bufferMonths: number,
  resteAVivre: number
): number {
  let score = 0;
  if (resteAVivre > 0) score += 20;
  if (debtRatio <= DEBT_SAFE_THRESHOLD) score += 30;
  else if (debtRatio <= 40) score += 15;

  if (fixedRatio <= 35) score += 30;
  else if (fixedRatio <= FIXED_EXPENSE_MAX_RATIO) score += 20;
  else if (fixedRatio <= 65) score += 10;

  if (bufferMonths >= RECOMMENDED_BUFFER_MONTHS) score += 20;
  else if (bufferMonths >= 1) score += 10;

  return Math.min(100, Math.max(0, score));
}

/**
 * Domain custom hook providing financial health diagnostics, ratios, and actionable insights.
 */
export function useBudgetHealth(): UseBudgetHealthReturn {
  const { budget, totalFixedExpenses, fixedExpensesList } = useBudget();

  const income = budget.income ?? 0;
  const savingsAccount = budget.savingsAccount ?? 0;
  const resteAVivre = Math.max(0, income - totalFixedExpenses);

  const debtAmount = useMemo(() => {
    return fixedExpensesList
      .filter((item) => item.isCredit)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [fixedExpensesList]);

  const debtRatio = useMemo(() => {
    if (income <= 0) return 0;
    return Math.round((debtAmount / income) * 100);
  }, [debtAmount, income]);

  const fixedExpenseRatio = useMemo(() => {
    if (income <= 0) return 0;
    return Math.round((totalFixedExpenses / income) * 100);
  }, [totalFixedExpenses, income]);

  const savingsRatio = useMemo(() => {
    if (income <= 0) return 0;
    return Math.round((savingsAccount / income) * 100);
  }, [savingsAccount, income]);

  const safetyBufferMonths = useMemo(() => {
    if (totalFixedExpenses <= 0) return 0;
    return Math.round((savingsAccount / totalFixedExpenses) * 10) / 10;
  }, [savingsAccount, totalFixedExpenses]);

  const healthScore = useMemo(() => {
    return calculateHealthScore(debtRatio, fixedExpenseRatio, safetyBufferMonths, resteAVivre);
  }, [debtRatio, fixedExpenseRatio, safetyBufferMonths, resteAVivre]);

  const status: BudgetHealthStatus = useMemo(() => {
    if (healthScore >= 80) return 'optimal';
    if (healthScore >= 60) return 'moderate';
    if (healthScore >= 40) return 'warning';
    return 'critical';
  }, [healthScore]);

  const insights = useMemo((): readonly BudgetHealthInsight[] => {
    const list: BudgetHealthInsight[] = [];

    if (debtRatio > DEBT_SAFE_THRESHOLD) {
      list.push({
        id: 'high-debt',
        type: 'warning',
        title: "Taux d'endettement élevé",
        message: `Vos mensualités de crédit représentent ${debtRatio}% de vos revenus (seuil recommandé : 33%).`,
      });
    }

    if (fixedExpenseRatio > FIXED_EXPENSE_MAX_RATIO) {
      list.push({
        id: 'high-fixed',
        type: 'alert',
        title: 'Charges fixes prépondérantes',
        message: `Vos charges fixes absorbent ${fixedExpenseRatio}% de votre budget. Visez moins de 50%.`,
      });
    } else if (fixedExpenseRatio > 0 && fixedExpenseRatio <= 35) {
      list.push({
        id: 'low-fixed',
        type: 'success',
        title: 'Charges fixes parfaitement maîtrisées',
        message: `Seulement ${fixedExpenseRatio}% de vos revenus sont engagés dans des charges incompressibles.`,
      });
    }

    if (safetyBufferMonths >= RECOMMENDED_BUFFER_MONTHS) {
      list.push({
        id: 'good-buffer',
        type: 'success',
        title: 'Coussin de sécurité confortable',
        message: `Votre épargne permet de couvrir ${safetyBufferMonths} mois de charges fixes sans revenu.`,
      });
    }

    return list;
  }, [debtRatio, fixedExpenseRatio, safetyBufferMonths]);

  return {
    income,
    totalFixedExpenses,
    debtAmount,
    debtRatio,
    fixedExpenseRatio,
    savingsRatio,
    resteAVivre,
    safetyBufferMonths,
    healthScore,
    status,
    insights,
  };
}
