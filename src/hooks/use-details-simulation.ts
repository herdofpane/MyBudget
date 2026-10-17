import { useState, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { formatEuro } from '@/constants/formatters';
import { computeSavings } from '@/constants/breakdown';

export interface DetailsFeedbackDialogState {
  visible: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  subtext?: string;
}

/**
 * Custom Hook Métier (SOLID SRP - Couche Logique & Accès Données)
 * Isole l'intégralité du state de simulation (mensuelle & ponctuelle),
 * des calculs de décomposition de l'épargne et des actions de sauvegarde pour l'écran Détails.
 */
export function useDetailsSimulation() {
  const {
    budget,
    totalFixedExpenses,
    saveBudget,
    isLoading,
  } = useBudget();

  // Indicateur de sauvegarde en cours
  const [isSaving, setIsSaving] = useState(false);

  // Mode actif : 'monthly' (Mensuelle) ou 'onetime' (Revenu Ponctuel)
  const [activeTab, setActiveTab] = useState<'monthly' | 'onetime'>('monthly');

  // --- ÉTATS DES POP-UPS ---
  const [feedbackDialog, setFeedbackDialog] = useState<DetailsFeedbackDialogState | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // --- VALEURS DE SIMULATION (Overrides) ---
  const [overrideMonthlyIncome, setOverrideMonthlyIncome] = useState<string | null>(null);
  const [overrideMonthlyFixed, setOverrideMonthlyFixed] = useState<string | null>(null);
  const [overrideMonthlyNecessary, setOverrideMonthlyNecessary] = useState<string | null>(null);

  const [overrideOneTimeAmount, setOverrideOneTimeAmount] = useState<string | null>(null);
  const [overrideOneTimeNecessary, setOverrideOneTimeNecessary] = useState<string | null>(null);

  const monthlyIncomeInput = overrideMonthlyIncome ?? budget.income.toString();
  const monthlyFixedInput = overrideMonthlyFixed ?? totalFixedExpenses.toString();
  const monthlyNecessaryInput = overrideMonthlyNecessary ?? (budget.targetNecessary || 123).toString();

  const oneTimeAmountInput = overrideOneTimeAmount ?? (budget.oneTimeIncome?.amount || 566.17).toString();
  const oneTimeNecessaryInput = overrideOneTimeNecessary ?? (budget.oneTimeIncome?.necessary || 198.16).toString();

  // --- CALCULS MENSUELS ---
  const parsedMonthlyIncome = Math.max(0, parseFloat(monthlyIncomeInput.replace(',', '.')) || 0);
  const parsedMonthlyFixed = Math.max(0, parseFloat(monthlyFixedInput.replace(',', '.')) || 0);
  const parsedMonthlyNecessary = Math.max(0, parseFloat(monthlyNecessaryInput.replace(',', '.')) || 0);

  // Reste à vivre = Revenu - Charges fixes
  const monthlyResteAVivre = parsedMonthlyIncome - parsedMonthlyFixed;
  // Épargne calculée : Reste à vivre - √(Reste à vivre × Nécessaire)
  const monthlyEpargne = computeSavings(monthlyResteAVivre, parsedMonthlyNecessary);

  // --- CALCULS PONCTUELS ---
  const parsedOneTimeAmount = Math.max(0, parseFloat(oneTimeAmountInput.replace(',', '.')) || 0);
  const parsedOneTimeNecessary = Math.max(0, parseFloat(oneTimeNecessaryInput.replace(',', '.')) || 0);

  // Épargne ponctuelle : Montant ponctuel - √(Montant ponctuel × Nécessaire)
  const oneTimeEpargne = computeSavings(parsedOneTimeAmount, parsedOneTimeNecessary);

  // Sélection des valeurs affichées selon l'onglet actif
  const isMonthly = activeTab === 'monthly';
  const currentIncome = isMonthly ? parsedMonthlyIncome : parsedOneTimeAmount;
  const currentNecessary = isMonthly ? parsedMonthlyNecessary : parsedOneTimeNecessary;
  const currentEpargne = isMonthly ? monthlyEpargne : oneTimeEpargne;
  const currentBaseResteAVivre = isMonthly ? monthlyResteAVivre : parsedOneTimeAmount;

  // Enregistrer les montants personnalisés
  const handleApplyBudget = useCallback(async () => {
    setIsSaving(true);
    try {
      if (isMonthly) {
        if (parsedMonthlyIncome <= 0) {
          setFeedbackDialog({
            visible: true,
            type: 'warning',
            title: 'Revenu manquant',
            message: 'Veuillez saisir un revenu mensuel valide supérieur à 0 €.',
          });
          return;
        }

        await saveBudget({
          ...budget,
          income: parsedMonthlyIncome,
          fixedExpenses: parsedMonthlyFixed,
          targetNecessary: parsedMonthlyNecessary,
          savingsAccount: monthlyEpargne,
        });
      } else {
        if (parsedOneTimeAmount <= 0) {
          setFeedbackDialog({
            visible: true,
            type: 'warning',
            title: 'Montant manquant',
            message: 'Veuillez saisir un montant de revenu ponctuel supérieur à 0 €.',
          });
          return;
        }

        await saveBudget({
          ...budget,
          oneTimeIncome: {
            amount: parsedOneTimeAmount,
            necessary: parsedOneTimeNecessary,
            savings: oneTimeEpargne,
          },
        });
      }

      if (isMonthly) {
        setOverrideMonthlyIncome(null);
        setOverrideMonthlyFixed(null);
        setOverrideMonthlyNecessary(null);
      } else {
        setOverrideOneTimeAmount(null);
        setOverrideOneTimeNecessary(null);
      }

      setFeedbackDialog({
        visible: true,
        type: 'success',
        title: isMonthly ? 'Budget officiel mis à jour' : 'Revenu ponctuel enregistré',
        message: isMonthly
          ? `Revenu : ${formatEuro(parsedMonthlyIncome)} • Épargne calculée : ${formatEuro(monthlyEpargne)}`
          : `Montant ponctuel : ${formatEuro(parsedOneTimeAmount)} • Épargne : ${formatEuro(oneTimeEpargne)}`,
        subtext: 'Vos préférences ont été sauvegardées et répercutées sur l’accueil.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    isMonthly,
    parsedMonthlyIncome,
    saveBudget,
    budget,
    parsedMonthlyFixed,
    parsedMonthlyNecessary,
    monthlyEpargne,
    parsedOneTimeAmount,
    parsedOneTimeNecessary,
    oneTimeEpargne,
  ]);

  // Exécution de la réinitialisation confirmée
  const executeReset = useCallback(() => {
    if (isMonthly) {
      setOverrideMonthlyIncome('977');
      setOverrideMonthlyFixed('61.73');
      setOverrideMonthlyNecessary('123');
    } else {
      setOverrideOneTimeAmount('566.17');
      setOverrideOneTimeNecessary('198.16');
    }
    setShowResetDialog(false);
    setFeedbackDialog({
      visible: true,
      type: 'info',
      title: 'Valeurs restaurées',
      message: 'Les paramètres du tableur standard ont été réappliqués dans les champs.',
    });
  }, [isMonthly]);

  return {
    budget,
    totalFixedExpenses,
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    feedbackDialog,
    setFeedbackDialog,
    showResetDialog,
    setShowResetDialog,
    // Overrides setters
    overrideMonthlyIncome,
    setOverrideMonthlyIncome,
    overrideMonthlyFixed,
    setOverrideMonthlyFixed,
    overrideMonthlyNecessary,
    setOverrideMonthlyNecessary,
    overrideOneTimeAmount,
    setOverrideOneTimeAmount,
    overrideOneTimeNecessary,
    setOverrideOneTimeNecessary,
    // Inputs
    monthlyIncomeInput,
    monthlyFixedInput,
    monthlyNecessaryInput,
    oneTimeAmountInput,
    oneTimeNecessaryInput,
    // Calculated values
    parsedMonthlyIncome,
    parsedMonthlyFixed,
    parsedMonthlyNecessary,
    monthlyResteAVivre,
    monthlyEpargne,
    parsedOneTimeAmount,
    parsedOneTimeNecessary,
    oneTimeEpargne,
    isMonthly,
    currentIncome,
    currentNecessary,
    currentEpargne,
    currentBaseResteAVivre,
    // Actions
    handleApplyBudget,
    executeReset,
  };
}
