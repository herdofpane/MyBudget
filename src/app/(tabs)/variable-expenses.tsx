import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppDialog, ConfirmDialog } from '@/components/confirm-dialog';
import { NavigationHeader } from '@/components/navigation-header';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/loading-state';
import { Text } from '@/components/ui/text';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

import {
  useVariableExpenses,
  VariableExpenseModal,
  VariableExpenseRow,
  VariableExpensesEmpty,
} from '@/features/variable-expenses';

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
          contentContainerClassName="pb-[120px] w-full max-w-[800px] self-center px-3.5 sm:px-6 pt-2">
          {/* CARTE UNIQUE UNIFIÉE DU TABLEAU (APPLE HIG INSET GROUPED) */}
          <View className="bg-card rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* 1. LIGNE DU TOTAL DES CHARGES VARIABLES ET STATS */}
            <View className="flex-row justify-between items-center px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-card">
              <View className="flex-1 min-w-[130px]">
                <View className="flex-row items-center gap-1.5 flex-wrap">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    TOTAL CHARGES VARIABLES
                  </Text>
                  <Badge variant="outline" className="bg-amber-50 border-amber-200 px-1.5 py-0 rounded-full">
                    <Text className="text-[9px] font-bold text-amber-800">
                      {variableCategories.length} poste{variableCategories.length > 1 ? 's' : ''}
                    </Text>
                  </Badge>
                </View>
                <View className="flex-row items-baseline gap-1.5 mt-0.5">
                  <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
                    {formatEuroRound(totalEstimatedVariable)}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-400">
                    ({formatEuro(totalEstimatedVariable)} / mois)
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
                    {formatPercent(variableExpenseRatio)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. LIGNE DES TITRES DE COLONNES DU TABLEAU */}
            {variableCategories.length > 0 && (
              <View className="flex-row items-center px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-100">
                <Text className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  POSTE & DURÉE
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">
                  MONTANT (LISSÉ)
                </Text>
                <Text className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  ACTIONS
                </Text>
              </View>
            )}

            {/* 3. LIGNES DU TABLEAU */}
            {variableCategories.length === 0 ? (
              <View className="p-4">
                <VariableExpensesEmpty onAdd={openAddModal} />
              </View>
            ) : (
              variableCategories.map((item, index) => (
                <VariableExpenseRow
                  key={item.id}
                  item={item}
                  isEven={index % 2 === 0}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))
            )}
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
