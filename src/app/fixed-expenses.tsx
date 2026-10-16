import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { ConfirmDialog, AppDialog } from '@/components/confirm-dialog';
import { ListSkeleton } from '@/components/ui/loading-state';

import { useBudget } from '@/hooks/use-budget';
import { FixedExpenseItem, FixedCategoryType, FixedExpenseActivationType } from '@/types';
import { CATEGORY_CONFIG } from '@/data';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';
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

export default function FixedExpensesScreen() {
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
  const [feedbackDialog, setFeedbackDialog] = useState<{
    visible: boolean;
    type: 'warning' | 'error' | 'success';
    title: string;
    message: string;
  } | null>(null);

  // Support touche Échap sur le Web pour fermer le modal de formulaire
  useEffect(() => {
    if (Platform.OS !== 'web' || !isModalVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  // Mois courant calculé au format YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthPresets = useMemo(() => getMonthPresets(), []);

  // Champs de saisie du formulaire
  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<FixedCategoryType>('logement');

  // Champs spécifiques aux crédits sur durée limitée (X mois)
  const [isCreditInput, setIsCreditInput] = useState(false);
  const [durationInput, setDurationInput] = useState('12');
  const [paidMonthsInput, setPaidMonthsInput] = useState('0');

  // Champs spécifiques à la planification du mois d'activation
  const [isScheduledInput, setIsScheduledInput] = useState(false);
  const [activationTypeInput, setActivationTypeInput] = useState<FixedExpenseActivationType>('starting_from');
  const [targetMonthInput, setTargetMonthInput] = useState(currentMonthStr);

  const openAddModal = () => {
    setEditingItem(null);
    setLabelInput('');
    setAmountInput('');
    setCategoryInput('logement');
    setIsCreditInput(false);
    setDurationInput('12');
    setPaidMonthsInput('0');
    setIsScheduledInput(false);
    setActivationTypeInput('starting_from');
    setTargetMonthInput(currentMonthStr);
    setIsModalVisible(true);
  };

  const openEditModal = (item: FixedExpenseItem) => {
    setEditingItem(item);
    setLabelInput(item.label);
    setAmountInput(item.amount.toString());
    setCategoryInput(item.category);
    setIsCreditInput(!!item.isCredit);
    setDurationInput((item.durationMonths || 12).toString());
    setPaidMonthsInput((item.paidMonthsCount ?? 0).toString());
    const isScheduled = !!item.activationType && item.activationType !== 'all';
    setIsScheduledInput(isScheduled);
    setActivationTypeInput(item.activationType === 'only_month' ? 'only_month' : 'starting_from');
    setTargetMonthInput(item.targetMonth || item.startMonth || currentMonthStr);
    setIsModalVisible(true);
  };

  // Sélection intelligente de catégorie : active automatiquement l'option crédit si la catégorie 'credit' est choisie
  const handleSelectCategory = (catKey: FixedCategoryType) => {
    setCategoryInput(catKey);
    if (catKey === 'credit' && !isCreditInput) {
      setIsCreditInput(true);
      if (!durationInput) setDurationInput('12');
    }
  };

  const handleSave = async () => {
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
          icon: catConfig.icon,
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
          icon: catConfig.icon,
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
  };

  // Incrémenter manuellement une mensualité payée pour un crédit
  const handleAdvanceMonth = async (item: FixedExpenseItem) => {
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
  };

  const handleDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await deleteFixedExpense(deleteTarget.id);
        setDeleteTarget(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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

  const averageExpense =
    activeFixedExpenses.length > 0 ? totalFixedExpenses / activeFixedExpenses.length : 0;

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
  const targetMonthPreviewStatus = useMemo(() => {
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ */}
      <NavigationHeader
        title="Charges Fixes"
        subtitle="BUDGET RÉCURRENT"
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2.5 pb-[110px] gap-4 w-full max-w-[860px] self-center">

          {/* 1. CARTE DU TOTAL DES CHARGES FIXES */}
          <Card className="bg-card rounded-3xl p-5 border border-border shadow-xs gap-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total des charges fixes
                  </Text>
                  <Badge variant="outline" className="border-border bg-muted/30 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] text-muted-foreground font-semibold">
                      Arrondi à l&apos;unité
                    </Text>
                  </Badge>
                </View>
                <Text className="text-3xl font-black text-foreground tracking-tight">
                  {formatEuroRound(totalFixedExpenses)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Montant exact : {formatEuro(totalFixedExpenses)}
                </Text>
              </View>

              <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="layers-outline" size={14} color="#6366F1" />
                <Text className="text-xs font-bold text-lavender">
                  {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                </Text>
              </Badge>
            </View>

            {/* BANDEAU SI DES CRÉDITS SONT ARRIVÉS À ÉCHÉANCE */}
            {expiredCreditsCount > 0 && (
              <View className="flex-row items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 gap-2">
                <Ionicons name="shield-checkmark" size={15} color="#10B981" />
                <Text className="text-xs text-accentDark font-semibold flex-1">
                  {expiredCreditsCount} crédit{expiredCreditsCount > 1 ? 's' : ''} arrivé{expiredCreditsCount > 1 ? 's' : ''} à terme automatiquement exclu{expiredCreditsCount > 1 ? 's' : ''} du total
                </Text>
              </View>
            )}

            {/* BANDEAU SI DES CHARGES SONT DIFFÉRÉES */}
            {upcomingChargesCount > 0 && (
              <View className="flex-row items-center bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 gap-2">
                <Ionicons name="calendar-outline" size={15} color="#6366F1" />
                <Text className="text-xs text-lavender font-semibold flex-1">
                  {upcomingChargesCount} charge{upcomingChargesCount > 1 ? 's' : ''} différée{upcomingChargesCount > 1 ? 's' : ''} à venir (non imputée{upcomingChargesCount > 1 ? 's' : ''} ce mois-ci)
                </Text>
              </View>
            )}

            {/* PETIT RÉCAPITULATIF STATISTIQUE */}
            <View className="flex-row items-center bg-muted/30 rounded-2xl p-3 border border-border">
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Moyenne par charge</Text>
                <Text className="text-sm font-bold text-foreground mt-0.5">
                  ~{formatEuroRound(averageExpense)}
                </Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Part des revenus</Text>
                <Text className="text-sm font-bold text-foreground mt-0.5">
                  {formatPercent(fixedExpenseRatio)}
                </Text>
              </View>
            </View>
          </Card>

          {/* 2. LE TABLEAU DES CHARGES FIXES */}
          <Card className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* EN-TÊTE DU TABLEAU */}
            <View className="flex-row justify-between items-center p-5 border-b border-border">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                  <Ionicons name="receipt-outline" size={18} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">
                    Charges fixes & abonnements
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {activeFixedExpenses.length} prélèvement{activeFixedExpenses.length > 1 ? 's' : ''} actif{activeFixedExpenses.length > 1 ? 's' : ''}
                    {expiredCreditsCount > 0 && ` • ${expiredCreditsCount} soldé${expiredCreditsCount > 1 ? 's' : ''}`}
                    {upcomingChargesCount > 0 && ` • ${upcomingChargesCount} à venir`}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={openAddModal}
                className="border-indigo-300 bg-indigo-50 gap-1.5 rounded-xl h-9 px-3">
                <Ionicons name="add-circle" size={16} color="#6366F1" />
                <Text className="text-xs font-bold text-lavender">Nouvelle charge</Text>
              </Button>
            </View>

            {fixedExpensesList.length === 0 ? (
              <View className="p-8 items-center justify-center gap-3">
                <Ionicons name="folder-open-outline" size={42} color="#6366F1" />
                <Text className="text-base font-bold text-foreground text-center">
                  Aucune charge fixe enregistrée
                </Text>
                <Text className="text-xs text-muted-foreground text-center max-w-[420px]">
                  Ajoutez vos charges récurrentes (loyer, abonnements, assurances, crédits...) pour calculer votre budget.
                </Text>
                <Button
                  onPress={openAddModal}
                  className="bg-primary rounded-xl px-4 py-2 mt-2 gap-1.5 h-auto">
                  <Ionicons name="add" size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-white">
                    Ajouter ma première charge
                  </Text>
                </Button>
              </View>
            ) : (
              <View>
                {/* LIGNE DES COLONNES DU TABLEAU */}
                <View className="flex-row items-center px-4 py-3 bg-muted/40 border-b border-border">
                  <Text className="flex-[2] text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    POSTE DE CHARGE
                  </Text>
                  <Text className="flex-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    MONTANT / MOIS
                  </Text>
                  <Text className="w-24 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    ACTIONS
                  </Text>
                </View>

                {/* LIGNES DES CHARGES */}
                {fixedExpensesList.map((item, index) => {
                  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.autre;
                  const isEven = index % 2 === 0;
                  const isCredit = !!item.isCredit;
                  const creditInfo = isCredit ? getCreditProgress(item) : null;
                  const isExpired = creditInfo?.isExpired ?? false;
                  const schedule = getChargeScheduleStatus(item, currentMonthStr);
                  const isNotCounted = !schedule.isCounted;

                  return (
                    <View
                      key={item.id}
                      className={`flex-row items-center px-4 py-3.5 border-b border-border/60 ${
                        isExpired
                          ? 'bg-slate-50/70 opacity-60'
                          : isNotCounted
                          ? 'bg-muted/20 opacity-75'
                          : isEven
                          ? 'bg-card'
                          : 'bg-muted/10'
                      }`}>
                      {/* COLONNE 1 : CHARGE & CATÉGORIE & CRÉDIT */}
                      <View className="flex-[2] flex-row items-center gap-2.5 pr-2">
                        <View
                          className="w-8 h-8 rounded-lg justify-center items-center"
                          style={{ backgroundColor: cat.bg }}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5 flex-wrap">
                            <Text
                              className={`text-sm font-bold text-foreground ${
                                isExpired ? 'line-through text-muted-foreground' : ''
                              }`}
                              numberOfLines={1}>
                              {item.label}
                            </Text>

                            {/* Badge Crédit */}
                            {isCredit && (
                              <Badge
                                variant="outline"
                                className={`px-1.5 py-0.5 rounded ${
                                  isExpired
                                    ? 'bg-slate-100 border-slate-300'
                                    : 'bg-indigo-50 border-indigo-200'
                                }`}>
                                <Text
                                  className={`text-[10px] font-bold ${
                                    isExpired ? 'text-slate-500' : 'text-lavender'
                                  }`}>
                                  {isExpired ? 'Soldé' : `${creditInfo?.paid}/${creditInfo?.total} mois`}
                                </Text>
                              </Badge>
                            )}

                            {/* Badge Planification */}
                            {schedule.status !== 'active' && schedule.status !== 'credit_expired' && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: schedule.badgeBg,
                                  borderColor: schedule.badgeBorder,
                                }}>
                                <Text
                                  className="text-[10px] font-black"
                                  style={{ color: schedule.badgeColor }}>
                                  {schedule.badgeLabel}
                                </Text>
                              </Badge>
                            )}
                          </View>

                          <Text className="text-[11px] font-medium mt-0.5" style={{ color: cat.color }}>
                            {cat.label}
                            {isCredit && !isExpired && ` • Reste ${creditInfo?.remainingMonths} mois`}
                            {!isCredit && schedule.status === 'upcoming' && ` • Dès ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'past' && ` • Était pour ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'only_month_active' && ' • Ce mois-ci uniquement'}
                          </Text>

                          {/* Progression du crédit */}
                          {isCredit && !isExpired && (
                            <View className="h-1 bg-muted rounded-full overflow-hidden mt-1 max-w-[120px]">
                              <View
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${creditInfo?.percent || 0}%` }}
                              />
                            </View>
                          )}
                        </View>
                      </View>

                      {/* COLONNE 2 : MONTANT */}
                      <View className="flex-1 items-end">
                        <Text
                          className={`text-sm font-black ${
                            isExpired ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}>
                          -{formatEuro(item.amount)}
                        </Text>
                        {isExpired && (
                          <Text className="text-[10px] text-muted-foreground font-semibold">0 € imputé</Text>
                        )}
                        {isNotCounted && !isExpired && (
                          <Text className="text-[10px] text-muted-foreground font-semibold">Non imputé</Text>
                        )}
                        {isCredit && !isExpired && (
                          <Text className="text-[10px] text-muted-foreground">
                            Dû : {formatEuro(creditInfo?.remainingAmount || 0)}
                          </Text>
                        )}
                      </View>

                      {/* COLONNE 3 : ACTIONS */}
                      <View className="w-24 flex-row items-center justify-end gap-1">
                        {isCredit && !isExpired && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => handleAdvanceMonth(item)}
                            className="w-7 h-7 rounded-lg"
                            accessibilityLabel={`Enregistrer +1 mois payé pour ${item.label}`}>
                            <Ionicons name="checkmark-circle-outline" size={17} color="#10B981" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => openEditModal(item)}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Modifier ${item.label}`}>
                          <Ionicons name="pencil-outline" size={15} color="#64748B" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => handleDelete(item.id, item.label)}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Supprimer ${item.label}`}>
                          <Ionicons name="trash-outline" size={15} color="#F87171" />
                        </Button>
                      </View>
                    </View>
                  );
                })}

                {/* PIED DU TABLEAU : TOTAL ARRONDI */}
                <View className="flex-row justify-between items-center px-5 py-4 bg-muted/30 border-t border-border">
                  <View>
                    <Text className="text-xs font-black text-foreground uppercase tracking-wider">
                      TOTAL DES CHARGES
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Arrondi à l&apos;unité • {activeFixedExpenses.length} charge{activeFixedExpenses.length > 1 ? 's' : ''} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-black text-foreground">
                      {formatEuroRound(totalFixedExpenses)}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Exact : {formatEuro(totalFixedExpenses)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </ScrollView>
      )}

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION D'UNE CHARGE FIXE */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={() => setIsModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full max-w-[500px]">
            <Pressable
              className="bg-card rounded-3xl p-6 border border-border shadow-lg w-full gap-4 max-h-[90vh]"
              onPress={(e) => e.stopPropagation()}>
              
              {/* EN-TÊTE DU FORMULAIRE */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                    <Ionicons
                      name={editingItem ? 'create-outline' : 'add-circle-outline'}
                      size={20}
                      color="#6366F1"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-black text-foreground">
                      {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Poste de dépense mensuelle récurrente
                    </Text>
                  </View>
                </View>

                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => setIsModalVisible(false)}
                  className="w-8 h-8 rounded-full"
                  accessibilityLabel="Fermer la boîte de dialogue">
                  <Ionicons name="close" size={20} color="#64748B" />
                </Button>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-4 pb-2"
                bounces={false}>
                
                {/* CHAMP 1 : NOM */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Nom de la charge</Text>
                  <Input
                    value={labelInput}
                    onChangeText={setLabelInput}
                    placeholder="Ex: Loyer, EDF, Forfait internet..."
                    placeholderTextColor="#64748B"
                    className="bg-muted/40 border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground h-11"
                    autoFocus={!editingItem}
                  />
                </View>

                {/* CHAMP 2 : MONTANT */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Montant mensuel (€)</Text>
                  <Input
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="decimal-pad"
                    placeholder="Ex: 85.00"
                    placeholderTextColor="#64748B"
                    className="bg-muted/40 border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground h-11"
                  />
                </View>

                {/* CHAMP 3 : CATÉGORIE */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Catégorie</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(Object.keys(CATEGORY_CONFIG) as FixedCategoryType[]).map((catKey) => {
                      const isSelected = categoryInput === catKey;
                      const c = CATEGORY_CONFIG[catKey];
                      return (
                        <TouchableOpacity
                          key={catKey}
                          onPress={() => handleSelectCategory(catKey)}
                          activeOpacity={0.7}
                          className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-border bg-muted/20'
                          }`}>
                          <Ionicons
                            name={c.icon as any}
                            size={15}
                            color={isSelected ? c.color : '#64748B'}
                          />
                          <Text
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-lavender font-bold' : 'text-foreground'
                            }`}>
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* CHAMP 4 : OPTION CRÉDIT SUR DURÉE LIMITÉE */}
                <View className="rounded-2xl border border-border bg-muted/20 p-4 gap-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View
                        className={`w-8 h-8 rounded-lg justify-center items-center ${
                          isCreditInput ? 'bg-emerald-100' : 'bg-muted'
                        }`}>
                        <Ionicons
                          name={isCreditInput ? 'time' : 'time-outline'}
                          size={16}
                          color={isCreditInput ? '#10B981' : '#64748B'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">
                          Crédit / Prêt sur durée limitée
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">
                          S&apos;enlève automatiquement une fois soldé
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsCreditInput((prev) => !prev)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isCreditInput }}
                      className={`w-12 h-6 rounded-full p-0.5 justify-center ${
                        isCreditInput ? 'bg-accent items-end' : 'bg-slate-300 items-start'
                      }`}>
                      <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </TouchableOpacity>
                  </View>

                  {isCreditInput && (
                    <View className="gap-3 pt-2 border-t border-border">
                      <Text className="text-[11px] font-bold text-foreground">
                        Durée de remboursement
                      </Text>
                      <View className="flex-row flex-wrap gap-1.5">
                        {[
                          { label: '3x', months: '3' },
                          { label: '6 mois', months: '6' },
                          { label: '12 mois', months: '12' },
                          { label: '24 mois', months: '24' },
                          { label: '36 mois', months: '36' },
                          { label: '48 mois', months: '48' },
                        ].map((preset) => {
                          const isSelected = durationInput === preset.months;
                          return (
                            <Button
                              key={preset.months}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onPress={() => setDurationInput(preset.months)}
                              className={`px-2.5 py-1 rounded-lg h-8 ${
                                isSelected ? 'bg-primary' : 'border-border bg-card'
                              }`}>
                              <Text
                                className={`text-xs font-bold ${
                                  isSelected ? 'text-white' : 'text-muted-foreground'
                                }`}>
                                {preset.label}
                              </Text>
                            </Button>
                          );
                        })}
                      </View>

                      <View className="flex-row gap-3">
                        <View className="flex-1 gap-1">
                          <Text className="text-[11px] font-bold text-muted-foreground">
                            Mois totaux
                          </Text>
                          <Input
                            value={durationInput}
                            onChangeText={setDurationInput}
                            keyboardType="number-pad"
                            placeholder="12"
                            placeholderTextColor="#64748B"
                            className="bg-card border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground h-10"
                          />
                        </View>

                        <View className="flex-1 gap-1">
                          <Text className="text-[11px] font-bold text-muted-foreground">
                            Mois déjà payés
                          </Text>
                          <Input
                            value={paidMonthsInput}
                            onChangeText={setPaidMonthsInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor="#64748B"
                            className="bg-card border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground h-10"
                          />
                        </View>
                      </View>

                      {/* Aperçu direct */}
                      <View className="bg-card rounded-xl p-3 border border-border gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-muted-foreground">Mensualité :</Text>
                          <Text className="text-xs font-bold text-foreground">
                            {formatEuro(parsedAmountForCredit)} / mois
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-muted-foreground">Restantes :</Text>
                          <Text className="text-xs font-bold text-foreground">
                            {remainingMonthsPreview} sur {parsedDurationForCredit} mois
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-muted-foreground">Solde dû :</Text>
                          <Text className="text-xs font-extrabold text-danger">
                            {formatEuro(remainingCostCreditPreview)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-muted-foreground">Fin estimée :</Text>
                          <Text className="text-xs font-extrabold text-accentDark">
                            {remainingMonthsPreview === 0 ? 'Soldé' : estimatedEndDatePreview}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* CHAMP 5 : OPTION MOIS D'ACTIVATION */}
                <View className="rounded-2xl border border-border bg-muted/20 p-4 gap-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View
                        className={`w-8 h-8 rounded-lg justify-center items-center ${
                          isScheduledInput ? 'bg-indigo-100' : 'bg-muted'
                        }`}>
                        <Ionicons
                          name={isScheduledInput ? 'calendar' : 'calendar-outline'}
                          size={16}
                          color={isScheduledInput ? '#6366F1' : '#64748B'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">
                          Planifier l&apos;activation
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">
                          Démarrer plus tard ou pour un mois donné
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsScheduledInput((prev) => !prev)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isScheduledInput }}
                      className={`w-12 h-6 rounded-full p-0.5 justify-center ${
                        isScheduledInput ? 'bg-lavender items-end' : 'bg-slate-300 items-start'
                      }`}>
                      <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </TouchableOpacity>
                  </View>

                  {isScheduledInput && (
                    <View className="gap-3 pt-2 border-t border-border">
                      <Text className="text-[11px] font-bold text-foreground">Mode d&apos;application</Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setActivationTypeInput('starting_from')}
                          className={`flex-1 p-2.5 rounded-xl border ${
                            activationTypeInput === 'starting_from'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-border bg-card'
                          }`}>
                          <View className="flex-row items-center gap-1.5 mb-0.5">
                            <Ionicons
                              name="arrow-forward-circle-outline"
                              size={15}
                              color={activationTypeInput === 'starting_from' ? '#6366F1' : '#64748B'}
                            />
                            <Text
                              className={`text-xs font-bold ${
                                activationTypeInput === 'starting_from'
                                  ? 'text-lavender'
                                  : 'text-foreground'
                              }`}>
                              À partir de
                            </Text>
                          </View>
                          <Text className="text-[10px] text-muted-foreground">
                            Démarre au mois choisi et continue
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setActivationTypeInput('only_month')}
                          className={`flex-1 p-2.5 rounded-xl border ${
                            activationTypeInput === 'only_month'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-border bg-card'
                          }`}>
                          <View className="flex-row items-center gap-1.5 mb-0.5">
                            <Ionicons
                              name="stopwatch-outline"
                              size={15}
                              color={activationTypeInput === 'only_month' ? '#6366F1' : '#64748B'}
                            />
                            <Text
                              className={`text-xs font-bold ${
                                activationTypeInput === 'only_month'
                                  ? 'text-lavender'
                                  : 'text-foreground'
                              }`}>
                              Uniquement
                            </Text>
                          </View>
                          <Text className="text-[10px] text-muted-foreground">
                            Exclusivement pour ce mois
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Présélections mois */}
                      <Text className="text-[11px] font-bold text-muted-foreground">
                        Sélection rapide
                      </Text>
                      <View className="flex-row flex-wrap gap-1.5">
                        {monthPresets.map((preset) => {
                          const isSelected = targetMonthInput === preset.value;
                          return (
                            <Button
                              key={preset.value}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onPress={() => setTargetMonthInput(preset.value)}
                              className={`px-2.5 py-1 rounded-lg h-8 ${
                                isSelected ? 'bg-primary' : 'border-border bg-card'
                              }`}>
                              <Text
                                className={`text-xs font-bold ${
                                  isSelected ? 'text-white' : 'text-muted-foreground'
                                }`}>
                                {preset.label}
                              </Text>
                            </Button>
                          );
                        })}
                      </View>

                      <View className="gap-1">
                        <Text className="text-[11px] font-bold text-muted-foreground">
                          Mois cible (AAAA-MM)
                        </Text>
                        <Input
                          value={targetMonthInput}
                          onChangeText={setTargetMonthInput}
                          placeholder={currentMonthStr}
                          placeholderTextColor="#64748B"
                          maxLength={7}
                          className="bg-card border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground h-10"
                        />
                      </View>

                      {/* Aperçu statut planification */}
                      <View className="bg-card rounded-xl p-3 border border-border gap-1">
                        <View className="flex-row justify-between items-center">
                          <Badge
                            variant="outline"
                            className={`px-2 py-0.5 rounded ${
                              targetMonthPreviewStatus.isCounted
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-indigo-50 border-indigo-200'
                            }`}>
                            <Text
                              className={`text-[10px] font-black ${
                                targetMonthPreviewStatus.isCounted
                                  ? 'text-accentDark'
                                  : 'text-lavender'
                              }`}>
                              {targetMonthPreviewStatus.label}
                            </Text>
                          </Badge>
                          <Text className="text-xs font-bold text-muted-foreground">
                            {formatMonthYearFull(targetMonthInput)}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {targetMonthPreviewStatus.description}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* BOUTONS D'ACTION DU MODAL */}
              <View className="flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onPress={() => setIsModalVisible(false)}
                  className="rounded-xl px-4 py-2.5 h-auto">
                  <Text className="text-xs font-bold text-foreground">Annuler</Text>
                </Button>

                <Button
                  onPress={handleSave}
                  disabled={isSaving}
                  className={`bg-primary rounded-xl px-4 py-2.5 gap-1.5 h-auto ${
                    isSaving ? 'opacity-80' : ''
                  }`}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" className="mr-1.5" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  )}
                  <Text className="text-xs font-bold text-white">
                    {isSaving ? 'Enregistrement...' : editingItem ? 'Enregistrer' : 'Ajouter la charge'}
                  </Text>
                </Button>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* POPUP DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer la charge fixe"
        message="Êtes-vous sûr de vouloir supprimer la charge"
        highlightText={deleteTarget?.label}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* POPUP DE VALIDATION ET D'ERREUR */}
      {feedbackDialog && (
        <AppDialog
          visible={feedbackDialog.visible}
          type={feedbackDialog.type}
          title={feedbackDialog.title}
          message={feedbackDialog.message}
          confirmLabel="Compris"
          onConfirm={() => setFeedbackDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}
