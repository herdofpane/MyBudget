import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';

import {
  BudgetData,
  FixedExpenseItem,
  VariableCategory,
  ExpenseRecord,
  BudgetContextType,
} from '@/types';

import {
  DEFAULT_BUDGET,
  DEFAULT_FIXED_EXPENSES,
  DEFAULT_VARIABLE_CATEGORIES,
  DEFAULT_EXPENSE_HISTORY,
} from '@/data';

import { budgetStorageService } from '@/services/budget-storage.service';
import { isChargeActiveInMonth } from '@/utils/fixed-expenses';

// Re-export des types pour compatibilité descendante
export * from '@/types';
export { DEFAULT_BUDGET, DEFAULT_FIXED_EXPENSES, DEFAULT_VARIABLE_CATEGORIES };

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budget, setBudget] = useState<BudgetData>(DEFAULT_BUDGET);
  const [fixedExpensesList, setFixedExpensesList] = useState<FixedExpenseItem[]>(DEFAULT_FIXED_EXPENSES);
  const [variableCategories, setVariableCategories] = useState<VariableCategory[]>(DEFAULT_VARIABLE_CATEGORIES);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseRecord[]>(DEFAULT_EXPENSE_HISTORY);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données depuis le service de stockage dédié (Couche 3 SOLID)
  useEffect(() => {
    async function initData() {
      try {
        const state = await budgetStorageService.loadState();
        setBudget(state.budget);
        setFixedExpensesList(state.fixedExpensesList);
        setVariableCategories(state.variableCategories);
        setExpenseHistory(state.expenseHistory);
      } catch (err) {
        console.warn('[BudgetProvider] Erreur initialisation budget:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Déléguer la persistance au service sérialisé
  const persist = useCallback(
    async (
      newBudget: BudgetData,
      newFixed: FixedExpenseItem[],
      newVariable: VariableCategory[],
      newHistory: ExpenseRecord[]
    ) => {
      await budgetStorageService.saveState({
        budget: newBudget,
        fixedExpensesList: newFixed,
        variableCategories: newVariable,
        expenseHistory: newHistory,
      });
    },
    []
  );

  const saveBudget = useCallback(
    async (newBudget: BudgetData) => {
      setBudget(newBudget);
      await persist(newBudget, fixedExpensesList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, variableCategories, expenseHistory, persist]
  );

  const updateItem = useCallback(
    async (key: keyof BudgetData, value: number) => {
      const updated = { ...budget, [key]: Math.max(0, value) };
      await saveBudget(updated);
    },
    [budget, saveBudget]
  );

  // Gestion des charges fixes (exclut automatiquement les crédits arrivés à échéance)
  const addFixedExpense = useCallback(
    async (item: Omit<FixedExpenseItem, 'id'>) => {
      const newItem: FixedExpenseItem = {
        ...item,
        id: budgetStorageService.generateId(),
      };
      const updatedList = [...fixedExpensesList, newItem];
      const activeList = updatedList.filter((i) => isChargeActiveInMonth(i));
      const totalFixed = Math.round(activeList.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
      const updatedBudget = { ...budget, fixedExpenses: totalFixed };

      setFixedExpensesList(updatedList);
      setBudget(updatedBudget);
      await persist(updatedBudget, updatedList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, budget, variableCategories, expenseHistory, persist]
  );

  const updateFixedExpense = useCallback(
    async (item: FixedExpenseItem) => {
      const updatedList = fixedExpensesList.map((i) => (i.id === item.id ? item : i));
      const activeList = updatedList.filter((i) => isChargeActiveInMonth(i));
      const totalFixed = Math.round(activeList.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
      const updatedBudget = { ...budget, fixedExpenses: totalFixed };

      setFixedExpensesList(updatedList);
      setBudget(updatedBudget);
      await persist(updatedBudget, updatedList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, budget, variableCategories, expenseHistory, persist]
  );

  const deleteFixedExpense = useCallback(
    async (id: string) => {
      const updatedList = fixedExpensesList.filter((i) => i.id !== id);
      const activeList = updatedList.filter((i) => isChargeActiveInMonth(i));
      const totalFixed = Math.round(activeList.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
      const updatedBudget = { ...budget, fixedExpenses: totalFixed };

      setFixedExpensesList(updatedList);
      setBudget(updatedBudget);
      await persist(updatedBudget, updatedList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, budget, variableCategories, expenseHistory, persist]
  );

  const toggleFixedExpensePaid = useCallback(
    async (id: string) => {
      const updatedList = fixedExpensesList.map((i) =>
        i.id === id ? { ...i, isPaid: !i.isPaid } : i
      );
      setFixedExpensesList(updatedList);
      await persist(budget, updatedList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, budget, variableCategories, expenseHistory, persist]
  );

  const advanceCreditMonth = useCallback(
    async (id: string) => {
      const updatedList = fixedExpensesList.map((i) => {
        if (i.id !== id || !i.isCredit) return i;
        const currentPaid = i.paidMonthsCount ?? 0;
        const totalDuration = i.durationMonths ?? 12;
        const newPaid = Math.min(totalDuration, currentPaid + 1);
        return {
          ...i,
          paidMonthsCount: newPaid,
          isPaid: true,
        };
      });
      const activeList = updatedList.filter((i) => isChargeActiveInMonth(i));
      const totalFixed = Math.round(activeList.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
      const updatedBudget = { ...budget, fixedExpenses: totalFixed };

      setFixedExpensesList(updatedList);
      setBudget(updatedBudget);
      await persist(updatedBudget, updatedList, variableCategories, expenseHistory);
    },
    [fixedExpensesList, budget, variableCategories, expenseHistory, persist]
  );

  // Gestion des charges variables
  const addVariableCategory = useCallback(
    async (category: Omit<VariableCategory, 'id'>) => {
      const duration = Math.max(0.01, category.durationMonths || 1);
      const total = category.totalAmount !== undefined ? category.totalAmount : category.estimatedBudget;
      const monthly = Math.round((total / duration) * 100) / 100;

      const newCat: VariableCategory = {
        ...category,
        totalAmount: total,
        durationMonths: duration,
        estimatedBudget: monthly,
        id: budgetStorageService.generateId(),
      };
      const updated = [...variableCategories, newCat];
      setVariableCategories(updated);
      await persist(budget, fixedExpensesList, updated, expenseHistory);
    },
    [variableCategories, budget, fixedExpensesList, expenseHistory, persist]
  );

  const updateVariableCategory = useCallback(
    async (category: VariableCategory) => {
      const duration = Math.max(0.01, category.durationMonths || 1);
      const total = category.totalAmount !== undefined ? category.totalAmount : category.estimatedBudget;
      const monthly = Math.round((total / duration) * 100) / 100;

      const updatedCat: VariableCategory = {
        ...category,
        totalAmount: total,
        durationMonths: duration,
        estimatedBudget: monthly,
      };

      const updated = variableCategories.map((c) => (c.id === category.id ? updatedCat : c));
      setVariableCategories(updated);
      await persist(budget, fixedExpensesList, updated, expenseHistory);
    },
    [variableCategories, budget, fixedExpensesList, expenseHistory, persist]
  );

  const deleteVariableCategory = useCallback(
    async (id: string) => {
      const updated = variableCategories.filter((c) => c.id !== id);
      setVariableCategories(updated);
      await persist(budget, fixedExpensesList, updated, expenseHistory);
    },
    [variableCategories, budget, fixedExpensesList, expenseHistory, persist]
  );

  const addExpenseToCategory = useCallback(
    async (categoryId: string, amount: number, label: string) => {
      if (isNaN(amount) || amount <= 0) return;
      const newRecord: ExpenseRecord = {
        id: budgetStorageService.generateId(),
        categoryId,
        label: label.trim(),
        amount,
        date: new Date().toISOString(),
      };
      const updatedHistory = [newRecord, ...expenseHistory];
      const updatedCategories = variableCategories.map((c) =>
        c.id === categoryId ? { ...c, spent: c.spent + amount } : c
      );

      setExpenseHistory(updatedHistory);
      setVariableCategories(updatedCategories);
      await persist(budget, fixedExpensesList, updatedCategories, updatedHistory);
    },
    [expenseHistory, variableCategories, budget, fixedExpensesList, persist]
  );

  const resetMonthStatus = useCallback(async () => {
    const resetFixed = fixedExpensesList.map((i) => ({ ...i, isPaid: false }));
    const resetVar = variableCategories.map((c) => ({ ...c, spent: 0 }));
    setFixedExpensesList(resetFixed);
    setVariableCategories(resetVar);
    await persist(budget, resetFixed, resetVar, []);
  }, [fixedExpensesList, variableCategories, budget, persist]);

  // Métriques calculées dynamiques (filtrant automatiquement les charges inactives, différées ou soldées)
  const totalBalance = budget.checkingAccount + budget.savingsAccount;
  const activeFixedExpenses = fixedExpensesList.filter((item) => isChargeActiveInMonth(item));
  const totalFixedExpenses =
    fixedExpensesList.length > 0
      ? Math.round(activeFixedExpenses.reduce((acc, item) => acc + item.amount, 0) * 100) / 100
      : (budget.fixedExpenses || 61.73);
  const totalPaidFixedExpenses = activeFixedExpenses
    .filter((item) => item.isPaid)
    .reduce((acc, item) => acc + item.amount, 0);
  const totalRemainingFixedExpenses = totalFixedExpenses - totalPaidFixedExpenses;

  const remainingAllowance = budget.income - totalFixedExpenses;

  const totalEstimatedVariable = variableCategories.reduce((acc, cat) => acc + cat.estimatedBudget, 0);
  const totalSpentVariable = variableCategories.reduce((acc, cat) => acc + cat.spent, 0);

  const projectedSavings = remainingAllowance - totalEstimatedVariable;
  const actualRemainingAllowance = remainingAllowance - totalSpentVariable;

  const fixedExpenseRatio = budget.income > 0 ? (totalFixedExpenses / budget.income) * 100 : 0;
  const variableExpenseRatio = budget.income > 0 ? (totalEstimatedVariable / budget.income) * 100 : 0;
  const savingsCapacityRatio = budget.income > 0 ? Math.max(0, (projectedSavings / budget.income) * 100) : 0;

  const contextValue = useMemo<BudgetContextType>(
    () => ({
      budget: { ...budget, fixedExpenses: totalFixedExpenses },
      fixedExpensesList,
      variableCategories,
      expenseHistory,
      isLoading,
      totalBalance,
      totalFixedExpenses,
      totalPaidFixedExpenses,
      totalRemainingFixedExpenses,
      remainingAllowance,
      totalEstimatedVariable,
      totalSpentVariable,
      projectedSavings,
      actualRemainingAllowance,
      fixedExpenseRatio,
      variableExpenseRatio,
      savingsCapacityRatio,
      saveBudget,
      updateItem,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      toggleFixedExpensePaid,
      advanceCreditMonth,
      addVariableCategory,
      updateVariableCategory,
      deleteVariableCategory,
      addExpenseToCategory,
      resetMonthStatus,
    }),
    [
      budget,
      totalFixedExpenses,
      fixedExpensesList,
      variableCategories,
      expenseHistory,
      isLoading,
      totalBalance,
      totalPaidFixedExpenses,
      totalRemainingFixedExpenses,
      remainingAllowance,
      totalEstimatedVariable,
      totalSpentVariable,
      projectedSavings,
      actualRemainingAllowance,
      fixedExpenseRatio,
      variableExpenseRatio,
      savingsCapacityRatio,
      saveBudget,
      updateItem,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      toggleFixedExpensePaid,
      advanceCreditMonth,
      addVariableCategory,
      updateVariableCategory,
      deleteVariableCategory,
      addExpenseToCategory,
      resetMonthStatus,
    ]
  );

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
