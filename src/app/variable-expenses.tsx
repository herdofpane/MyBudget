import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
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
      <StatusBar style="light" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ UNIFIÉ */}
      <NavigationHeader
        title="Charges Variables"
        subtitle="BUDGET COURANT & LISSAGE"
        icon="pie-chart-outline"
        actionButton={
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={openAddModal}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Ajouter une charge variable"
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
          contentContainerClassName="pb-[120px] w-full max-w-[800px] self-center">
          <View className="px-4 sm:px-6 pt-3.5 gap-3.5 sm:gap-4">

          {/* 1. CARTE DU TOTAL DES CHARGES VARIABLES */}
          <VariableExpensesStats
            totalEstimatedVariable={totalEstimatedVariable}
            count={variableCategories.length}
            averageExpense={averageExpense}
            variableExpenseRatio={variableExpenseRatio}
          />

          {/* 2. LE TABLEAU INSET GROUPED DES CHARGES VARIABLES */}
          <Card className="bg-card rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* EN-TÊTE DE LA CARTE TABLEAU */}
            <View className="flex-row justify-between items-center p-4 sm:p-5 border-b border-slate-100">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 justify-center items-center shrink-0">
                  <Ionicons name="pie-chart-outline" size={19} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Charges variables & amortissements
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {variableCategories.length} poste{variableCategories.length > 1 ? 's' : ''} lissé{variableCategories.length > 1 ? 's' : ''} sur la durée
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={openAddModal}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Ajouter une charge variable"
                className="border border-amber-300/80 bg-amber-50/80 flex-row items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] active:bg-amber-100 shrink-0 shadow-2xs">
                <Ionicons name="add-circle" size={16} color="#D97706" />
                <Text className="text-xs font-bold text-amber-800">Ajouter</Text>
              </TouchableOpacity>
            </View>

            {variableCategories.length === 0 ? (
              <VariableExpensesEmpty onAdd={openAddModal} />
            ) : (
              <View>
                {/* LIGNE DES COLONNES DU TABLEAU */}
                <View className="flex-row items-center px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                  <Text className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    POSTE & DURÉE
                  </Text>
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">
                    MONTANT (LISSÉ)
                  </Text>
                  <Text className="w-16 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
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
                <View className="flex-row justify-between items-center px-4 sm:px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                  <View>
                    <Text className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      TOTAL MENSUEL LISSÉ
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      Arrondi unité • {variableCategories.length} charge{variableCategories.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {formatEuroRound(totalEstimatedVariable)}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400 mt-0.5">
                      Exact : {formatEuro(totalEstimatedVariable)} / mois
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
          </View>
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
