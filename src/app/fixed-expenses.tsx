import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { ConfirmDialog, AppDialog } from '@/components/confirm-dialog';
import { ListSkeleton } from '@/components/ui/loading-state';
import { colors } from '@/theme/colors';
import { formatEuro, formatEuroRound } from '@/constants/formatters';

import { useFixedExpenses } from '@/hooks/use-fixed-expenses';
import {
  FixedExpensesStats,
  FixedExpenseRow,
  FixedExpensesEmpty,
  FixedExpenseModal,
} from '@/components/fixed-expenses';

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

          {/* 1. CARTE DU TOTAL DES CHARGES FIXES & STATS */}
          <FixedExpensesStats
            totalFixedExpenses={totalFixedExpenses}
            activeCount={activeFixedExpenses.length}
            expiredCreditsCount={expiredCreditsCount}
            upcomingChargesCount={upcomingChargesCount}
            averageExpense={averageExpense}
            fixedExpenseRatio={fixedExpenseRatio}
          />

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
              <FixedExpensesEmpty onAdd={openAddModal} />
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
                {fixedExpensesList.map((item, index) => (
                  <FixedExpenseRow
                    key={item.id}
                    item={item}
                    isEven={index % 2 === 0}
                    currentMonthStr={currentMonthStr}
                    onAdvanceMonth={handleAdvanceMonth}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}

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
