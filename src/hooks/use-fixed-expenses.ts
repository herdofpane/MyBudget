import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { useBudget } from '@/hooks/use-budget';
import { FixedExpenseItem, FixedCategoryType, FixedExpenseActivationType } from '@/types';
import { CATEGORY_CONFIG } from '@/data';
import {
  isChargeActiveInMonth,
  getChargeScheduleStatus,
  formatMonthYear,
  formatMonthYearFull,
  getMonthPresets,
  isCreditExpired,
  getCreditProgress,
  formatCreditEndDate,
} from '@/utils/fixed-expenses';
import { autoDetectExpenseMeta } from '@/utils/auto-icon';

export interface FeedbackDialogState {
  visible: boolean;
  type: 'warning' | 'error' | 'success';
  title: string;
  message: string;
}

export interface TargetMonthPreview {
  label: string;
  description: string;
  isCounted: boolean;
}

/**
 * Custom Hook Métier (SOLID SRP - Couche Logique & Accès Données)
 * Isole l'intégralité du state, des calculs de crédit/planification et des opérations CRUD
 * pour l'écran des Charges Fixes.
 */
export function useFixedExpenses() {
  const {
    fixedExpensesList,
    totalFixedExpenses,
    fixedExpenseRatio,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    advanceCreditMonth,
    isLoading,
  } = useBudget();

  // États de chargement des actions asynchrones
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // État du modal d'ajout / modification
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedExpenseItem | null>(null);

  // État des pop-ups d'alerte / validation
  const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogState | null>(null);

  // Mois courant calculé au format YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthPresets = useMemo(() => getMonthPresets(), []);

  // Champs de saisie du formulaire
  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<FixedCategoryType>('logement');
  const [iconInput, setIconInput] = useState('home-outline');
  const [isCategoryManuallySelected, setIsCategoryManuallySelected] = useState(false);

  // Champs spécifiques aux crédits sur durée limitée (X mois)
  const [isCreditInput, setIsCreditInput] = useState(false);
  const [durationInput, setDurationInput] = useState('12');
  const [paidMonthsInput, setPaidMonthsInput] = useState('0');

  // Champs spécifiques à la planification du mois d'activation
  const [isScheduledInput, setIsScheduledInput] = useState(false);
  const [activationTypeInput, setActivationTypeInput] = useState<FixedExpenseActivationType>('starting_from');
  const [targetMonthInput, setTargetMonthInput] = useState(currentMonthStr);

  // Support touche Échap sur le Web pour fermer le modal de formulaire
  useEffect(() => {
    if (Platform.OS !== 'web' || !isModalVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  // Détection automatique en temps réel de l'icône et de la catégorie selon le libellé saisi
  const handleLabelChange = useCallback((text: string) => {
    setLabelInput(text);
    const detected = autoDetectExpenseMeta(text, categoryInput);
    setIconInput(detected.icon);
    if (!isCategoryManuallySelected && detected.category) {
      setCategoryInput(detected.category);
      if (detected.category === 'credit') {
        setIsCreditInput(true);
        if (!durationInput) setDurationInput('12');
      }
    }
  }, [categoryInput, isCategoryManuallySelected, durationInput]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setLabelInput('');
    setAmountInput('');
    setCategoryInput('logement');
    setIconInput('home-outline');
    setIsCategoryManuallySelected(false);
    setIsCreditInput(false);
    setDurationInput('12');
    setPaidMonthsInput('0');
    setIsScheduledInput(false);
    setActivationTypeInput('starting_from');
    setTargetMonthInput(currentMonthStr);
    setIsModalVisible(true);
  }, [currentMonthStr]);

  const openEditModal = useCallback((item: FixedExpenseItem) => {
    setEditingItem(item);
    setLabelInput(item.label);
    setAmountInput(item.amount.toString());
    setCategoryInput(item.category);
    setIconInput(item.icon || CATEGORY_CONFIG[item.category]?.icon || 'home-outline');
    setIsCategoryManuallySelected(true);
    setIsCreditInput(!!item.isCredit);
    setDurationInput((item.durationMonths || 12).toString());
    setPaidMonthsInput((item.paidMonthsCount ?? 0).toString());
    const isScheduled = !!item.activationType && item.activationType !== 'all';
    setIsScheduledInput(isScheduled);
    setActivationTypeInput(item.activationType === 'only_month' ? 'only_month' : 'starting_from');
    setTargetMonthInput(item.targetMonth || item.startMonth || currentMonthStr);
    setIsModalVisible(true);
  }, [currentMonthStr]);

  const handleSelectCategory = useCallback((catKey: FixedCategoryType) => {
    setIsCategoryManuallySelected(true);
    setCategoryInput(catKey);
    const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.autre;
    const detected = autoDetectExpenseMeta(labelInput, catKey);
    setIconInput(detected.icon || catConfig.icon);
    if (catKey === 'credit' && !isCreditInput) {
      setIsCreditInput(true);
      if (!durationInput) setDurationInput('12');
    }
  }, [labelInput, isCreditInput, durationInput]);

  const handleSave = useCallback(async () => {
    const amount = parseFloat(amountInput.replace(',', '.'));
    if (!labelInput.trim() || isNaN(amount) || amount <= 0) {
      setFeedbackDialog({
        visible: true,
        type: 'warning',
        title: 'Champs incomplets',
        message: 'Veuillez saisir un nom et un montant mensuel valide supérieur à 0 €.',
      });
      return;
    }

    const catConfig = CATEGORY_CONFIG[categoryInput] || CATEGORY_CONFIG.autre;
    const finalIcon = iconInput || autoDetectExpenseMeta(labelInput, categoryInput).icon || catConfig.icon;
    const parsedDuration = isCreditInput ? Math.max(1, parseInt(durationInput, 10) || 12) : undefined;
    const parsedPaidMonths = isCreditInput ? Math.max(0, parseInt(paidMonthsInput, 10) || 0) : undefined;
    const finalActivationType: FixedExpenseActivationType = isScheduledInput ? activationTypeInput : 'all';
    const finalTargetMonth = isScheduledInput ? targetMonthInput : undefined;

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateFixedExpense({
          ...editingItem,
          label: labelInput.trim(),
          amount,
          category: categoryInput,
          icon: finalIcon,
          isCredit: isCreditInput,
          durationMonths: parsedDuration,
          paidMonthsCount: parsedPaidMonths,
          startMonth: isCreditInput ? (editingItem.startMonth || currentMonthStr) : finalTargetMonth,
          activationType: finalActivationType,
          targetMonth: finalTargetMonth,
        });
      } else {
        await addFixedExpense({
          label: labelInput.trim(),
          amount,
          category: categoryInput,
          icon: finalIcon,
          isCredit: isCreditInput,
          durationMonths: parsedDuration,
          paidMonthsCount: parsedPaidMonths,
          startMonth: isCreditInput ? currentMonthStr : finalTargetMonth,
          activationType: finalActivationType,
          targetMonth: finalTargetMonth,
        });
      }
      setIsModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  }, [
    amountInput,
    labelInput,
    categoryInput,
    iconInput,
    isCreditInput,
    durationInput,
    paidMonthsInput,
    isScheduledInput,
    activationTypeInput,
    targetMonthInput,
    editingItem,
    updateFixedExpense,
    addFixedExpense,
    currentMonthStr,
  ]);

  const handleAdvanceMonth = useCallback(async (item: FixedExpenseItem) => {
    if (!item.isCredit) return;
    const progress = getCreditProgress(item);
    if (progress.isExpired) {
      setFeedbackDialog({
        visible: true,
        type: 'warning',
        title: 'Crédit déjà soldé',
        message: 'Ce crédit est déjà entièrement remboursé et est automatiquement exclu de vos charges mensuelles.',
      });
      return;
    }

    await advanceCreditMonth(item.id);

    const willExpire = progress.paid + 1 >= progress.total;
    if (willExpire) {
      setFeedbackDialog({
        visible: true,
        type: 'success',
        title: 'Félicitations ! 🎉',
        message: `Le crédit "${item.label}" est désormais totalement remboursé ! Il est automatiquement retiré de vos charges mensuelles.`,
      });
    }
  }, [advanceCreditMonth]);

  const handleDelete = useCallback((id: string, label: string) => {
    setDeleteTarget({ id, label });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await deleteFixedExpense(deleteTarget.id);
        setDeleteTarget(null);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [deleteTarget, deleteFixedExpense]);

  const activeFixedExpenses = useMemo(
    () => fixedExpensesList.filter((item) => isChargeActiveInMonth(item, currentMonthStr)),
    [fixedExpensesList, currentMonthStr]
  );

  const expiredCreditsCount = useMemo(
    () => fixedExpensesList.filter(isCreditExpired).length,
    [fixedExpensesList]
  );

  const upcomingChargesCount = useMemo(
    () =>
      fixedExpensesList.filter((item) => {
        const s = getChargeScheduleStatus(item, currentMonthStr);
        return s.status === 'upcoming';
      }).length,
    [fixedExpensesList, currentMonthStr]
  );

  const averageExpense = useMemo(
    () => (activeFixedExpenses.length > 0 ? totalFixedExpenses / activeFixedExpenses.length : 0),
    [activeFixedExpenses.length, totalFixedExpenses]
  );

  // Calculs dynamiques pour l'encart récapitulatif du crédit dans le modal
  const parsedAmountForCredit = Math.max(0, parseFloat(amountInput.replace(',', '.')) || 0);
  const parsedDurationForCredit = Math.max(1, parseInt(durationInput, 10) || 12);
  const parsedPaidForCredit = Math.max(0, parseInt(paidMonthsInput, 10) || 0);
  const remainingMonthsPreview = Math.max(0, parsedDurationForCredit - parsedPaidForCredit);
  const remainingCostCreditPreview = Math.round(remainingMonthsPreview * parsedAmountForCredit * 100) / 100;

  const estimatedEndDatePreview = useMemo(() => {
    return formatCreditEndDate({
      id: '',
      label: '',
      amount: parsedAmountForCredit,
      category: categoryInput,
      icon: '',
      isCredit: true,
      durationMonths: parsedDurationForCredit,
      paidMonthsCount: parsedPaidForCredit,
    });
  }, [parsedAmountForCredit, categoryInput, parsedDurationForCredit, parsedPaidForCredit]);

  // Explication pédagogique en temps réel du mois d'activation choisi
  const targetMonthPreviewStatus: TargetMonthPreview = useMemo(() => {
    if (!isScheduledInput) {
      return {
        label: 'Active immédiatement',
        description: 'Cette charge sera imputée chaque mois sans interruption.',
        isCounted: true,
      };
    }
    if (activationTypeInput === 'starting_from') {
      if (targetMonthInput <= currentMonthStr) {
        return {
          label: 'Active dès ce mois-ci',
          description: `Démarre ce mois-ci (${formatMonthYearFull(targetMonthInput)}) et se renouvellera chaque mois.`,
          isCounted: true,
        };
      } else {
        return {
          label: `À venir en ${formatMonthYear(targetMonthInput)}`,
          description: `Non imputée pour le moment. Elle s'activera automatiquement dès ${formatMonthYearFull(targetMonthInput)}.`,
          isCounted: false,
        };
      }
    } else {
      // only_month
      if (targetMonthInput === currentMonthStr) {
        return {
          label: 'Active ce mois-ci uniquement',
          description: `S'impute uniquement pour ce mois (${formatMonthYearFull(targetMonthInput)}), puis s'arrête.`,
          isCounted: true,
        };
      } else if (targetMonthInput > currentMonthStr) {
        return {
          label: `Prévue pour ${formatMonthYear(targetMonthInput)}`,
          description: `Non imputée pour le moment. S'appliquera uniquement le mois de ${formatMonthYearFull(targetMonthInput)}.`,
          isCounted: false,
        };
      } else {
        return {
          label: 'Mois passé',
          description: `Le mois de ${formatMonthYearFull(targetMonthInput)} est déjà passé. Cette charge n'est plus imputée.`,
          isCounted: false,
        };
      }
    }
  }, [isScheduledInput, activationTypeInput, targetMonthInput, currentMonthStr]);

  return {
    fixedExpensesList,
    totalFixedExpenses,
    fixedExpenseRatio,
    isLoading,
    isSaving,
    isDeleting,
    deleteTarget,
    setDeleteTarget,
    isModalVisible,
    setIsModalVisible,
    editingItem,
    feedbackDialog,
    setFeedbackDialog,
    currentMonthStr,
    monthPresets,
    // Form fields
    labelInput,
    setLabelInput,
    handleLabelChange,
    iconInput,
    setIconInput,
    amountInput,
    setAmountInput,
    categoryInput,
    setCategoryInput,
    isCreditInput,
    setIsCreditInput,
    durationInput,
    setDurationInput,
    paidMonthsInput,
    setPaidMonthsInput,
    isScheduledInput,
    setIsScheduledInput,
    activationTypeInput,
    setActivationTypeInput,
    targetMonthInput,
    setTargetMonthInput,
    // Actions
    openAddModal,
    openEditModal,
    handleSelectCategory,
    handleSave,
    handleAdvanceMonth,
    handleDelete,
    handleConfirmDelete,
    // Computations
    activeFixedExpenses,
    expiredCreditsCount,
    upcomingChargesCount,
    averageExpense,
    parsedAmountForCredit,
    parsedDurationForCredit,
    remainingMonthsPreview,
    remainingCostCreditPreview,
    estimatedEndDatePreview,
    targetMonthPreviewStatus,
  };
}
