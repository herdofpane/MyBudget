import { useState, useMemo, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { computeSavings } from '@/constants/breakdown';
import { formatEuro, formatEuroRound } from '@/constants/formatters';

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
    () => computeSavings(resteAVivre, budget.targetNecessary || 123),
    [resteAVivre, budget.targetNecessary]
  );

  // Compte courant = Reste à vivre - Épargne
  const checkingAmount = useMemo(
    () => Math.max(0, Math.round((resteAVivre - epargneAmount) * 100) / 100),
    [resteAVivre, epargneAmount]
  );

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
    infoDialog,
    setInfoDialog,
    setLocalIncome,
    handleBlurIncome,
    togglePrivate,
    renderMoney,
    renderMoneyRound,
  };
}
