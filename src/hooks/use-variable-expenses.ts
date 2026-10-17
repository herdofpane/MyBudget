import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { useBudget } from '@/hooks/use-budget';
import { VariableCategory } from '@/types';
import { autoDetectExpenseMeta } from '@/utils/auto-icon';

export interface VariableFeedbackDialogState {
  visible: boolean;
  type: 'warning' | 'error' | 'success';
  title: string;
  message: string;
}

/**
 * Custom Hook Métier (SOLID SRP - Couche Logique & Accès Données)
 * Isole l'intégralité du state, des calculs de mensualisation et des opérations CRUD
 * pour l'écran des Charges Variables.
 */
export function useVariableExpenses() {
  const {
    variableCategories,
    totalEstimatedVariable,
    variableExpenseRatio,
    addVariableCategory,
    updateVariableCategory,
    deleteVariableCategory,
    isLoading,
  } = useBudget();

  // États de chargement des actions asynchrones
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // État du modal de création / modification
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VariableCategory | null>(null);

  // État des pop-ups d'alerte / validation
  const [feedbackDialog, setFeedbackDialog] = useState<VariableFeedbackDialogState | null>(null);

  // Support touche Échap sur le Web pour fermer le modal de formulaire
  useEffect(() => {
    if (Platform.OS !== 'web' || !isModalVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [durationInput, setDurationInput] = useState('1');
  const [iconInput, setIconInput] = useState('pricetag-outline');
  const [colorInput, setColorInput] = useState('#9b6fba');
  const [isIconManuallySelected, setIsIconManuallySelected] = useState(false);

  // Détection automatique en temps réel de l'icône et de la couleur selon le libellé saisi
  const handleLabelChange = useCallback(
    (text: string) => {
      setLabelInput(text);
      if (!editingCategory) {
        // En création : toujours automatique selon le titre saisi (pas de personnalisation manuelle)
        const detected = autoDetectExpenseMeta(text);
        setIconInput(detected.icon);
        setColorInput(detected.color);
      } else if (!isIconManuallySelected) {
        // En modification : suit le titre tant qu'aucune icône n'a été choisie manuellement
        const detected = autoDetectExpenseMeta(text);
        setIconInput(detected.icon);
        setColorInput(detected.color);
      }
    },
    [editingCategory, isIconManuallySelected]
  );

  const handleSelectIcon = useCallback(
    (icon: string) => {
      // Personnalisation manuelle réservée exclusivement au mode modification
      if (editingCategory) {
        setIsIconManuallySelected(true);
        setIconInput(icon);
      }
    },
    [editingCategory]
  );

  const handleSelectColor = useCallback(
    (color: string) => {
      // Personnalisation de couleur réservée exclusivement au mode modification
      if (editingCategory) {
        setColorInput(color);
      }
    },
    [editingCategory]
  );

  // Ouvrir modal ajout
  const openAddModal = useCallback(() => {
    setEditingCategory(null);
    setLabelInput('');
    setAmountInput('');
    setDurationInput('1');
    setIconInput('pricetag-outline');
    setColorInput('#9b6fba');
    setIsIconManuallySelected(false);
    setIsModalVisible(true);
  }, []);

  // Ouvrir modal modification
  const openEditModal = useCallback((cat: VariableCategory) => {
    setEditingCategory(cat);
    setLabelInput(cat.label);
    const total = cat.totalAmount !== undefined ? cat.totalAmount : cat.estimatedBudget;
    const duration = cat.durationMonths || 1;
    setAmountInput(total.toString());
    setDurationInput(duration.toString());
    setIconInput(cat.icon);
    setColorInput(cat.color);
    setIsIconManuallySelected(true);
    setIsModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    const total = parseFloat(amountInput.replace(',', '.'));
    const duration = Math.max(0.01, parseFloat(durationInput.replace(',', '.')) || 1);

    if (!labelInput.trim() || isNaN(total) || total <= 0) {
      setFeedbackDialog({
        visible: true,
        type: 'warning',
        title: 'Champs incomplets',
        message: 'Veuillez saisir un titre et un montant prévisionnel valide supérieur à 0 €.',
      });
      return;
    }

    const detected = autoDetectExpenseMeta(labelInput);
    // En création : icône et couleur 100% automatiques
    // En modification : personnalisation manuelle respectée
    const finalIcon = editingCategory
      ? (isIconManuallySelected ? iconInput : (detected.icon || iconInput))
      : (detected.icon || 'pricetag-outline');
    const finalColor = editingCategory
      ? (colorInput || detected.color || '#9b6fba')
      : (detected.color || '#9b6fba');
    const monthly = Math.round((total / duration) * 100) / 100;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateVariableCategory({
          ...editingCategory,
          label: labelInput.trim(),
          totalAmount: total,
          durationMonths: duration,
          estimatedBudget: monthly,
          icon: finalIcon,
          color: finalColor,
        });
      } else {
        await addVariableCategory({
          label: labelInput.trim(),
          totalAmount: total,
          durationMonths: duration,
          estimatedBudget: monthly,
          spent: 0,
          icon: finalIcon,
          color: finalColor,
        });
      }
      setIsModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  }, [
    amountInput,
    durationInput,
    labelInput,
    editingCategory,
    iconInput,
    colorInput,
    isIconManuallySelected,
    updateVariableCategory,
    addVariableCategory,
  ]);

  const handleDelete = useCallback((id: string, label: string) => {
    setDeleteTarget({ id, label });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await deleteVariableCategory(deleteTarget.id);
        setDeleteTarget(null);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [deleteTarget, deleteVariableCategory]);

  const averageExpense = useMemo(
    () => (variableCategories.length > 0 ? totalEstimatedVariable / variableCategories.length : 0),
    [variableCategories.length, totalEstimatedVariable]
  );

  // Calculs dynamiques pour le modal
  const modalParsedAmount = parseFloat(amountInput.replace(',', '.')) || 0;
  const modalParsedDuration = Math.max(0.01, parseFloat(durationInput.replace(',', '.')) || 1);
  const modalMonthlyImpact = modalParsedAmount > 0 ? modalParsedAmount / modalParsedDuration : 0;

  return {
    variableCategories,
    totalEstimatedVariable,
    variableExpenseRatio,
    isLoading,
    isSaving,
    isDeleting,
    deleteTarget,
    setDeleteTarget,
    isModalVisible,
    setIsModalVisible,
    editingCategory,
    feedbackDialog,
    setFeedbackDialog,
    // Form fields
    labelInput,
    setLabelInput,
    handleLabelChange,
    amountInput,
    setAmountInput,
    durationInput,
    setDurationInput,
    iconInput,
    setIconInput,
    colorInput,
    setColorInput,
    isIconManuallySelected,
    handleSelectIcon,
    handleSelectColor,
    // Actions
    openAddModal,
    openEditModal,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    // Computations
    averageExpense,
    modalParsedAmount,
    modalParsedDuration,
    modalMonthlyImpact,
  };
}
