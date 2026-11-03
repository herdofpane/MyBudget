import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { ConfirmDialog, AppDialog } from '@/components/confirm-dialog';
import { ListSkeleton } from '@/components/ui/loading-state';
import { colors } from '@/theme/colors';
import { formatEuro, formatEuroRound } from '@/constants/formatters';

import {
  useFixedExpenses,
  FixedExpensesStats,
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']} style={{ flex: 1, minHeight: 0 }}>
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
        <View
          style={{ flex: 1, minHeight: 0 }}
          className="w-full max-w-[800px] self-center px-3.5 sm:px-6 pt-2 pb-[98px] gap-2 overflow-hidden">
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

          {/* 2. CARTE DU TOTAL DES CHARGES FIXES & STATS COMPACTE */}
          <FixedExpensesStats
            totalFixedExpenses={simulatedTotalFixedExpenses}
            activeCount={activeFixedExpenses.length}
            expiredCreditsCount={expiredCreditsCount}
            upcomingChargesCount={upcomingChargesCount}
            averageExpense={averageExpense}
            fixedExpenseRatio={fixedExpenseRatio}
            isSimulating={isSimulating}
            selectedMonthLabel={selectedMonthShort}
          />

          {/* 3. TABLEAU FIXE SUR L'ÉCRAN (EN-TÊTE & COLONNES FIXES, LIGNES DÉFILABLES EN INTERNE) */}
          <View
            style={{ flex: 1, minHeight: 0 }}
            className="bg-card rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* EN-TÊTE DU TABLEAU (TOUJOURS VISIBLE) */}
            <View className="flex-row justify-between items-center px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-card shrink-0">
              <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                <View className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 justify-center items-center shrink-0">
                  <Ionicons name="receipt-outline" size={16} color={colors.lavender} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs sm:text-sm font-black text-slate-900 tracking-tight" numberOfLines={1}>
                    {isSimulating
                      ? `Charges actives en ${selectedMonthShort}`
                      : 'Charges fixes & abonnements'}
                  </Text>
                  <Text className="text-[11px] text-slate-400">
                    {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    {expiredCreditsCount > 0 && ` • ${expiredCreditsCount} soldé${expiredCreditsCount > 1 ? 's' : ''}`}
                    {upcomingChargesCount > 0 && ` • ${upcomingChargesCount} à venir`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={openAddModal}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Ajouter une charge"
                className="border border-indigo-300/80 bg-indigo-50/80 flex-row items-center gap-1 rounded-full px-2.5 py-1 min-h-[32px] active:bg-indigo-100 shrink-0">
                <Ionicons name="add-circle" size={14} color={colors.lavender} />
                <Text className="text-[11px] font-bold text-lavender">Ajouter</Text>
              </TouchableOpacity>
            </View>

            {fixedExpensesList.length === 0 ? (
              <ScrollView contentContainerClassName="flex-grow justify-center">
                <FixedExpensesEmpty onAdd={openAddModal} />
              </ScrollView>
            ) : (
              <View style={{ flex: 1, minHeight: 0 }}>
                {/* LIGNE DES TITRES DE COLONNES DU TABLEAU (TOUJOURS VISIBLE) */}
                <View className="flex-row items-center px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
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

                {/* LIGNES DES CHARGES (DÉFILEMENT INTERNE UNIQUEMENT) */}
                <ScrollView
                  style={{ flex: 1, minHeight: 0 }}
                  bounces={true}
                  showsVerticalScrollIndicator={true}>
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

                {/* PIED DU TABLEAU : TOTAL ARRONDI (TOUJOURS VISIBLE EN BAS DU TABLEAU) */}
                <View className="flex-row justify-between items-center px-3.5 sm:px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80 shrink-0">
                  <View>
                    <Text className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                      TOTAL DES CHARGES {isSimulating ? `(${selectedMonthShort})` : ''}
                    </Text>
                    <Text className="text-[10px] text-slate-400">
                      Arrondi unité • {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {formatEuroRound(simulatedTotalFixedExpenses)}
                    </Text>
                    <Text className="text-[11px] font-medium text-slate-400">
                      ({formatEuro(simulatedTotalFixedExpenses)})
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
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
