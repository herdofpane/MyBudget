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
 * Domain custom hook (SOLID Layer 2) dedicated to the Home screen.
 * Decouples calculation and business logic from presentation.
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

  const [isPrivate, setIsPrivate] = useState(false);

  const [infoDialog, setInfoDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    subtext?: string;
  } | null>(null);

  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const selectedMonthOffset = useMemo(
    () => getMonthsDifference(currentMonthStr, selectedSimulationMonth),
    [currentMonthStr, selectedSimulationMonth]
  );

  const isSimulating = selectedMonthOffset > 0;

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

  const [localIncome, setLocalIncome] = useState<string | null>(null);

  const incomeInput = localIncome !== null ? localIncome : (budget.income === 0 ? '' : budget.income.toString());
  const parsedIncome = Math.max(0, parseFloat(incomeInput.replace(',', '.')) || 0);

  // Filter fixed expenses active in the target simulation month
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

  const resteAVivre = useMemo(
    () => Math.round((parsedIncome - totalFixedExpenses) * 100) / 100,
    [parsedIncome, totalFixedExpenses]
  );

  const simulatedResteAVivre = useMemo(
    () => Math.round((parsedIncome - simulatedTotalFixedExpenses) * 100) / 100,
    [parsedIncome, simulatedTotalFixedExpenses]
  );

  const differenceResteAVivre = useMemo(
    () => Math.round((simulatedResteAVivre - resteAVivre) * 100) / 100,
    [simulatedResteAVivre, resteAVivre]
  );

  const defaultNecessary = totalEstimatedVariable;
  const effectiveNecessary =
    budget.isCustomTargetNecessary && budget.targetNecessary !== undefined
      ? budget.targetNecessary
      : defaultNecessary;

  const epargneAmount = useMemo(
    () => computeSavings(resteAVivre, effectiveNecessary),
    [resteAVivre, effectiveNecessary]
  );

  const checkingAmount = useMemo(
    () => Math.max(0, Math.round((resteAVivre - epargneAmount) * 100) / 100),
    [resteAVivre, epargneAmount]
  );

  const simulatedEpargneAmount = useMemo(
    () => computeSavings(simulatedResteAVivre, effectiveNecessary),
    [simulatedResteAVivre, effectiveNecessary]
  );

  const simulatedCheckingAmount = useMemo(
    () => Math.max(0, Math.round((simulatedResteAVivre - simulatedEpargneAmount) * 100) / 100),
    [simulatedResteAVivre, simulatedEpargneAmount]
  );

  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    return Math.max(1, lastDay - now.getUTCDate());
  }, []);

  const spendingRatio = useMemo(() => {
    if (parsedIncome <= 0) return 0;
    return Math.min(100, Math.round((simulatedTotalFixedExpenses / parsedIncome) * 100));
  }, [simulatedTotalFixedExpenses, parsedIncome]);

  const spendingRemainingPercentage = useMemo(() => {
    return Math.max(0, 100 - spendingRatio);
  }, [spendingRatio]);

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

  useEffect(() => {
    if (localIncome === null) return;

    const timer = setTimeout(() => {
      persistIncomeValue(parsedIncome);
    }, 450);

    return () => clearTimeout(timer);
  }, [localIncome, parsedIncome, persistIncomeValue]);

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
    handleSelectSimulationMonth,
    handleNextSimulationMonth,
    handlePrevSimulationMonth,
    handleResetToCurrentMonth,
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
