import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { computeSavings } from '@/constants/breakdown';
import { formatEuro, formatEuroRound } from '@/constants/formatters';
import {
  isChargeActiveInMonth,
  getSimulationMonthPresets,
  getMonthsDifference,
  addMonthsToMonthStr,
  formatMonthYear,
  formatMonthYearFull,
} from '@/utils/fixed-expenses';

/**
 * Custom Hook Métier (Couche 2 SOLID) dédié à l'écran d'accueil Klyro
 * Découple totalement les calculs et le state métier du composant de rendu UI.
 */
export function useHomeSummary() {
  const {
    budget,
    totalFixedExpenses,
    fixedExpensesList,
    totalEstimatedVariable,
    saveBudget,
    isLoading,
    selectedSimulationMonth,
    setSelectedSimulationMonth,
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

  // Mois courant au format YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // Décalage du mois sélectionné par rapport au mois actuel (ex: 0 = actuel, 1 = M+1...)
  const selectedMonthOffset = useMemo(
    () => getMonthsDifference(currentMonthStr, selectedSimulationMonth),
    [currentMonthStr, selectedSimulationMonth]
  );

  const isSimulating = selectedMonthOffset > 0;

  // Présélections de simulation pour le carrousel horizontal (+0, +1, +2, +3, +6, +12)
  const simulationPresets = useMemo(
    () => getSimulationMonthPresets(currentMonthStr, 13),
    [currentMonthStr]
  );

  const selectedMonthFormatted = useMemo(
    () => formatMonthYearFull(selectedSimulationMonth),
    [selectedSimulationMonth]
  );

  const selectedMonthShort = useMemo(
    () => formatMonthYear(selectedSimulationMonth),
    [selectedSimulationMonth]
  );

  // Actions de navigation temporelle
  const handleSelectSimulationMonth = useCallback(
    (m: string) => {
      setSelectedSimulationMonth(m);
    },
    [setSelectedSimulationMonth]
  );

  const handleNextSimulationMonth = useCallback(() => {
    const offset = getMonthsDifference(currentMonthStr, selectedSimulationMonth);
    if (offset >= 12) return;
    setSelectedSimulationMonth(addMonthsToMonthStr(selectedSimulationMonth, 1));
  }, [currentMonthStr, selectedSimulationMonth, setSelectedSimulationMonth]);

  const handlePrevSimulationMonth = useCallback(() => {
    const offset = getMonthsDifference(currentMonthStr, selectedSimulationMonth);
    if (offset <= 0) return;
    setSelectedSimulationMonth(addMonthsToMonthStr(selectedSimulationMonth, -1));
  }, [currentMonthStr, selectedSimulationMonth, setSelectedSimulationMonth]);

  const handleResetToCurrentMonth = useCallback(() => {
    setSelectedSimulationMonth(currentMonthStr);
  }, [currentMonthStr, setSelectedSimulationMonth]);

  // Valeur locale de l'input revenu direct (null = synchronisé avec budget.income)
  const [localIncome, setLocalIncome] = useState<string | null>(null);

  const incomeInput = localIncome !== null ? localIncome : (budget.income === 0 ? '' : budget.income.toString());
  const parsedIncome = Math.max(0, parseFloat(incomeInput.replace(',', '.')) || 0);

  // Charges fixes actives pour le mois sélectionné (prend en compte crédits amortis et charges programmées)
  const activeFixedExpenses = useMemo(
    () =>
      fixedExpensesList.filter((item) =>
        isChargeActiveInMonth(item, selectedSimulationMonth, currentMonthStr)
      ),
    [fixedExpensesList, selectedSimulationMonth, currentMonthStr]
  );

  const simulatedTotalFixedExpenses = useMemo(
    () => Math.round(activeFixedExpenses.reduce((sum, item) => sum + item.amount, 0) * 100) / 100,
    [activeFixedExpenses]
  );

  // Reste à vivre actuel (ce mois-ci)
  const resteAVivre = useMemo(
    () => Math.round((parsedIncome - totalFixedExpenses) * 100) / 100,
    [parsedIncome, totalFixedExpenses]
  );

  // Reste à vivre simulé (pour le mois sélectionné)
  const simulatedResteAVivre = useMemo(
    () => Math.round((parsedIncome - simulatedTotalFixedExpenses) * 100) / 100,
    [parsedIncome, simulatedTotalFixedExpenses]
  );

  // Différence de reste à vivre par rapport au mois actuel (positif = plus de pouvoir d'achat)
  const differenceResteAVivre = useMemo(
    () => Math.round((simulatedResteAVivre - resteAVivre) * 100) / 100,
    [simulatedResteAVivre, resteAVivre]
  );

  // Le seuil nécessaire est égal par défaut aux charges variables sauf personnalisation explicite
  const defaultNecessary = totalEstimatedVariable;
  const effectiveNecessary =
    budget.isCustomTargetNecessary && budget.targetNecessary !== undefined
      ? budget.targetNecessary
      : defaultNecessary;

  // Épargne calculée (mois actuel)
  const epargneAmount = useMemo(
    () => computeSavings(resteAVivre, effectiveNecessary),
    [resteAVivre, effectiveNecessary]
  );

  // Compte courant (mois actuel)
  const checkingAmount = useMemo(
    () => Math.max(0, Math.round((resteAVivre - epargneAmount) * 100) / 100),
    [resteAVivre, epargneAmount]
  );

  // Épargne simulée (mois sélectionné)
  const simulatedEpargneAmount = useMemo(
    () => computeSavings(simulatedResteAVivre, effectiveNecessary),
    [simulatedResteAVivre, effectiveNecessary]
  );

  // Compte courant simulé (mois sélectionné)
  const simulatedCheckingAmount = useMemo(
    () => Math.max(0, Math.round((simulatedResteAVivre - simulatedEpargneAmount) * 100) / 100),
    [simulatedResteAVivre, simulatedEpargneAmount]
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
    return Math.min(100, Math.round((simulatedTotalFixedExpenses / parsedIncome) * 100));
  }, [simulatedTotalFixedExpenses, parsedIncome]);

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
    // Données actuelles
    resteAVivre,
    epargneAmount,
    checkingAmount,
    totalFixedExpenses,
    // Données de simulation du mois sélectionné
    selectedSimulationMonth,
    selectedMonthOffset,
    isSimulating,
    simulationPresets,
    selectedMonthFormatted,
    selectedMonthShort,
    simulatedTotalFixedExpenses,
    simulatedResteAVivre,
    simulatedEpargneAmount,
    simulatedCheckingAmount,
    differenceResteAVivre,
    // Handlers navigation temporelle
    handleSelectSimulationMonth,
    handleNextSimulationMonth,
    handlePrevSimulationMonth,
    handleResetToCurrentMonth,
    // Métriques & ratios
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
