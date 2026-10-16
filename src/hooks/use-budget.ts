import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BudgetData {
  income: number;          // Revenu mensuel
  fixedExpenses: number;   // Charges fixes
  checkingAccount: number; // Montant compte courant
  savingsAccount: number;  // Montant épargne
}

export interface FixedExpenseItem {
  id: string;
  label: string;
  amount: number;
  category: 'logement' | 'energie' | 'assurance' | 'abonnements' | 'transport';
  icon: string;
}

const STORAGE_KEY = '@mybudget_data_v1';

const DEFAULT_BUDGET: BudgetData = {
  income: 2850,
  fixedExpenses: 1120,
  checkingAccount: 2430.50,
  savingsAccount: 12500.00,
};

export const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] = [
  { id: '1', label: 'Loyer / Emprunt', amount: 780, category: 'logement', icon: 'home-outline' },
  { id: '2', label: 'Électricité & Gaz', amount: 95, category: 'energie', icon: 'flash-outline' },
  { id: '3', label: 'Assurance habitation & auto', amount: 85, category: 'assurance', icon: 'shield-checkmark-outline' },
  { id: '4', label: 'Internet & Téléphonie', amount: 49.99, category: 'abonnements', icon: 'wifi-outline' },
  { id: '5', label: 'Abonnements (Streaming, Musique)', amount: 35, category: 'abonnements', icon: 'play-circle-outline' },
  { id: '6', label: 'Pass Transport / Carburant', amount: 75, category: 'transport', icon: 'car-outline' },
];

export function useBudget() {
  const [budget, setBudget] = useState<BudgetData>(DEFAULT_BUDGET);
  const [fixedExpensesList, setFixedExpensesList] = useState<FixedExpenseItem[]>(DEFAULT_FIXED_EXPENSES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.budget) setBudget(parsed.budget);
          if (parsed.fixedExpensesList) setFixedExpensesList(parsed.fixedExpensesList);
        }
      } catch (err) {
        console.warn('Failed to load budget from storage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveBudget = async (newBudget: BudgetData) => {
    setBudget(newBudget);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ budget: newBudget, fixedExpensesList })
      );
    } catch (err) {
      console.warn('Failed to save budget to storage', err);
    }
  };

  const updateItem = async (key: keyof BudgetData, value: number) => {
    const updated = { ...budget, [key]: Math.max(0, value) };
    await saveBudget(updated);
  };

  // Métriques calculées
  const totalBalance = budget.checkingAccount + budget.savingsAccount;
  const remainingAllowance = budget.income - budget.fixedExpenses;
  const fixedExpenseRatio = budget.income > 0 ? (budget.fixedExpenses / budget.income) * 100 : 0;
  const savingsCapacityRatio = budget.income > 0 ? Math.max(0, (remainingAllowance / budget.income) * 100) : 0;

  return {
    budget,
    fixedExpensesList,
    isLoading,
    totalBalance,
    remainingAllowance,
    fixedExpenseRatio,
    savingsCapacityRatio,
    updateItem,
    saveBudget,
  };
}
