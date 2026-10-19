import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { useBudget } from '@/hooks/use-budget';
import { FixedExpenseItem, FixedCategoryType, FixedExpenseActivationType } from '@/types';
import { CATEGORY_CONFIG } from '@/data';
import {
  isChargeActiveInMonth,
  getChargeScheduleStatus,
  getMonthPresets,
  getSimulationMonthPresets,
  getMonthsDifference,
  addMonthsToMonthStr,
  formatMonthYear,
  formatMonthYearFull,
  getTargetMonthPreviewStatus,
  TargetMonthPreview,
} from '@/utils/fixed-expenses';
import {
  isCreditExpiredInMonth,
  getCreditProgress,
  formatCreditEndDate,
} from '@/utils/credit';
import { autoDetectExpenseMeta } from '@/utils/auto-icon';

export interface FeedbackDialogState {
  visible: boolean;
  type: 'warning' | 'error' | 'success';
  title: string;
  message: string;
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
    selectedSimulationMonth: selectedMonthStr,
    setSelectedSimulationMonth: setSelectedMonthStr,
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

  const selectedMonthOffset = useMemo(
    () => getMonthsDifference(currentMonthStr, selectedMonthStr),
    [currentMonthStr, selectedMonthStr]
  );

  const isSimulating = selectedMonthOffset > 0;

  const simulationPresets = useMemo(
    () => getSimulationMonthPresets(currentMonthStr, 13),
    [currentMonthStr]
  );

  const selectedMonthFormatted = useMemo(
    () => formatMonthYearFull(selectedMonthStr),
    [selectedMonthStr]
  );

  const selectedMonthShort = useMemo(
    () => formatMonthYear(selectedMonthStr),
    [selectedMonthStr]
  );

  const handleSelectSimulationMonth = useCallback(
    (m: string) => {
      setSelectedMonthStr(m);
    },
    [setSelectedMonthStr]
  );

  const handleNextSimulationMonth = useCallback(() => {
    const offset = getMonthsDifference(currentMonthStr, selectedMonthStr);
    if (offset >= 12) return;
    setSelectedMonthStr(addMonthsToMonthStr(selectedMonthStr, 1));
  }, [currentMonthStr, selectedMonthStr, setSelectedMonthStr]);

  const handlePrevSimulationMonth = useCallback(() => {
    const offset = getMonthsDifference(currentMonthStr, selectedMonthStr);
    if (offset <= 0) return;
    setSelectedMonthStr(addMonthsToMonthStr(selectedMonthStr, -1));
  }, [currentMonthStr, selectedMonthStr, setSelectedMonthStr]);

  const handleResetToCurrentMonth = useCallback(() => {
    setSelectedMonthStr(currentMonthStr);
  }, [currentMonthStr, setSelectedMonthStr]);

  // Champs de saisie du formulaire
  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<FixedCategoryType>('logement');
  const [iconInput, setIconInput] = useState('home-outline');

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

  // Détection 100% automatique de l'icône et de la catégorie selon le libellé saisi
  const handleLabelChange = useCallback((text: string) => {
    setLabelInput(text);
    const detected = autoDetectExpenseMeta(text, 'autre');
    setIconInput(detected.icon);
    setCategoryInput(detected.category || 'autre');
    if (!editingItem && detected.category === 'credit') {
      setIsCreditInput(true);
      if (!durationInput) setDurationInput('12');
    }
  }, [editingItem, durationInput]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setLabelInput('');
    setAmountInput('');
    setCategoryInput('autre');
    setIconInput('receipt-outline');
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
    setIsCreditInput(!!item.isCredit);
    setDurationInput((item.durationMonths || 12).toString());
    setPaidMonthsInput((item.paidMonthsCount ?? 0).toString());
    const isScheduled = !!item.activationType && item.activationType !== 'all';
    setIsScheduledInput(isScheduled);
    setActivationTypeInput(item.activationType === 'only_month' ? 'only_month' : 'starting_from');
    setTargetMonthInput(item.targetMonth || item.startMonth || currentMonthStr);
    setIsModalVisible(true);
  }, [currentMonthStr]);

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

    const detected = autoDetectExpenseMeta(labelInput, 'autre');
    const finalCategory = (detected.category && detected.category !== 'autre')
      ? detected.category
      : (categoryInput || 'autre');
    const finalCatConfig = CATEGORY_CONFIG[finalCategory] || CATEGORY_CONFIG.autre;
    const finalIcon = detected.icon || iconInput || finalCatConfig.icon;
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
          category: finalCategory,
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
          category: finalCategory,
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
    () => fixedExpensesList.filter((item) => isChargeActiveInMonth(item, selectedMonthStr, currentMonthStr)),
    [fixedExpensesList, selectedMonthStr, currentMonthStr]
  );

  const simulatedTotalFixedExpenses = useMemo(
    () => Math.round(activeFixedExpenses.reduce((sum, item) => sum + item.amount, 0) * 100) / 100,
    [activeFixedExpenses]
  );

  const expiredCreditsCount = useMemo(
    () => fixedExpensesList.filter((item) => isCreditExpiredInMonth(item, selectedMonthStr, currentMonthStr)).length,
    [fixedExpensesList, selectedMonthStr, currentMonthStr]
  );

  const upcomingChargesCount = useMemo(
    () =>
      fixedExpensesList.filter((item) => {
        const s = getChargeScheduleStatus(item, selectedMonthStr, currentMonthStr);
        return s.status === 'upcoming';
      }).length,
    [fixedExpensesList, selectedMonthStr, currentMonthStr]
  );

  const averageExpense = useMemo(
    () => (activeFixedExpenses.length > 0 ? simulatedTotalFixedExpenses / activeFixedExpenses.length : 0),
    [activeFixedExpenses.length, simulatedTotalFixedExpenses]
  );

  const differenceWithCurrentMonth = useMemo(
    () => Math.round((simulatedTotalFixedExpenses - totalFixedExpenses) * 100) / 100,
    [simulatedTotalFixedExpenses, totalFixedExpenses]
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
  const targetMonthPreviewStatus: TargetMonthPreview = useMemo(
    () =>
      getTargetMonthPreviewStatus(
        isScheduledInput,
        activationTypeInput,
        targetMonthInput,
        currentMonthStr
      ),
    [isScheduledInput, activationTypeInput, targetMonthInput, currentMonthStr]
  );

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
    // Simulation temporelle
    selectedMonthStr,
    selectedMonthOffset,
    isSimulating,
    simulationPresets,
    selectedMonthFormatted,
    selectedMonthShort,
    simulatedTotalFixedExpenses,
    differenceWithCurrentMonth,
    handleSelectSimulationMonth,
    handleNextSimulationMonth,
    handlePrevSimulationMonth,
    handleResetToCurrentMonth,
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
