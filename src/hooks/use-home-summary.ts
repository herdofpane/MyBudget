import { useState, useMemo, useCallback, useEffect } from 'react';
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
    totalEstimatedVariable,
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

  // Valeur locale de l'input revenu direct (null = synchronisé avec budget.income)
  const [localIncome, setLocalIncome] = useState<string | null>(null);

  const incomeInput = localIncome !== null ? localIncome : (budget.income === 0 ? '' : budget.income.toString());
  const parsedIncome = Math.max(0, parseFloat(incomeInput.replace(',', '.')) || 0);

  // Reste à vivre = Revenu - Charges fixes
  const resteAVivre = useMemo(
    () => Math.round((parsedIncome - totalFixedExpenses) * 100) / 100,
    [parsedIncome, totalFixedExpenses]
  );

  // Le seuil nécessaire est égal par défaut aux charges variables sauf personnalisation explicite
  const defaultNecessary = totalEstimatedVariable;
  const effectiveNecessary =
    budget.isCustomTargetNecessary && budget.targetNecessary !== undefined
      ? budget.targetNecessary
      : defaultNecessary;

  // Épargne calculée = formule Klyro : resteAVivre - √(resteAVivre * totalNecessaire)
  const epargneAmount = useMemo(
    () => computeSavings(resteAVivre, effectiveNecessary),
    [resteAVivre, effectiveNecessary]
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

  // Sauvegarde persistante du revenu dans le stockage local
  const persistIncomeValue = useCallback(
    async (val: number) => {
      const epargne = computeSavings(
        Math.round((val - totalFixedExpenses) * 100) / 100,
        effectiveNecessary
      );
      const checking = Math.max(
        0,
        Math.round(((val - totalFixedExpenses) - epargne) * 100) / 100
      );

      await saveBudget({
        ...budget,
        income: val,
        fixedExpenses: totalFixedExpenses,
        targetNecessary: effectiveNecessary,
        savingsAccount: epargne,
        checkingAccount: checking,
      });
    },
    [budget, totalFixedExpenses, effectiveNecessary, saveBudget]
  );

  // Sauvegarde automatique avec debounce lors de la frappe pour éviter toute perte en cas de rafraîchissement
  useEffect(() => {
    if (localIncome === null) return;

    const timer = setTimeout(() => {
      persistIncomeValue(parsedIncome);
    }, 450);

    return () => clearTimeout(timer);
  }, [localIncome, parsedIncome, persistIncomeValue]);

  // Sauvegarde instantanée lors de la perte de focus ou de la soumission au clavier
  const handleBlurIncome = useCallback(async () => {
    if (localIncome !== null) {
      await persistIncomeValue(parsedIncome);
      setLocalIncome(null);
    }
  }, [localIncome, parsedIncome, persistIncomeValue]);

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
