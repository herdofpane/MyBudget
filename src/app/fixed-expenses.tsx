import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
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
import { colors } from '@/theme/colors';
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        
        {/* 1. CARTE DU TOTAL DES CHARGES FIXES */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.summaryLabelRow}>
                <Text style={styles.summaryLabel}>Total des charges fixes</Text>
                <Badge variant="outline" style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>Arrondi à l&apos;unité</Text>
                </Badge>
              </View>
              <Text style={styles.summaryTotal}>{formatEuroRound(totalFixedExpenses)}</Text>
              <Text style={styles.summaryExact}>
                Montant exact : {formatEuro(totalFixedExpenses)}
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Ionicons name="layers-outline" size={16} color="#9b6fba" />
              <Text style={styles.countBadgeText}>
                {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* BANDEAU INFORMATIF SI DES CRÉDITS SONT ARRIVÉS À ÉCHÉANCE */}
          {expiredCreditsCount > 0 && (
            <View style={styles.creditExpiredNoticeBanner}>
              <Ionicons name="shield-checkmark" size={15} color={colors.accent} />
              <Text style={styles.creditExpiredNoticeText}>
                {expiredCreditsCount} crédit{expiredCreditsCount > 1 ? 's' : ''} arrivé{expiredCreditsCount > 1 ? 's' : ''} à terme automatiquement exclu{expiredCreditsCount > 1 ? 's' : ''} du total
              </Text>
            </View>
          )}

          {/* BANDEAU INFORMATIF SI DES CHARGES SONT DIFFÉRÉES / À VENIR */}
          {upcomingChargesCount > 0 && (
            <View style={styles.scheduledNoticeBanner}>
              <Ionicons name="calendar-outline" size={15} color={colors.lavender} />
              <Text style={styles.scheduledNoticeText}>
                {upcomingChargesCount} charge{upcomingChargesCount > 1 ? 's' : ''} différée{upcomingChargesCount > 1 ? 's' : ''} à venir (non imputée{upcomingChargesCount > 1 ? 's' : ''} ce mois-ci)
              </Text>
            </View>
          )}

          {/* PETIT RÉCAPITULATIF STATISTIQUE */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moyenne par charge</Text>
              <Text style={styles.statValue}>~{formatEuroRound(averageExpense)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Part des revenus</Text>
              <Text style={styles.statValue}>{formatPercent(fixedExpenseRatio)}</Text>
            </View>
          </View>
        </Card>

        {/* 2. LE TABLEAU DES CHARGES FIXES ÉPURÉ */}
        <View style={styles.tableCard}>
          {/* EN-TÊTE DU TABLEAU */}
          <View style={styles.tableTopHeader}>
            <View style={styles.tableTitleGroup}>
              <View style={styles.tableTitleIconWrap}>
                <Ionicons name="receipt-outline" size={18} color="#9B6FBA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tableTitle}>Charges fixes & abonnements</Text>
                <Text style={styles.tableSubtitle}>
                  {activeFixedExpenses.length} prélèvement{activeFixedExpenses.length > 1 ? 's' : ''} actif{activeFixedExpenses.length > 1 ? 's' : ''}
                  {expiredCreditsCount > 0 && ` • ${expiredCreditsCount} crédit${expiredCreditsCount > 1 ? 's' : ''} soldé${expiredCreditsCount > 1 ? 's' : ''}`}
                  {upcomingChargesCount > 0 && ` • ${upcomingChargesCount} à venir`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={openAddModal}
              activeOpacity={0.7}
              style={styles.addInlineBtn}>
              <Ionicons name="add-circle" size={16} color="#9B6FBA" />
              <Text style={styles.addInlineBtnText}>Nouvelle charge</Text>
            </TouchableOpacity>
          </View>

          {fixedExpensesList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={42} color="#9B6FBA" />
              <Text style={styles.emptyTitle}>Aucune charge fixe enregistrée</Text>
              <Text style={styles.emptyText}>
                Ajoutez vos charges récurrentes (loyer, abonnements, assurances, crédits...) pour calculer votre budget.
              </Text>
              <Button variant="default" size="sm" onPress={openAddModal} style={{ marginTop: 12 }}>
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginLeft: 4 }}>
                  Ajouter ma première charge
                </Text>
              </Button>
            </View>
          ) : (
            <View style={styles.tableInner}>
              {/* LIGNE DES COLONNES DU TABLEAU */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.colCharge]}>POSTE DE CHARGE</Text>
                <Text style={[styles.tableColHeader, styles.colAmountHeader]}>MONTANT / MOIS</Text>
                <Text style={[styles.tableColHeader, styles.colActionsHeader]}>ACTIONS</Text>
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
                    style={[
                      styles.tableRow,
                      isEven ? styles.tableRowEven : styles.tableRowOdd,
                      isExpired && styles.tableRowExpired,
                      isNotCounted && !isExpired && styles.tableRowInactive,
                      index === fixedExpensesList.length - 1 && styles.tableRowLast,
                    ]}>
                    {/* COLONNE 1 : CHARGE & CATÉGORIE & CRÉDIT */}
                    <View style={styles.colCharge}>
                      <View style={styles.tableChargeWrap}>
                        <View style={[styles.tableCatIconSmall, { backgroundColor: cat.bg }]}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text
                              style={[
                                styles.tableItemTitle,
                                isExpired && styles.tableItemTitleExpired,
                                isNotCounted && !isExpired && styles.tableItemTitleInactive,
                              ]}
                              numberOfLines={1}>
                              {item.label}
                            </Text>

                            {/* Badge Crédit */}
                            {isCredit && (
                              <Badge
                                variant="outline"
                                style={isExpired ? styles.creditBadgeExpired : styles.creditBadgeActive}>
                                <Text
                                  style={
                                    isExpired
                                      ? styles.creditBadgeTextExpired
                                      : styles.creditBadgeTextActive
                                  }>
                                  {isExpired ? 'Soldé' : `${creditInfo?.paid}/${creditInfo?.total} mois`}
                                </Text>
                              </Badge>
                            )}

                            {/* Badge Statut d'activation / Planification si particulier */}
                            {schedule.status !== 'active' && schedule.status !== 'credit_expired' && (
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: schedule.badgeBg,
                                  borderColor: schedule.badgeBorder,
                                  paddingHorizontal: 7,
                                  paddingVertical: 1,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '800',
                                    color: schedule.badgeColor,
                                  }}>
                                  {schedule.badgeLabel}
                                </Text>
                              </Badge>
                            )}
                          </View>

                          <Text style={[styles.tableCatBadge, { color: cat.color }]}>
                            {cat.label}
                            {isCredit && !isExpired && ` • Reste ${creditInfo?.remainingMonths} mois`}
                            {!isCredit && schedule.status === 'upcoming' && ` • Prévue dès ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'past' && ` • Était pour ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'only_month_active' && ' • Active ce mois-ci uniquement'}
                          </Text>

                          {/* Progression visuelle du crédit en cours */}
                          {isCredit && !isExpired && (
                            <View style={styles.creditMiniProgressTrack}>
                              <View
                                style={[
                                  styles.creditMiniProgressFill,
                                  { width: `${creditInfo?.percent || 0}%` },
                                ]}
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* COLONNE 2 : MONTANT */}
                    <View style={styles.colAmount}>
                      <Text
                        style={[
                          styles.tableAmountText,
                          isExpired && styles.tableAmountExpired,
                          isNotCounted && !isExpired && styles.tableAmountInactive,
                        ]}>
                        -{formatEuro(item.amount)}
                      </Text>
                      {isExpired && (
                        <Text style={styles.tableAmountSubExpired}>0 € imputé</Text>
                      )}
                      {isNotCounted && !isExpired && (
                        <Text style={styles.tableAmountSubInactive}>Non imputé</Text>
                      )}
                      {isCredit && !isExpired && (
                        <Text style={styles.tableCreditRemainingSub}>
                          Dû : {formatEuro(creditInfo?.remainingAmount || 0)}
                        </Text>
                      )}
                    </View>

                    {/* COLONNE 3 : ACTIONS (AVANCER CRÉDIT / MODIFIER / SUPPRIMER) */}
                    <View style={styles.colActions}>
                      {isCredit && !isExpired && (
                        <TouchableOpacity
                          onPress={() => handleAdvanceMonth(item)}
                          style={styles.tableActionCreditBtn}
                          accessibilityLabel={`Enregistrer +1 mois payé pour ${item.label}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Ionicons name="checkmark-circle-outline" size={17} color={colors.accent} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        style={styles.tableActionBtn}
                        accessibilityLabel={`Modifier ${item.label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="pencil-outline" size={16} color="#5C5264" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.label)}
                        style={styles.tableActionBtn}
                        accessibilityLabel={`Supprimer ${item.label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={16} color="#d43f5e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* PIED DU TABLEAU : TOTAL ARRONDI À L'UNITÉ */}
              <View style={styles.tableTotalFooter}>
                <View style={styles.tableTotalLeft}>
                  <Text style={styles.tableTotalTitle}>TOTAL DES CHARGES</Text>
                  <Text style={styles.tableTotalSub}>
                    Arrondi à l&apos;unité • {activeFixedExpenses.length} charge{activeFixedExpenses.length > 1 ? 's' : ''} active{activeFixedExpenses.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.tableTotalRight}>
                  <Text style={styles.tableTotalAmount}>
                    {formatEuroRound(totalFixedExpenses)}
                  </Text>
                  <Text style={styles.tableTotalExact}>
                    Exact : {formatEuro(totalFixedExpenses)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        </ScrollView>
      )}

{/* FORMULAIRE MODAL D'AJOUT / ÉDITION REDESSINÉ */}
<Modal
  visible={isModalVisible}
  animationType="fade"
  transparent
  onRequestClose={() => setIsModalVisible(false)}>
<Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={styles.modalKeyboardWrap}>
    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
    {/* EN-TÊTE DU FORMULAIRE */}
    <View style={styles.modalHeader}>
      <View style={styles.modalHeaderTitleGroup}>
        <View style={styles.modalIconWrap}>
          <Ionicons
            name={editingItem ? 'create-outline' : 'add-circle-outline'}
            size={20}
            color="#9B6FBA"
          />
        </View>
        <View>
          <Text style={styles.modalTitle}>
            {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
          </Text>
          <Text style={styles.modalSubtitle}>
            Poste de dépense mensuelle récurrente
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setIsModalVisible(false)}
        style={styles.closeBtn}
        accessibilityLabel="Fermer la boîte de dialogue">
        <Ionicons name="close" size={20} color="#5C5264" />
      </TouchableOpacity>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.modalScrollBody}
      bounces={false}>
      
      {/* CHAMP 1 : NOM DE LA CHARGE */}
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nom de la charge</Text>
        <Input
          value={labelInput}
          onChangeText={setLabelInput}
          placeholder="Ex: Loyer, EDF, Forfait internet..."
          placeholderTextColor="#8E8296"
          style={styles.input}
          autoFocus={!editingItem}
        />
      </View>

      {/* CHAMP 2 : MONTANT MENSUEL */}
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Montant mensuel (€)</Text>
        <Input
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="decimal-pad"
          placeholder="Ex: 85.00"
          placeholderTextColor="#8E8296"
          style={styles.input}
        />
      </View>

      {/* CHAMP 3 : SÉLECTION DE LA CATÉGORIE */}
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Catégorie</Text>
        <View style={styles.categoryPicker}>
          {(Object.keys(CATEGORY_CONFIG) as FixedCategoryType[]).map((catKey) => {
            const isSelected = categoryInput === catKey;
            const c = CATEGORY_CONFIG[catKey];
            return (
              <TouchableOpacity
                key={catKey}
                onPress={() => handleSelectCategory(catKey)}
                activeOpacity={0.7}
                style={[
                  styles.catOption,
                  isSelected && {
                    borderColor: c.color,
                    backgroundColor: c.bg,
                  },
                ]}>
                <Ionicons
                  name={c.icon as any}
                  size={15}
                  color={isSelected ? c.color : '#5C5264'}
                />
                <Text
                  style={[
                    styles.catOptionText,
                    isSelected && { color: c.color, fontWeight: '700' },
                  ]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* CHAMP 4 : OPTION CRÉDIT SUR DURÉE LIMITÉE (X MOIS) */}
      <View style={styles.creditCardSection}>
        <View style={styles.creditToggleHeader}>
          <View style={styles.creditToggleTitleGroup}>
            <View style={[styles.creditIconWrap, isCreditInput && styles.creditIconWrapActive]}>
              <Ionicons
                name={isCreditInput ? 'time' : 'time-outline'}
                size={18}
                color={isCreditInput ? colors.accent : '#5C5264'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.creditToggleTitle}>Crédit / Prêt sur durée limitée</Text>
              <Text style={styles.creditToggleSubtitle}>
                S&apos;enlève automatiquement du total une fois soldé
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsCreditInput((prev) => !prev)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isCreditInput }}
            accessibilityLabel="Activer le mode crédit sur durée limitée"
            style={[styles.switchTrack, isCreditInput && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, isCreditInput && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        {isCreditInput && (
          <View style={styles.creditBody}>
            {/* PRÉSÉLECTIONS RAPIDES DE DURÉE */}
            <Text style={styles.inputSubLabel}>Durée de remboursement</Text>
            <View style={styles.presetPillsRow}>
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
                  <TouchableOpacity
                    key={preset.months}
                    onPress={() => setDurationInput(preset.months)}
                    activeOpacity={0.7}
                    style={[styles.presetPill, isSelected && styles.presetPillActive]}>
                    <Text
                      style={[
                        styles.presetPillText,
                        isSelected && styles.presetPillTextActive,
                      ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CHAMPS DÉTAILLÉS : DURÉE TOTALE & MENSUALITÉS DÉJÀ REMBOURSÉES */}
            <View style={styles.creditInputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSubLabel}>Mois totaux</Text>
                <Input
                  value={durationInput}
                  onChangeText={setDurationInput}
                  keyboardType="number-pad"
                  placeholder="12"
                  placeholderTextColor="#8E8296"
                  style={styles.input}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputSubLabel}>Mois déjà payés</Text>
                <Input
                  value={paidMonthsInput}
                  onChangeText={setPaidMonthsInput}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#8E8296"
                  style={styles.input}
                />
              </View>
            </View>

            {/* ENCART RÉCAPITULATIF DYNAMIQUE DU CRÉDIT */}
            <View style={styles.creditPreviewBox}>
              <View style={styles.creditPreviewRow}>
                <Text style={styles.creditPreviewLabel}>Mensualité :</Text>
                <Text style={styles.creditPreviewValue}>
                  {formatEuro(parsedAmountForCredit)} / mois
                </Text>
              </View>
              <View style={styles.creditPreviewRow}>
                <Text style={styles.creditPreviewLabel}>Mensualités restantes :</Text>
                <Text style={styles.creditPreviewValue}>
                  {remainingMonthsPreview} sur {parsedDurationForCredit} mois
                </Text>
              </View>
              <View style={styles.creditPreviewRow}>
                <Text style={styles.creditPreviewLabel}>Solde restant dû :</Text>
                <Text style={[styles.creditPreviewValue, { color: colors.danger, fontWeight: '800' }]}>
                  {formatEuro(remainingCostCreditPreview)}
                </Text>
              </View>
              <View style={styles.creditPreviewRow}>
                <Text style={styles.creditPreviewLabel}>Fin estimée :</Text>
                <Text style={[styles.creditPreviewValue, { color: colors.accentDark, fontWeight: '800' }]}>
                  {remainingMonthsPreview === 0 ? 'Soldé' : estimatedEndDatePreview}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* CHAMP 5 : OPTION MOIS D'ACTIVATION / PLANIFICATION */}
      <View style={styles.scheduleCardSection}>
        <View style={styles.scheduleToggleHeader}>
          <View style={styles.scheduleToggleTitleGroup}>
            <View style={[styles.scheduleIconWrap, isScheduledInput && styles.scheduleIconWrapActive]}>
              <Ionicons
                name={isScheduledInput ? 'calendar' : 'calendar-outline'}
                size={18}
                color={isScheduledInput ? colors.lavender : '#5C5264'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleToggleTitle}>Planifier l&apos;activation à un mois précis</Text>
              <Text style={styles.scheduleToggleSubtitle}>
                Démarrer plus tard ou imputer uniquement un mois donné
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsScheduledInput((prev) => !prev)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isScheduledInput }}
            accessibilityLabel="Planifier le mois d'activation"
            style={[styles.switchTrack, isScheduledInput && styles.switchTrackLavenderActive]}>
            <View style={[styles.switchThumb, isScheduledInput && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        {isScheduledInput && (
          <View style={styles.scheduleBody}>
            {/* SÉLECTEUR DE TYPE : À PARTIR DE CE MOIS vs UNIQUEMENT CE MOIS */}
            <Text style={styles.inputSubLabel}>Mode d&apos;application</Text>
            <View style={styles.activationTypeGrid}>
              {/* OPTION 1 : À PARTIR DE CE MOIS */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActivationTypeInput('starting_from')}
                style={[
                  styles.activationTypeCard,
                  activationTypeInput === 'starting_from' && styles.activationTypeCardActive,
                ]}>
                <View style={styles.activationTypeHeader}>
                  <Ionicons
                    name="arrow-forward-circle-outline"
                    size={18}
                    color={activationTypeInput === 'starting_from' ? colors.lavender : '#5C5264'}
                  />
                  <Text
                    style={[
                      styles.activationTypeTitle,
                      activationTypeInput === 'starting_from' && styles.activationTypeTitleActive,
                    ]}>
                    À partir de ce mois
                  </Text>
                </View>
                <Text style={styles.activationTypeDesc}>
                  Démarre au mois choisi et continue chaque mois
                </Text>
              </TouchableOpacity>

              {/* OPTION 2 : UNIQUEMENT CE MOIS-CI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActivationTypeInput('only_month')}
                style={[
                  styles.activationTypeCard,
                  activationTypeInput === 'only_month' && styles.activationTypeCardActive,
                ]}>
                <View style={styles.activationTypeHeader}>
                  <Ionicons
                    name="stopwatch-outline"
                    size={18}
                    color={activationTypeInput === 'only_month' ? colors.lavender : '#5C5264'}
                  />
                  <Text
                    style={[
                      styles.activationTypeTitle,
                      activationTypeInput === 'only_month' && styles.activationTypeTitleActive,
                    ]}>
                    Uniquement ce mois-ci
                  </Text>
                </View>
                <Text style={styles.activationTypeDesc}>
                  Charge ponctuelle imputée exclusivement ce mois-là
                </Text>
              </TouchableOpacity>
            </View>

            {/* PRÉSÉLECTIONS RAPIDES DU MOIS CIBLE */}
            <Text style={styles.inputSubLabel}>Sélection rapide du mois</Text>
            <View style={styles.presetPillsRow}>
              {monthPresets.map((preset) => {
                const isSelected = targetMonthInput === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.value}
                    onPress={() => setTargetMonthInput(preset.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.presetPill,
                      isSelected && styles.presetPillLavenderActive,
                    ]}>
                    <Text
                      style={[
                        styles.presetPillText,
                        isSelected && styles.presetPillTextLavenderActive,
                      ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SAISIE MANUELLE DU MOIS (FORMAT AAAA-MM) */}
            <View>
              <Text style={styles.inputSubLabel}>Mois cible (Format AAAA-MM)</Text>
              <Input
                value={targetMonthInput}
                onChangeText={setTargetMonthInput}
                placeholder={currentMonthStr}
                placeholderTextColor="#8E8296"
                maxLength={7}
                style={styles.input}
              />
            </View>

            {/* ENCART PÉDAGOGIQUE RÉCAPITULATIF EN DIRECT */}
            <View style={styles.schedulePreviewBox}>
              <View style={styles.schedulePreviewTop}>
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: targetMonthPreviewStatus.isCounted ? '#ECFDF5' : '#EEF2FF',
                    borderColor: targetMonthPreviewStatus.isCounted ? '#A7F3D0' : '#C7D2FE',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: targetMonthPreviewStatus.isCounted ? colors.accentDark : colors.lavender,
                    }}>
                    {targetMonthPreviewStatus.label}
                  </Text>
                </Badge>
                <Text style={styles.schedulePreviewMonthTag}>
                  {formatMonthYearFull(targetMonthInput)}
                </Text>
              </View>
              <Text style={styles.schedulePreviewDesc}>
                {targetMonthPreviewStatus.description}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>

    {/* BOUTONS D'ACTION DU FORMULAIRE FIXÉS EN BAS AVEC RESPIRATION */}
    <View style={styles.modalActionButtons}>
      <TouchableOpacity
        onPress={() => setIsModalVisible(false)}
        activeOpacity={0.7}
        style={styles.cancelActionBtn}>
        <Text style={styles.cancelActionBtnText}>Annuler</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSave}
        disabled={isSaving}
        activeOpacity={0.85}
        style={[styles.saveActionBtn, isSaving && { opacity: 0.8 }]}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        )}
        <Text style={styles.saveActionBtnText}>
          {isSaving ? 'Enregistrement...' : editingItem ? 'Enregistrer' : 'Ajouter la charge'}
        </Text>
      </TouchableOpacity>
    </View>
    </Pressable>
  </KeyboardAvoidingView>
</Pressable>
</Modal>

      {/* POPUP DE CONFIRMATION DE SUPPRESSION AVEC ÉTAT DE CHARGEMENT */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },

  /* CARTE DU TOTAL */
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C5264',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  unitBadge: {
    backgroundColor: '#F5EEFA',
    borderColor: '#D2B5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9B6FBA',
    letterSpacing: 0.3,
  },
  summaryTotal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#d43f5e',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  summaryExact: {
    fontSize: 13,
    color: '#5C5264',
    fontWeight: '600',
    marginTop: 4,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFA',
    borderWidth: 1,
    borderColor: '#D2B5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9B6FBA',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8296',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#241E28',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#DFD8CA',
    marginHorizontal: 14,
  },

  /* CARTE DU TABLEAU */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#DFD8CA',
    overflow: 'hidden',
    shadowColor: '#241E28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tableTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tableTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tableTitleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5EEFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9DDF5',
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  tableSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5EEFA',
    borderWidth: 1,
    borderColor: '#D2B5E8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  addInlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9B6FBA',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },

  /* STRUCTURE DU TABLEAU */
  tableInner: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  colCharge: {
    flex: 1,
  },
  colAmountHeader: {
    width: 110,
    textAlign: 'right',
    paddingRight: 10,
  },
  colActionsHeader: {
    width: 76,
    textAlign: 'right',
    paddingRight: 4,
  },
  colAmount: {
    width: 110,
    alignItems: 'flex-end',
    textAlign: 'right',
    paddingRight: 10,
  },
  colActions: {
    width: 76,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4D8',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#FAF7F2',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableChargeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableCatIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#241E28',
  },
  tableCatBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  tableAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d43f5e',
  },
  tableActionBtn: {
    padding: 4,
    borderRadius: 6,
  },
  tableTotalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5EEFA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: '#D2B5E8',
  },
  tableTotalLeft: {
    flex: 1,
  },
  tableTotalRight: {
    alignItems: 'flex-end',
  },
  tableTotalTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8656A8',
    letterSpacing: 0.5,
  },
  tableTotalSub: {
    fontSize: 10,
    color: '#5C5264',
    marginTop: 2,
  },
  tableTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#8656A8',
  },
  tableTotalExact: {
    fontSize: 11,
    color: '#5C5264',
    marginTop: 1,
  },

  /* MODAL REDESSINÉ ET TOTALEMENT RESPONSIVE */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 30, 40, 0.60)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalKeyboardWrap: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    shadowColor: '#241E28',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DFD8CA',
    backgroundColor: '#ffffff',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EEFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#241E28',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#5C5264',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFD8CA',
  },
  modalScrollBody: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241E28',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderColor: '#DFD8CA',
    borderWidth: 1,
    color: '#241E28',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  catOptionText: {
    fontSize: 12,
    color: '#5C5264',
    fontWeight: '600',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#DFD8CA',
    backgroundColor: '#ffffff',
  },
  cancelActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD8CA',
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C5264',
  },
  saveActionBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#9B6FBA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#9B6FBA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* BADGES & PROGRESSION DU CRÉDIT */
  creditBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  creditBadgeTextActive: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accentDark,
  },
  creditBadgeExpired: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  creditBadgeTextExpired: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  creditMiniProgressTrack: {
    width: '100%',
    maxWidth: 140,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  creditMiniProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  tableRowExpired: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  tableItemTitleExpired: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  tableAmountExpired: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  tableAmountSubExpired: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accentDark,
    marginTop: 1,
  },
  tableCreditRemainingSub: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  tableActionCreditBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  creditExpiredNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  creditExpiredNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentDark,
    flex: 1,
  },

  /* SECTION FORMULAIRE DU CRÉDIT */
  creditCardSection: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },
  creditToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  creditToggleTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  creditIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F4F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditIconWrapActive: {
    backgroundColor: '#ECFDF5',
  },
  creditToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#241E28',
  },
  creditToggleSubtitle: {
    fontSize: 11,
    color: '#5C5264',
    marginTop: 1,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DFD8CA',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: colors.accent,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  creditBody: {
    marginTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAE4D8',
    paddingTop: 12,
  },
  inputSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C5264',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  presetPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F4F0E8',
    borderWidth: 1,
    borderColor: '#DFD8CA',
  },
  presetPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: colors.accent,
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C5264',
  },
  presetPillTextActive: {
    color: colors.accentDark,
    fontWeight: '800',
  },
  creditInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  creditPreviewBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  creditPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditPreviewLabel: {
    fontSize: 12,
    color: '#5C5264',
    fontWeight: '600',
  },
  creditPreviewValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#241E28',
  },

  /* BANDEAU CHARGES DIFFÉRÉES / À VENIR */
  scheduledNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  scheduledNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
    flex: 1,
  },

  /* ÉTATS D'INACTIVITÉ DANS LE TABLEAU */
  tableRowInactive: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  tableItemTitleInactive: {
    color: colors.textMuted,
  },
  tableAmountInactive: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  tableAmountSubInactive: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.lavender,
    marginTop: 1,
  },

  /* SECTION PLANIFICATION / MOIS D'ACTIVATION */
  scheduleCardSection: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  scheduleToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  scheduleToggleTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  scheduleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F4F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleIconWrapActive: {
    backgroundColor: '#EEF2FF',
  },
  scheduleToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#241E28',
  },
  scheduleToggleSubtitle: {
    fontSize: 11,
    color: '#5C5264',
    marginTop: 1,
  },
  switchTrackLavenderActive: {
    backgroundColor: colors.lavender,
  },
  scheduleBody: {
    marginTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAE4D8',
    paddingTop: 12,
  },
  activationTypeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  activationTypeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD8CA',
    gap: 4,
  },
  activationTypeCardActive: {
    borderColor: colors.lavender,
    backgroundColor: '#F5F3FF',
  },
  activationTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activationTypeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241E28',
  },
  activationTypeTitleActive: {
    color: colors.lavender,
  },
  activationTypeDesc: {
    fontSize: 10,
    color: '#5C5264',
    lineHeight: 14,
  },
  presetPillLavenderActive: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.lavender,
  },
  presetPillTextLavenderActive: {
    color: '#4338CA',
    fontWeight: '800',
  },
  schedulePreviewBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  schedulePreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  schedulePreviewMonthTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  schedulePreviewDesc: {
    fontSize: 11,
    color: '#5C5264',
    lineHeight: 15,
  },
});
