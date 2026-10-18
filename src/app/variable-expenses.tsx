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
import { formatEuro, formatEuroRound } from '@/constants/formatters';

import { useVariableExpenses } from '@/hooks/use-variable-expenses';
import {
  VariableExpensesStats,
  VariableExpenseRow,
  VariableExpensesEmpty,
  VariableExpenseModal,
} from '@/components/variable-expenses';

export default function VariableExpensesScreen() {
  const {
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
    labelInput,
    handleLabelChange,
    amountInput,
    setAmountInput,
    durationInput,
    setDurationInput,
    iconInput,
    colorInput,
    openAddModal,
    openEditModal,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    averageExpense,
    modalParsedAmount,
    modalParsedDuration,
    modalMonthlyImpact,
  } = useVariableExpenses();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ */}
      <NavigationHeader
        title="Charges Variables"
        subtitle="BUDGET COURANT"
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-3.5 sm:px-4 pt-1.5 pb-[115px] gap-3.5 sm:gap-4 w-full max-w-[860px] self-center">

          {/* 1. CARTE DU TOTAL DES CHARGES VARIABLES */}
          <VariableExpensesStats
            totalEstimatedVariable={totalEstimatedVariable}
            count={variableCategories.length}
            averageExpense={averageExpense}
            variableExpenseRatio={variableExpenseRatio}
          />

          {/* 2. LE TABLEAU DES CHARGES VARIABLES */}
          <Card className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* EN-TÊTE DE LA CARTE TABLEAU */}
            <View className="flex-row justify-between items-center p-4 sm:p-5 border-b border-border">
              <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 justify-center items-center shrink-0">
                  <Ionicons name="pie-chart-outline" size={18} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm sm:text-base font-bold text-foreground">
                    Charges variables & amortissements
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    {variableCategories.length} poste{variableCategories.length > 1 ? 's' : ''} lissé{variableCategories.length > 1 ? 's' : ''} sur la durée
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={openAddModal}
                className="border-amber-300 bg-amber-50 gap-1 rounded-xl h-8 px-2.5 shrink-0">
                <Ionicons name="add-circle" size={15} color="#D97706" />
                <Text className="text-xs font-bold text-amber-800">Ajouter</Text>
              </Button>
            </View>

            {variableCategories.length === 0 ? (
              <VariableExpensesEmpty onAdd={openAddModal} />
            ) : (
              <View>
                {/* LIGNE DES COLONNES DU TABLEAU */}
                <View className="flex-row items-center px-3.5 sm:px-4 py-2.5 bg-muted/40 border-b border-border">
                  <Text className="flex-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    POSTE & DURÉE
                  </Text>
                  <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-2">
                    MONTANT (LISSÉ)
                  </Text>
                  <Text className="w-16 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    ACTIONS
                  </Text>
                </View>

                {/* LIGNES DES CHARGES VARIABLES */}
                {variableCategories.map((item, index) => (
                  <VariableExpenseRow
                    key={item.id}
                    item={item}
                    isEven={index % 2 === 0}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}

                {/* PIED DU TABLEAU : TOTAL MENSUEL LISSÉ */}
                <View className="flex-row justify-between items-center px-4 sm:px-5 py-3.5 bg-muted/30 border-t border-border">
                  <View>
                    <Text className="text-xs font-black text-foreground uppercase tracking-wider">
                      TOTAL MENSUEL LISSÉ
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Arrondi unité • {variableCategories.length} charges
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg sm:text-xl font-black text-foreground">
                      {formatEuroRound(totalEstimatedVariable)}
                    </Text>
                    <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
                      Exact : {formatEuro(totalEstimatedVariable)} / mois
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </ScrollView>
      )}

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION D'UNE CHARGE VARIABLE */}
      <VariableExpenseModal
        visible={isModalVisible}
        editingCategory={editingCategory}
        isSaving={isSaving}
        labelInput={labelInput}
        amountInput={amountInput}
        durationInput={durationInput}
        iconInput={iconInput}
        colorInput={colorInput}
        modalParsedAmount={modalParsedAmount}
        modalParsedDuration={modalParsedDuration}
        modalMonthlyImpact={modalMonthlyImpact}
        onLabelChange={handleLabelChange}
        onAmountChange={setAmountInput}
        onDurationChange={setDurationInput}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSave}
      />

      {/* POPUP DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer la charge variable"
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
