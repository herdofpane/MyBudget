import React from 'react';
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
import { colors } from '@/theme/colors';

import { useFixedExpenses } from '@/hooks/use-fixed-expenses';
import { FixedCategoryType } from '@/types';
import { CATEGORY_CONFIG, FIXED_PRESET_ICONS } from '@/data';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';
import {
  getChargeScheduleStatus,
  formatMonthYear,
  formatMonthYearFull,
  getCreditProgress,
} from '@/utils/fixed-expenses';

export default function FixedExpensesScreen() {
  const {
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
    labelInput,
    setLabelInput,
    handleLabelChange,
    iconInput,
    isIconManuallySelected,
    amountInput,
    setAmountInput,
    categoryInput,
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
    openAddModal,
    openEditModal,
    handleSelectCategory,
    handleSelectIcon,
    handleSave,
    handleAdvanceMonth,
    handleDelete,
    handleConfirmDelete,
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
  } = useFixedExpenses();


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
          contentContainerClassName="px-3.5 sm:px-4 pt-1.5 pb-[115px] gap-3.5 sm:gap-4 w-full max-w-[860px] self-center">

          {/* 1. CARTE DU TOTAL DES CHARGES FIXES */}
          <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total charges fixes
                  </Text>
                  <Badge variant="outline" className="border-border bg-muted/30 px-1.5 py-0.5 rounded-full">
                    <Text className="text-[10px] text-muted-foreground font-semibold">
                      Arrondi unité
                    </Text>
                  </Badge>
                </View>
                <Text className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {formatEuroRound(totalFixedExpenses)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Montant exact : {formatEuro(totalFixedExpenses)}
                </Text>
              </View>

              <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="layers-outline" size={14} color={colors.lavender} />
                <Text className="text-xs font-bold text-lavender">
                  {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                </Text>
              </Badge>
            </View>

            {/* BANDEAU SI DES CRÉDITS SONT ARRIVÉS À ÉCHÉANCE */}
            {expiredCreditsCount > 0 && (
              <View className="flex-row items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 gap-2">
                <Ionicons name="shield-checkmark" size={15} color={colors.accent} />
                <Text className="text-xs text-accentDark font-semibold flex-1">
                  {expiredCreditsCount} crédit{expiredCreditsCount > 1 ? 's' : ''} arrivé{expiredCreditsCount > 1 ? 's' : ''} à terme automatiquement exclu{expiredCreditsCount > 1 ? 's' : ''} du total
                </Text>
              </View>
            )}

            {/* BANDEAU SI DES CHARGES SONT DIFFÉRÉES */}
            {upcomingChargesCount > 0 && (
              <View className="flex-row items-center bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 gap-2">
                <Ionicons name="calendar-outline" size={15} color={colors.lavender} />
                <Text className="text-xs text-lavender font-semibold flex-1">
                  {upcomingChargesCount} charge{upcomingChargesCount > 1 ? 's' : ''} différée{upcomingChargesCount > 1 ? 's' : ''} à venir (non imputée{upcomingChargesCount > 1 ? 's' : ''} ce mois-ci)
                </Text>
              </View>
            )}

            {/* PETIT RÉCAPITULATIF STATISTIQUE */}
            <View className="flex-row items-center bg-muted/30 rounded-2xl p-2.5 sm:p-3 border border-border">
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Moyenne par charge</Text>
                <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                  ~{formatEuroRound(averageExpense)}
                </Text>
              </View>
              <View className="w-px h-7 bg-border" />
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Part des revenus</Text>
                <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                  {formatPercent(fixedExpenseRatio)}
                </Text>
              </View>
            </View>
          </Card>

          {/* 2. LE TABLEAU DES CHARGES FIXES */}
          <Card className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* EN-TÊTE DU TABLEAU */}
            <View className="flex-row justify-between items-center p-4 sm:p-5 border-b border-border">
              <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
                  <Ionicons name="receipt-outline" size={18} color={colors.lavender} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm sm:text-base font-bold text-foreground">
                    Charges fixes & abonnements
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    {expiredCreditsCount > 0 && ` • ${expiredCreditsCount} soldé${expiredCreditsCount > 1 ? 's' : ''}`}
                    {upcomingChargesCount > 0 && ` • ${upcomingChargesCount} à venir`}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={openAddModal}
                className="border-indigo-300 bg-indigo-50 gap-1 rounded-xl h-8 px-2.5 shrink-0">
                <Ionicons name="add-circle" size={15} color={colors.lavender} />
                <Text className="text-xs font-bold text-lavender">Ajouter</Text>
              </Button>
            </View>

            {fixedExpensesList.length === 0 ? (
              <View className="p-8 items-center justify-center gap-3">
                <Ionicons name="folder-open-outline" size={42} color={colors.lavender} />
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
                <View className="flex-row items-center px-3.5 sm:px-4 py-2.5 bg-muted/40 border-b border-border">
                  <Text className="flex-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    POSTE DE CHARGE
                  </Text>
                  <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-2">
                    MONTANT
                  </Text>
                  <Text className="w-20 sm:w-24 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
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
                      className={`flex-row items-center px-3.5 sm:px-4 py-3 border-b border-border/60 ${
                        isExpired
                          ? 'bg-slate-50/70 opacity-60'
                          : isNotCounted
                          ? 'bg-muted/20 opacity-75'
                          : isEven
                          ? 'bg-card'
                          : 'bg-muted/10'
                      }`}>
                      {/* COLONNE 1 : CHARGE & CATÉGORIE & CRÉDIT */}
                      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                        <View
                          className="w-8 h-8 rounded-lg justify-center items-center shrink-0"
                          style={{ backgroundColor: cat.bg }}>
                          <Ionicons name={(item.icon || cat.icon) as any} size={16} color={cat.color} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5 flex-wrap">
                            <Text
                              className={`text-xs sm:text-sm font-bold text-foreground ${
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
                                  {isExpired ? 'Soldé' : `${creditInfo?.paid}/${creditInfo?.total}m`}
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

                          <Text className="text-[10px] sm:text-[11px] font-medium mt-0.5" style={{ color: cat.color }}>
                            {cat.label}
                            {isCredit && !isExpired && ` • Reste ${creditInfo?.remainingMonths} mois`}
                            {!isCredit && schedule.status === 'upcoming' && ` • Dès ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'past' && ` • Était pour ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
                            {!isCredit && schedule.status === 'only_month_active' && ' • Ce mois-ci uniquement'}
                          </Text>

                          {/* Progression du crédit */}
                          {isCredit && !isExpired && (
                            <View className="h-1 bg-muted rounded-full overflow-hidden mt-1 max-w-[100px]">
                              <View
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${creditInfo?.percent || 0}%` }}
                              />
                            </View>
                          )}
                        </View>
                      </View>

                      {/* COLONNE 2 : MONTANT */}
                      <View className="items-end pr-2 shrink-0">
                        <Text
                          className={`text-xs sm:text-sm font-black ${
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
                            Dû: {formatEuro(creditInfo?.remainingAmount || 0)}
                          </Text>
                        )}
                      </View>

                      {/* COLONNE 3 : ACTIONS */}
                      <View className="w-20 sm:w-24 flex-row items-center justify-end gap-1 shrink-0">
                        {isCredit && !isExpired && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => handleAdvanceMonth(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="w-7 h-7 rounded-lg"
                            accessibilityLabel={`Enregistrer +1 mois payé pour ${item.label}`}>
                            <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => openEditModal(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Modifier ${item.label}`}>
                          <Ionicons name="pencil-outline" size={15} color={colors.textMuted} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => handleDelete(item.id, item.label)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Supprimer ${item.label}`}>
                          <Ionicons name="trash-outline" size={15} color={colors.danger} />
                        </Button>
                      </View>
                    </View>
                  );
                })}

                {/* PIED DU TABLEAU : TOTAL ARRONDI */}
                <View className="flex-row justify-between items-center px-4 sm:px-5 py-3.5 bg-muted/30 border-t border-border">
                  <View>
                    <Text className="text-xs font-black text-foreground uppercase tracking-wider">
                      TOTAL DES CHARGES
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Arrondi unité • {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg sm:text-xl font-black text-foreground">
                      {formatEuroRound(totalFixedExpenses)}
                    </Text>
                    <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
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
          className="flex-1 bg-primary/50 justify-center items-center p-3.5 sm:p-4"
          onPress={() => setIsModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full max-w-[500px]">
            <Pressable
              className="bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-lg w-full gap-3.5 sm:gap-4 max-h-[90vh]"
              onPress={(e) => e.stopPropagation()}>
              
              {/* EN-TÊTE DU FORMULAIRE */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                  <View
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl justify-center items-center shrink-0 border"
                    style={{
                      backgroundColor: CATEGORY_CONFIG[categoryInput]?.bg || '#f3eef8',
                      borderColor: `${CATEGORY_CONFIG[categoryInput]?.color || colors.lavender}40`,
                    }}>
                    <Ionicons
                      name={(iconInput || (editingItem ? 'create-outline' : 'add-circle-outline')) as any}
                      size={18}
                      color={CATEGORY_CONFIG[categoryInput]?.color || colors.lavender}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base sm:text-lg font-black text-foreground">
                      {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                      Poste de dépense mensuelle récurrente
                    </Text>
                  </View>
                </View>

                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => setIsModalVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="w-8 h-8 rounded-full"
                  accessibilityLabel="Fermer la boîte de dialogue">
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Button>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-3 pb-2"
                bounces={false}>
                
                {/* CHAMP 1 : NOM */}
                <View className="gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-foreground">Nom de la charge</Text>
                    {iconInput && (
                      <Badge variant="outline" className="border-indigo-200 bg-indigo-50/70 px-1.5 py-0.5 rounded-full flex-row items-center gap-1">
                        <Ionicons name={iconInput as any} size={11} color={colors.lavender} />
                        <Text className="text-[10px] font-semibold text-lavender">
                          {editingItem ? (isIconManuallySelected ? 'Icône choisie' : 'Icône auto') : 'Icône auto'}
                        </Text>
                      </Badge>
                    )}
                  </View>
                  <Input
                    value={labelInput}
                    onChangeText={handleLabelChange}
                    placeholder="Ex: Loyer, EDF, Forfait internet, Netflix..."
                    placeholderTextColor={colors.textMuted}
                    className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                    autoFocus={!editingItem}
                  />
                </View>

                {/* CHAMP 2 : MONTANT */}
                <View className="gap-1">
                  <Text className="text-xs font-bold text-foreground">Montant mensuel (€)</Text>
                  <Input
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="decimal-pad"
                    placeholder="Ex: 85.00"
                    placeholderTextColor={colors.textMuted}
                    className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                  />
                </View>

                {/* EN MODE MODIFICATION : PERSONNALISATION DE LA CATÉGORIE ET DE L'ICÔNE */}
                {editingItem ? (
                  <>
                    {/* CHAMP 3 : CATÉGORIE */}
                    <View className="gap-1">
                      <Text className="text-xs font-bold text-foreground">Catégorie</Text>
                      <View className="flex-row flex-wrap gap-1.5">
                        {(Object.keys(CATEGORY_CONFIG) as FixedCategoryType[]).map((catKey) => {
                          const isSelected = categoryInput === catKey;
                          const c = CATEGORY_CONFIG[catKey];
                          return (
                            <TouchableOpacity
                              key={catKey}
                              onPress={() => handleSelectCategory(catKey)}
                              activeOpacity={0.7}
                              className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-border bg-muted/20'
                              }`}>
                              <Ionicons
                                name={c.icon as any}
                                size={14}
                                color={isSelected ? c.color : colors.textMuted}
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

                    {/* CHAMP : ICÔNE PERSONNALISÉE */}
                    <View className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-foreground">Icône personnalisée</Text>
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          Sélection manuelle
                        </Text>
                      </View>
                      <View className="flex-row gap-1.5 flex-wrap">
                        {FIXED_PRESET_ICONS.map((item) => {
                          const isSelected = iconInput === item.icon;
                          return (
                            <Button
                              key={item.icon}
                              variant="outline"
                              size="icon"
                              onPress={() => handleSelectIcon(item.icon)}
                              className={`w-9 h-9 rounded-xl ${
                                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-border bg-muted/20'
                              }`}>
                              <Ionicons
                                name={item.icon as any}
                                size={16}
                                color={isSelected ? colors.lavender : colors.textMuted}
                              />
                            </Button>
                          );
                        })}
                      </View>
                    </View>
                  </>
                ) : (
                  /* EN MODE CRÉATION : APERÇU CATÉGORIE & ICÔNE AUTOMATIQUES */
                  <View className="flex-row items-center bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200/80 gap-3">
                    <View
                      className="w-10 h-10 rounded-xl justify-center items-center shrink-0 border"
                      style={{
                        backgroundColor: CATEGORY_CONFIG[categoryInput]?.bg || '#f3eef8',
                        borderColor: `${CATEGORY_CONFIG[categoryInput]?.color || colors.lavender}40`,
                      }}>
                      <Ionicons
                        name={(iconInput || CATEGORY_CONFIG[categoryInput]?.icon || 'receipt-outline') as any}
                        size={18}
                        color={CATEGORY_CONFIG[categoryInput]?.color || colors.lavender}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-xs font-bold text-foreground">
                          {CATEGORY_CONFIG[categoryInput]?.label || 'Autres charges'}
                        </Text>
                        <Badge variant="outline" className="border-indigo-300 bg-white px-1.5 py-0.2 rounded-full">
                          <Text className="text-[9px] font-bold text-lavender">Auto</Text>
                        </Badge>
                      </View>
                      <Text className="text-[10px] text-muted-foreground mt-0.5">
                        Catégorie et icône choisies automatiquement selon le nom saisi.
                      </Text>
                    </View>
                  </View>
                )}

                {/* CHAMP 4 : OPTION CRÉDIT SUR DURÉE LIMITÉE */}
                <View className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-4 gap-2.5">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg justify-center items-center ${
                          isCreditInput ? 'bg-emerald-100' : 'bg-muted'
                        }`}>
                        <Ionicons
                          name={isCreditInput ? 'time' : 'time-outline'}
                          size={16}
                          color={isCreditInput ? colors.accent : colors.textMuted}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">
                          Crédit sur durée limitée
                        </Text>
                        <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
                          S&apos;enlève automatiquement une fois soldé
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsCreditInput((prev) => !prev)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isCreditInput }}
                      className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                        isCreditInput ? 'bg-accent items-end' : 'bg-slate-300 items-start'
                      }`}>
                      <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </TouchableOpacity>
                  </View>

                  {isCreditInput && (
                    <View className="gap-2.5 pt-2 border-t border-border">
                      <Text className="text-[11px] font-bold text-foreground">
                        Durée de remboursement
                      </Text>
                      <View className="flex-row flex-wrap gap-1">
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
                              className={`px-2 py-0.5 rounded-lg h-7 ${
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

                      <View className="flex-row gap-2.5">
                        <View className="flex-1 gap-1">
                          <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                            Mois totaux
                          </Text>
                          <Input
                            value={durationInput}
                            onChangeText={setDurationInput}
                            keyboardType="number-pad"
                            placeholder="12"
                            placeholderTextColor={colors.textMuted}
                            className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                          />
                        </View>

                        <View className="flex-1 gap-1">
                          <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                            Mois déjà payés
                          </Text>
                          <Input
                            value={paidMonthsInput}
                            onChangeText={setPaidMonthsInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                            className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                          />
                        </View>
                      </View>

                      {/* Aperçu direct */}
                      <View className="bg-card rounded-xl p-2.5 border border-border gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-[11px] text-muted-foreground">Mensualité :</Text>
                          <Text className="text-[11px] font-bold text-foreground">
                            {formatEuro(parsedAmountForCredit)} / mois
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[11px] text-muted-foreground">Restantes :</Text>
                          <Text className="text-[11px] font-bold text-foreground">
                            {remainingMonthsPreview} sur {parsedDurationForCredit} mois
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[11px] text-muted-foreground">Solde dû :</Text>
                          <Text className="text-[11px] font-extrabold text-danger">
                            {formatEuro(remainingCostCreditPreview)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[11px] text-muted-foreground">Fin estimée :</Text>
                          <Text className="text-[11px] font-extrabold text-accentDark">
                            {remainingMonthsPreview === 0 ? 'Soldé' : estimatedEndDatePreview}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* CHAMP 5 : OPTION MOIS D'ACTIVATION */}
                <View className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-4 gap-2.5">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg justify-center items-center ${
                          isScheduledInput ? 'bg-indigo-100' : 'bg-muted'
                        }`}>
                        <Ionicons
                          name={isScheduledInput ? 'calendar' : 'calendar-outline'}
                          size={16}
                          color={isScheduledInput ? colors.lavender : colors.textMuted}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">
                          Planifier l&apos;activation
                        </Text>
                        <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
                          Démarrer plus tard ou pour un mois donné
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsScheduledInput((prev) => !prev)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isScheduledInput }}
                      className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                        isScheduledInput ? 'bg-lavender items-end' : 'bg-slate-300 items-start'
                      }`}>
                      <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </TouchableOpacity>
                  </View>

                  {isScheduledInput && (
                    <View className="gap-2.5 pt-2 border-t border-border">
                      <Text className="text-[11px] font-bold text-foreground">Mode d&apos;application</Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setActivationTypeInput('starting_from')}
                          className={`flex-1 p-2 rounded-xl border ${
                            activationTypeInput === 'starting_from'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-border bg-card'
                          }`}>
                          <View className="flex-row items-center gap-1.5 mb-0.5">
                            <Ionicons
                              name="arrow-forward-circle-outline"
                              size={14}
                              color={activationTypeInput === 'starting_from' ? colors.lavender : colors.textMuted}
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
                            Démarre et continue
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setActivationTypeInput('only_month')}
                          className={`flex-1 p-2 rounded-xl border ${
                            activationTypeInput === 'only_month'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-border bg-card'
                          }`}>
                          <View className="flex-row items-center gap-1.5 mb-0.5">
                            <Ionicons
                              name="stopwatch-outline"
                              size={14}
                              color={activationTypeInput === 'only_month' ? colors.lavender : colors.textMuted}
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
                            Ce mois spécifique
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Présélections mois */}
                      <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                        Sélection rapide
                      </Text>
                      <View className="flex-row flex-wrap gap-1">
                        {monthPresets.map((preset) => {
                          const isSelected = targetMonthInput === preset.value;
                          return (
                            <Button
                              key={preset.value}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onPress={() => setTargetMonthInput(preset.value)}
                              className={`px-2 py-0.5 rounded-lg h-7 ${
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
                        <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                          Mois cible (AAAA-MM)
                        </Text>
                        <Input
                          value={targetMonthInput}
                          onChangeText={setTargetMonthInput}
                          placeholder={currentMonthStr}
                          placeholderTextColor={colors.textMuted}
                          maxLength={7}
                          className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                        />
                      </View>

                      {/* Aperçu statut planification */}
                      <View className="bg-card rounded-xl p-2.5 border border-border gap-1">
                        <View className="flex-row justify-between items-center">
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0.5 rounded ${
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
                          <Text className="text-[11px] font-bold text-muted-foreground">
                            {formatMonthYearFull(targetMonthInput)}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
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
                  className="rounded-xl px-3.5 py-2 h-auto">
                  <Text className="text-xs font-bold text-foreground">Annuler</Text>
                </Button>

                <Button
                  onPress={handleSave}
                  disabled={isSaving}
                  className={`bg-primary rounded-xl px-4 py-2 gap-1.5 h-auto ${
                    isSaving ? 'opacity-80' : ''
                  }`}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" className="mr-1" />
                  ) : (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                  <Text className="text-xs font-bold text-white">
                    {isSaving ? 'Enregistrement...' : editingItem ? 'Enregistrer' : 'Ajouter'}
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
