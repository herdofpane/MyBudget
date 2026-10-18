import { useState, useMemo, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { computeSavings } from '@/constants/breakdown';
import { formatEuro, formatEuroRound } from '@/constants/formatters';
import { DEFAULT_TARGET_NECESSARY } from '@/data';

/**
 * Custom Hook Métier (Couche 2 SOLID) dédié à l'écran d'accueil Klyro
 * Découple totalement les calculs et le state métier du composant de rendu UI.
 */
export function useHomeSummary() {
  const {
    budget,
    totalFixedExpenses,
    saveBudget,
    isLoading,
  } = useBudget();

  // Mode privé (masquer les soldes)
  const [isPrivate, setIsPrivate] = useState(false);

  // Pop-up d'explication pédagogique
  const [infoDialog, setInfoDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    subtext?: string;
  } | null>(null);

  // Valeur locale de l'input revenu direct (null = valeur officielle)
  const [localIncome, setLocalIncome] = useState<string | null>(null);

  const incomeInput = localIncome !== null ? localIncome : budget.income.toString();
  const parsedIncome = Math.max(0, parseFloat(incomeInput.replace(',', '.')) || 0);

  // Reste à vivre = Revenu - Charges fixes
  const resteAVivre = useMemo(
    () => Math.round((parsedIncome - totalFixedExpenses) * 100) / 100,
    [parsedIncome, totalFixedExpenses]
  );

  // Épargne calculée = formule Klyro : resteAVivre - √(resteAVivre * totalNecessaire)
  const epargneAmount = useMemo(
    () => computeSavings(resteAVivre, budget.targetNecessary ?? DEFAULT_TARGET_NECESSARY),
    [resteAVivre, budget.targetNecessary]
  );

  // Compte courant = Reste à vivre - Épargne
  const checkingAmount = useMemo(
    () => Math.max(0, Math.round((resteAVivre - epargneAmount) * 100) / 100),
    [resteAVivre, epargneAmount]
  );

  // Jours restants dans le mois
  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(1, lastDay - now.getDate());
  }, []);

  // Ratio des charges / dépenses par rapport au revenu
  const spendingRatio = useMemo(() => {
    if (parsedIncome <= 0) return 0;
    return Math.min(100, Math.round((totalFixedExpenses / parsedIncome) * 100));
  }, [totalFixedExpenses, parsedIncome]);

  const spendingRemainingPercentage = useMemo(() => {
    return Math.max(0, 100 - spendingRatio);
  }, [spendingRatio]);

  // Sauvegarde automatique lors du blur
  const handleBlurIncome = useCallback(async () => {
    if (parsedIncome <= 0) {
      setLocalIncome(null);
      return;
    }

    try {
      await saveBudget({
        ...budget,
        income: parsedIncome,
        fixedExpenses: totalFixedExpenses,
        savingsAccount: epargneAmount,
        checkingAccount: checkingAmount,
      });
    } catch (error) {
      console.error('[useHomeSummary] Erreur lors de la sauvegarde du revenu:', error);
    } finally {
      setLocalIncome(null);
    }
  }, [parsedIncome, saveBudget, budget, totalFixedExpenses, epargneAmount, checkingAmount]);

  const togglePrivate = useCallback(() => {
    setIsPrivate((prev) => !prev);
  }, []);

  const renderMoney = useCallback(
    (amount: number, prefix: string = '') => {
      if (isPrivate) return '•••• €';
      return `${prefix}${formatEuro(amount)}`;
    },
    [isPrivate]
  );

  const renderMoneyRound = useCallback(
    (amount: number, prefix: string = '') => {
      if (isPrivate) return '•••• €';
      return `${prefix}${formatEuroRound(amount)}`;
    },
    [isPrivate]
  );

  return {
    budget,
    isLoading,
    isPrivate,
    incomeInput,
    parsedIncome,
    resteAVivre,
    epargneAmount,
    checkingAmount,
    totalFixedExpenses,
    daysRemaining,
    spendingRatio,
    spendingRemainingPercentage,
    infoDialog,
    setInfoDialog,
    setLocalIncome,
    handleBlurIncome,
    togglePrivate,
    renderMoney,
    renderMoneyRound,
  };
}
