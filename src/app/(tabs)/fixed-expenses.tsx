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
            className="flex-row items-center gap-1.5 bg-accent px-3.5 py-2 min-h-[38px] rounded-full shadow-xs active:bg-accentDark">
            <Ionicons name="add" size={17} color="#ffffff" />
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Ajouter</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          bounces={true}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={fixedExpensesList.length > 0 ? [1] : undefined}
          contentContainerClassName="pb-[120px] w-full max-w-[800px] self-center">
          {/* 1. SECTION SUPÉRIEURE : SÉLECTEUR DE MOIS & STATISTIQUES */}
          <View className="px-4 sm:px-6 pt-3.5 gap-3.5 sm:gap-4 mb-3.5 sm:mb-4">
            {/* SÉLECTEUR DE SIMULATION MENSUELLE (APPLE STEPPER) */}
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

            {/* CARTE DU TOTAL DES CHARGES FIXES & STATS (APPLE METRICS CARD) */}
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
          </View>

          {/* 2. EN-TÊTE FIXE DU TABLEAU (TITRE & COLONNES TOUJOURS VISIBLES AU DÉFILEMENT) */}
          <View
            style={{ elevation: 4 }}
            className="w-full max-w-[800px] self-center px-4 sm:px-6 pt-1 bg-background z-20">
            <View className={`bg-card ${fixedExpensesList.length > 0 ? 'rounded-t-3xl border-t' : 'rounded-3xl border'} border-x border-slate-200/90 shadow-xs overflow-hidden`}>
              {/* EN-TÊTE DU TABLEAU AVEC TITRE ET ACTION */}
              <View className="flex-row justify-between items-center p-4 sm:p-5 border-b border-slate-100 bg-card">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 justify-center items-center shrink-0">
                    <Ionicons name="receipt-outline" size={19} color={colors.lavender} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {isSimulating
                        ? `Charges actives en ${selectedMonthShort}`
                        : 'Charges fixes & abonnements'}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
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
                  className="border border-indigo-300/80 bg-indigo-50/80 flex-row items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] active:bg-indigo-100 shrink-0 shadow-2xs">
                  <Ionicons name="add-circle" size={16} color={colors.lavender} />
                  <Text className="text-xs font-bold text-lavender">Ajouter</Text>
                </TouchableOpacity>
              </View>

              {fixedExpensesList.length === 0 ? (
                <FixedExpensesEmpty onAdd={openAddModal} />
              ) : (
                /* LIGNE DES TITRES DE COLONNES DU TABLEAU (STICKY) */
                <View className="flex-row items-center px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <Text className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    POSTE DE CHARGE
                  </Text>
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">
                    MONTANT
                  </Text>
                  <Text className="w-20 sm:w-24 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    ACTIONS
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 3. CORPS DU TABLEAU : LIGNES DÉFILABLES ET TOTAL */}
          {fixedExpensesList.length > 0 ? (
            <View className="w-full max-w-[800px] self-center px-4 sm:px-6">
              <View className="bg-card rounded-b-3xl border-b border-x border-slate-200/90 shadow-sm overflow-hidden">
                {/* LIGNES DES CHARGES */}
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

                {/* PIED DU TABLEAU : TOTAL ARRONDI */}
                <View className="flex-row justify-between items-center px-4 sm:px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                  <View>
                    <Text className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      TOTAL DES CHARGES {isSimulating ? `(${selectedMonthShort})` : ''}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      Arrondi unité • {activeFixedExpenses.length} active{activeFixedExpenses.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {formatEuroRound(simulatedTotalFixedExpenses)}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400 mt-0.5">
                      Exact : {formatEuro(simulatedTotalFixedExpenses)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
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
        monthPresets={monthPresets}
        currentMonthStr={currentMonthStr}
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
