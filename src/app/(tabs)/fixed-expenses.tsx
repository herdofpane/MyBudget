import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/navigation-header';
import { ConfirmDialog, AppDialog } from '@/components/confirm-dialog';
import { ListSkeleton } from '@/components/ui/loading-state';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

import {
  useFixedExpenses,
  FixedExpenseRow,
  FixedExpensesEmpty,
  FixedExpenseModal,
  FixedExpensesMonthSelector,
} from '@/features/fixed-expenses';

export default function FixedExpensesScreen() {
  const {
    fixedExpensesList,
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
    handleLabelChange,
    iconInput,
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
    handleSave,
    handleAdvanceMonth,
    handleDelete,
    handleConfirmDelete,
    activeFixedExpenses,
    expiredCreditsCount,
    upcomingChargesCount,
    averageExpense,
    parsedAmountForCredit,
    parsedMonthlyAmountForCredit,
    parsedDurationForCredit,
    remainingMonthsPreview,
    remainingCostCreditPreview,
    estimatedEndDatePreview,
    targetMonthPreviewStatus,
  } = useFixedExpenses();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ UNIFIÉ */}
      <NavigationHeader
        title="Charges Fixes"
        subtitle="BUDGET RÉCURRENT"
        icon="calendar-outline"
        actionButton={
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={openAddModal}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Ajouter une charge fixe"
            className="flex-row items-center gap-1 bg-accent px-3 py-1.5 min-h-[34px] rounded-full shadow-xs active:bg-accentDark">
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Ajouter</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <View className="flex-1 w-full max-w-[800px] self-center px-3.5 sm:px-6 pt-2 pb-[98px] gap-2">
          {/* 1. SÉLECTEUR DE SIMULATION MENSUELLE COMPACT */}
          <FixedExpensesMonthSelector
            selectedMonthStr={selectedMonthStr}
            selectedMonthOffset={selectedMonthOffset}
            selectedMonthFormatted={selectedMonthFormatted}
            isSimulating={isSimulating}
            simulationPresets={simulationPresets}
            differenceWithCurrentMonth={differenceWithCurrentMonth}
            onSelectMonth={handleSelectSimulationMonth}
            onNextMonth={handleNextSimulationMonth}
            onPrevMonth={handlePrevSimulationMonth}
            onResetToCurrentMonth={handleResetToCurrentMonth}
          />

          {/* 2. EN-TÊTE FIXE DU TABLEAU : TOTAL & TITRES DE COLONNES (TOUJOURS VISIBLES) */}
          <View className="bg-card rounded-t-2xl sm:rounded-t-3xl border-t border-x border-slate-200/90 shadow-xs overflow-hidden shrink-0">
            {/* LIGNE DU TOTAL DES CHARGES ET STATS */}
            <View className="flex-row justify-between items-center px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-card">
              <View className="flex-1 min-w-[140px]">
                <View className="flex-row items-center gap-1.5 flex-wrap">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {isSimulating ? `TOTAL • ${selectedMonthShort}` : 'TOTAL CHARGES FIXES'}
                  </Text>
                  <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-1.5 py-0 rounded-full">
                    <Text className="text-[9px] font-bold text-lavender">
                      {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    </Text>
                  </Badge>
                  {expiredCreditsCount > 0 && (
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-1.5 py-0 rounded-full">
                      <Text className="text-[9px] font-bold text-emerald-800">
                        {expiredCreditsCount} soldé{expiredCreditsCount > 1 ? 's' : ''}
                      </Text>
                    </Badge>
                  )}
                  {upcomingChargesCount > 0 && (
                    <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-1.5 py-0 rounded-full">
                      <Text className="text-[9px] font-bold text-lavender">
                        {upcomingChargesCount} à venir
                      </Text>
                    </Badge>
                  )}
                </View>
                <View className="flex-row items-baseline gap-2 mt-0.5">
                  <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
                    {formatEuroRound(simulatedTotalFixedExpenses)}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-400">
                    ({formatEuro(simulatedTotalFixedExpenses)})
                  </Text>
                </View>
              </View>

              {/* STATISTIQUES COMPACTES (MOYENNE & REVENUS) */}
              <View className="flex-row items-center bg-slate-100/80 rounded-xl px-2.5 py-1.5 border border-slate-200/70 gap-2.5">
                <View className="items-center">
                  <Text className="text-[8px] sm:text-[9px] text-slate-500 font-semibold uppercase">Moyenne</Text>
                  <Text className="text-[11px] sm:text-xs font-black text-slate-900">
                    ~{formatEuroRound(averageExpense)}
                  </Text>
                </View>
                <View className="w-px h-5 bg-slate-200" />
                <View className="items-center">
                  <Text className="text-[8px] sm:text-[9px] text-slate-500 font-semibold uppercase">Revenus</Text>
                  <Text className="text-[11px] sm:text-xs font-black text-slate-900">
                    {formatPercent(fixedExpenseRatio)}
                  </Text>
                </View>
              </View>
            </View>

            {/* LIGNE DES TITRES DE COLONNES DU TABLEAU (TOUJOURS VISIBLES) */}
            {fixedExpensesList.length > 0 && (
              <View className="flex-row items-center px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-100">
                <Text className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  POSTE DE CHARGE
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">
                  MONTANT
                </Text>
                <Text className="w-20 sm:w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  ACTIONS
                </Text>
              </View>
            )}
          </View>

          {/* 3. CORPS DU TABLEAU : DÉFILEMENT FLUIDE SUR PLUSIEURS PAGES */}
          {fixedExpensesList.length === 0 ? (
            <View className="bg-card rounded-b-2xl sm:rounded-b-3xl border-b border-x border-slate-200/90 shadow-sm p-4">
              <FixedExpensesEmpty onAdd={openAddModal} />
            </View>
          ) : (
            <View className="flex-1 bg-card rounded-b-2xl sm:rounded-b-3xl border-b border-x border-slate-200/90 shadow-sm overflow-hidden min-h-0">
              <ScrollView
                className="flex-1"
                bounces={true}
                showsVerticalScrollIndicator={true}
                contentContainerClassName="pb-4">
                {fixedExpensesList.map((item, index) => (
                  <FixedExpenseRow
                    key={item.id}
                    item={item}
                    isEven={index % 2 === 0}
                    currentMonthStr={selectedMonthStr}
                    baseMonthStr={currentMonthStr}
                    onAdvanceMonth={handleAdvanceMonth}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION D'UNE CHARGE FIXE */}
      <FixedExpenseModal
        visible={isModalVisible}
        editingItem={editingItem}
        isSaving={isSaving}
        labelInput={labelInput}
        amountInput={amountInput}
        categoryInput={categoryInput}
        iconInput={iconInput}
        isCreditInput={isCreditInput}
        durationInput={durationInput}
        paidMonthsInput={paidMonthsInput}
        isScheduledInput={isScheduledInput}
        activationTypeInput={activationTypeInput}
        targetMonthInput={targetMonthInput}
        currentMonthStr={currentMonthStr}
        monthPresets={monthPresets}
        parsedAmountForCredit={parsedAmountForCredit}
        parsedMonthlyAmountForCredit={parsedMonthlyAmountForCredit}
        parsedDurationForCredit={parsedDurationForCredit}
        remainingMonthsPreview={remainingMonthsPreview}
        remainingCostCreditPreview={remainingCostCreditPreview}
        estimatedEndDatePreview={estimatedEndDatePreview}
        targetMonthPreviewStatus={targetMonthPreviewStatus}
        onLabelChange={handleLabelChange}
        onAmountChange={setAmountInput}
        onToggleCredit={() => setIsCreditInput((prev) => !prev)}
        onDurationChange={setDurationInput}
        onPaidMonthsChange={setPaidMonthsInput}
        onToggleScheduled={() => setIsScheduledInput((prev) => !prev)}
        onActivationTypeChange={setActivationTypeInput}
        onTargetMonthChange={setTargetMonthInput}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSave}
      />

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
