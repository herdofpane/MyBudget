import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

import { STORAGE_KEY } from '@/constants';

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

  // Charger les données sauvegardées depuis le stockage local
  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.budget) setBudget(parsed.budget);
          if (parsed.fixedExpensesList) setFixedExpensesList(parsed.fixedExpensesList);
          if (parsed.variableCategories) setVariableCategories(parsed.variableCategories);
          if (parsed.expenseHistory) setExpenseHistory(parsed.expenseHistory);
        }
      } catch (err) {
        console.warn('Erreur chargement budget depuis AsyncStorage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sauvegarder dans AsyncStorage
  const persistState = async (
    newBudget: BudgetData,
    newFixed: FixedExpenseItem[],
    newVariable: VariableCategory[],
    newHistory: ExpenseRecord[]
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          budget: newBudget,
          fixedExpensesList: newFixed,
          variableCategories: newVariable,
          expenseHistory: newHistory,
        })
      );
    } catch (err) {
      console.warn('Erreur sauvegarde budget vers AsyncStorage', err);
    }
  };

  const saveBudget = async (newBudget: BudgetData) => {
    setBudget(newBudget);
    await persistState(newBudget, fixedExpensesList, variableCategories, expenseHistory);
  };

  const updateItem = async (key: keyof BudgetData, value: number) => {
    const updated = { ...budget, [key]: Math.max(0, value) };
    await saveBudget(updated);
  };

  // Gestion des charges fixes
  const addFixedExpense = async (item: Omit<FixedExpenseItem, 'id'>) => {
    const newItem: FixedExpenseItem = {
      ...item,
      id: Date.now().toString(),
    };
    const updatedList = [...fixedExpensesList, newItem];
    const totalFixed = updatedList.reduce((sum, i) => sum + i.amount, 0);
    const updatedBudget = { ...budget, fixedExpenses: totalFixed };

    setFixedExpensesList(updatedList);
    setBudget(updatedBudget);
    await persistState(updatedBudget, updatedList, variableCategories, expenseHistory);
  };

  const updateFixedExpense = async (item: FixedExpenseItem) => {
    const updatedList = fixedExpensesList.map((i) => (i.id === item.id ? item : i));
    const totalFixed = updatedList.reduce((sum, i) => sum + i.amount, 0);
    const updatedBudget = { ...budget, fixedExpenses: totalFixed };

    setFixedExpensesList(updatedList);
    setBudget(updatedBudget);
    await persistState(updatedBudget, updatedList, variableCategories, expenseHistory);
  };

  const deleteFixedExpense = async (id: string) => {
    const updatedList = fixedExpensesList.filter((i) => i.id !== id);
    const totalFixed = updatedList.reduce((sum, i) => sum + i.amount, 0);
    const updatedBudget = { ...budget, fixedExpenses: totalFixed };

    setFixedExpensesList(updatedList);
    setBudget(updatedBudget);
    await persistState(updatedBudget, updatedList, variableCategories, expenseHistory);
  };

  const toggleFixedExpensePaid = async (id: string) => {
    const updatedList = fixedExpensesList.map((i) =>
      i.id === id ? { ...i, isPaid: !i.isPaid } : i
    );
    setFixedExpensesList(updatedList);
    await persistState(budget, updatedList, variableCategories, expenseHistory);
  };

  // Gestion des charges variables
  const addVariableCategory = async (category: Omit<VariableCategory, 'id'>) => {
    const newCat: VariableCategory = {
      ...category,
      id: Date.now().toString(),
    };
    const updated = [...variableCategories, newCat];
    setVariableCategories(updated);
    await persistState(budget, fixedExpensesList, updated, expenseHistory);
  };

  const updateVariableCategory = async (category: VariableCategory) => {
    const updated = variableCategories.map((c) => (c.id === category.id ? category : c));
    setVariableCategories(updated);
    await persistState(budget, fixedExpensesList, updated, expenseHistory);
  };

  const deleteVariableCategory = async (id: string) => {
    const updated = variableCategories.filter((c) => c.id !== id);
    setVariableCategories(updated);
    await persistState(budget, fixedExpensesList, updated, expenseHistory);
  };

  const addExpenseToCategory = async (categoryId: string, amount: number, label: string) => {
    const newRecord: ExpenseRecord = {
      id: Date.now().toString(),
      categoryId,
      label,
      amount,
      date: new Date().toISOString(),
    };
    const updatedHistory = [newRecord, ...expenseHistory];
    const updatedCategories = variableCategories.map((c) =>
      c.id === categoryId ? { ...c, spent: c.spent + amount } : c
    );

    setExpenseHistory(updatedHistory);
    setVariableCategories(updatedCategories);
    await persistState(budget, fixedExpensesList, updatedCategories, updatedHistory);
  };

  const resetMonthStatus = async () => {
    const resetFixed = fixedExpensesList.map((i) => ({ ...i, isPaid: false }));
    const resetVar = variableCategories.map((c) => ({ ...c, spent: 0 }));
    setFixedExpensesList(resetFixed);
    setVariableCategories(resetVar);
    await persistState(budget, resetFixed, resetVar, []);
  };

  // Métriques calculées dynamiques
  const totalBalance = budget.checkingAccount + budget.savingsAccount;
  const totalFixedExpenses = fixedExpensesList.reduce((acc, item) => acc + item.amount, 0);
  const totalPaidFixedExpenses = fixedExpensesList
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

  return (
    <BudgetContext.Provider
      value={{
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
        addVariableCategory,
        updateVariableCategory,
        deleteVariableCategory,
        addExpenseToCategory,
        resetMonthStatus,
      }}>
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
