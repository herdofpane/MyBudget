import { useState, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { formatEuro } from '@/constants/formatters';
import { computeSavings } from '@/constants/breakdown';
import {
  DEFAULT_TARGET_NECESSARY,
  DEFAULT_ONE_TIME_AMOUNT,
  DEFAULT_ONE_TIME_NECESSARY,
} from '@/data';

export interface DetailsFeedbackDialogState {
  visible: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  subtext?: string;
}

const DEFAULT_TARGET_NECESSARY_STR = DEFAULT_TARGET_NECESSARY.toString();
const DEFAULT_ONE_TIME_AMOUNT_STR = DEFAULT_ONE_TIME_AMOUNT.toString();
const DEFAULT_ONE_TIME_NECESSARY_STR = DEFAULT_ONE_TIME_NECESSARY.toString();

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

  // --- VALEURS DE SIMULATION ---
  // Le revenu mensuel provient directement de l'accueil (budget.income)
  // Les charges fixes proviennent du total calculé de la page charges fixes (totalFixedExpenses)
  // Seul le seuil nécessaire est ajustable pour simuler la ventilation et l'épargne
  const [overrideMonthlyNecessary, setOverrideMonthlyNecessary] = useState<string | null>(null);

  const [overrideOneTimeAmount, setOverrideOneTimeAmount] = useState<string | null>(null);
  const [overrideOneTimeNecessary, setOverrideOneTimeNecessary] = useState<string | null>(null);

  const monthlyNecessaryInput = overrideMonthlyNecessary ?? (budget.targetNecessary ?? DEFAULT_TARGET_NECESSARY).toString();

  const oneTimeAmountInput = overrideOneTimeAmount ?? (budget.oneTimeIncome?.amount ?? DEFAULT_ONE_TIME_AMOUNT).toString();
  const oneTimeNecessaryInput = overrideOneTimeNecessary ?? (budget.oneTimeIncome?.necessary ?? DEFAULT_ONE_TIME_NECESSARY).toString();

  // --- CALCULS MENSUELS ---
  // Le revenu mensuel vient directement de l'input d'accueil
  const parsedMonthlyIncome = budget.income;
  // Les charges fixes viennent directement du total de la page charges fixes
  const parsedMonthlyFixed = totalFixedExpenses;
  const parsedMonthlyNecessary = Math.max(0, parseFloat(monthlyNecessaryInput.replace(',', '.')) || 0);

  // Reste à vivre = Revenu mensuel (Accueil) - Charges fixes (Total page Charges Fixes)
  const monthlyResteAVivre = Math.round((parsedMonthlyIncome - parsedMonthlyFixed) * 100) / 100;
  // Épargne calculée : Reste à vivre - √(Reste à vivre × Nécessaire)
  const monthlyEpargne = computeSavings(monthlyResteAVivre, parsedMonthlyNecessary);
  // Compte courant calculé : Reste à vivre - Épargne = √(Reste à vivre × Nécessaire)
  const monthlyChecking = Math.max(0, Math.round((monthlyResteAVivre - monthlyEpargne) * 100) / 100);

  // --- CALCULS PONCTUELS ---
  const parsedOneTimeAmount = Math.max(0, parseFloat(oneTimeAmountInput.replace(',', '.')) || 0);
  const parsedOneTimeNecessary = Math.max(0, parseFloat(oneTimeNecessaryInput.replace(',', '.')) || 0);

  // Épargne ponctuelle : Montant ponctuel - √(Montant ponctuel × Nécessaire)
  const oneTimeEpargne = computeSavings(parsedOneTimeAmount, parsedOneTimeNecessary);
  // Compte courant ponctuel : Montant ponctuel - Épargne
  const oneTimeChecking = Math.max(0, Math.round((parsedOneTimeAmount - oneTimeEpargne) * 100) / 100);

  // Sélection des valeurs affichées selon l'onglet actif
  const isMonthly = activeTab === 'monthly';
  const currentIncome = isMonthly ? parsedMonthlyIncome : parsedOneTimeAmount;
  const currentNecessary = isMonthly ? parsedMonthlyNecessary : parsedOneTimeNecessary;
  const currentEpargne = isMonthly ? monthlyEpargne : oneTimeEpargne;
  const currentChecking = isMonthly ? monthlyChecking : oneTimeChecking;
  const currentBaseResteAVivre = isMonthly ? monthlyResteAVivre : parsedOneTimeAmount;

  // Enregistrer les montants personnalisés
  const handleApplyBudget = useCallback(async () => {
    setIsSaving(true);
    try {
      if (isMonthly) {
        await saveBudget({
          ...budget,
          income: parsedMonthlyIncome,
          fixedExpenses: parsedMonthlyFixed,
          targetNecessary: parsedMonthlyNecessary,
          savingsAccount: monthlyEpargne,
          checkingAccount: monthlyChecking,
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
          ? `Revenu : ${formatEuro(parsedMonthlyIncome)} • Charges : ${formatEuro(parsedMonthlyFixed)} • Courant : ${formatEuro(monthlyChecking)} • Épargne : ${formatEuro(monthlyEpargne)}`
          : `Montant ponctuel : ${formatEuro(parsedOneTimeAmount)} • Courant : ${formatEuro(oneTimeChecking)} • Épargne : ${formatEuro(oneTimeEpargne)}`,
        subtext: 'Vos préférences ont été sauvegardées et répercutées sur l’accueil.',
      });
    } catch (error) {
      console.error('[useDetailsSimulation] Erreur lors de la sauvegarde du budget:', error);
      setFeedbackDialog({
        visible: true,
        type: 'error',
        title: 'Erreur d’enregistrement',
        message: 'Impossible de sauvegarder vos modifications de budget.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    isMonthly,
    parsedMonthlyIncome,
    parsedMonthlyFixed,
    parsedMonthlyNecessary,
    monthlyEpargne,
    monthlyChecking,
    saveBudget,
    budget,
    parsedOneTimeAmount,
    parsedOneTimeNecessary,
    oneTimeEpargne,
    oneTimeChecking,
  ]);

  // Exécution de la réinitialisation confirmée
  const executeReset = useCallback(() => {
    if (isMonthly) {
      setOverrideMonthlyNecessary(DEFAULT_TARGET_NECESSARY_STR);
    } else {
      setOverrideOneTimeAmount(DEFAULT_ONE_TIME_AMOUNT_STR);
      setOverrideOneTimeNecessary(DEFAULT_ONE_TIME_NECESSARY_STR);
    }
    setShowResetDialog(false);
    setFeedbackDialog({
      visible: true,
      type: 'info',
      title: 'Valeurs restaurées',
      message: isMonthly
        ? `Le seuil nécessaire par défaut (${DEFAULT_TARGET_NECESSARY_STR} €) a été réappliqué.`
        : 'Les paramètres du tableur standard ont été réappliqués dans les champs.',
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
    overrideMonthlyNecessary,
    setOverrideMonthlyNecessary,
    overrideOneTimeAmount,
    setOverrideOneTimeAmount,
    overrideOneTimeNecessary,
    setOverrideOneTimeNecessary,
    // Inputs
    monthlyNecessaryInput,
    oneTimeAmountInput,
    oneTimeNecessaryInput,
    // Calculated values
    parsedMonthlyIncome,
    parsedMonthlyFixed,
    parsedMonthlyNecessary,
    monthlyResteAVivre,
    monthlyEpargne,
    monthlyChecking,
    parsedOneTimeAmount,
    parsedOneTimeNecessary,
    oneTimeEpargne,
    oneTimeChecking,
    isMonthly,
    currentIncome,
    currentNecessary,
    currentEpargne,
    currentChecking,
    currentBaseResteAVivre,
    // Actions
    handleApplyBudget,
    executeReset,
  };
}
