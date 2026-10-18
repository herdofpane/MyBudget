import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { AppDialog } from '@/components/confirm-dialog';
import { DetailsSkeleton } from '@/components/ui/loading-state';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';
import {
  DEFAULT_TARGET_NECESSARY,
  DEFAULT_ONE_TIME_AMOUNT,
  DEFAULT_ONE_TIME_NECESSARY,
} from '@/data';

import { useDetailsSimulation } from '@/hooks/use-details-simulation';
import {
  SimulationTabs,
  SimulationSummaryCard,
  SimulationControlsCard,
} from '@/components/details';

export default function DetailsScreen() {
  const {
    budget,
    totalFixedExpenses,
    isLoading,
    isSaving,
    setActiveTab,
    feedbackDialog,
    setFeedbackDialog,
    showResetDialog,
    setShowResetDialog,
    setOverrideMonthlyNecessary,
    setOverrideOneTimeAmount,
    setOverrideOneTimeNecessary,
    monthlyNecessaryInput,
    oneTimeAmountInput,
    oneTimeNecessaryInput,
    parsedMonthlyFixed,
    monthlyResteAVivre,
    isMonthly,
    currentIncome,
    currentNecessary,
    currentEpargne,
    currentChecking,
    currentBaseResteAVivre,
    handleApplyBudget,
    executeReset,
  } = useDetailsSimulation();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL */}
      <NavigationHeader
        title="Calcul & Détails"
        subtitle="RÉPARTITION NÉCESSAIRE, FACULTATIF & ÉPARGNE"
      />

      {isLoading ? (
        <DetailsSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-3.5 sm:px-4 pt-1.5 pb-[115px] gap-3.5 sm:gap-4 w-full max-w-[860px] self-center">

          {/* 1. SÉLECTEUR D'ONGLET : MENSUELLE vs REVENU PONCTUEL */}
          <SimulationTabs
            isMonthly={isMonthly}
            onSelectTab={setActiveTab}
          />

          {/* 2. RÉSULTAT DU CALCUL (BILAN DE SYNTHÈSE DU TABLEUR) */}
          <SimulationSummaryCard
            isMonthly={isMonthly}
            currentIncome={currentIncome}
            parsedMonthlyFixed={parsedMonthlyFixed}
            monthlyResteAVivre={monthlyResteAVivre}
            currentChecking={currentChecking}
            currentEpargne={currentEpargne}
            currentNecessary={currentNecessary}
            currentBaseResteAVivre={currentBaseResteAVivre}
          />

          {/* 3. ZONE POUR MODIFIER LE CALCUL (CHAMPS INTERACTIFS) */}
          <SimulationControlsCard
            isMonthly={isMonthly}
            income={budget.income}
            totalFixedExpenses={totalFixedExpenses}
            monthlyNecessaryInput={monthlyNecessaryInput}
            oneTimeAmountInput={oneTimeAmountInput}
            oneTimeNecessaryInput={oneTimeNecessaryInput}
            isSaving={isSaving}
            onReset={() => setShowResetDialog(true)}
            onNavigateHome={() => router.push('/')}
            onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
            onChangeMonthlyNecessary={setOverrideMonthlyNecessary}
            onChangeOneTimeAmount={setOverrideOneTimeAmount}
            onChangeOneTimeNecessary={setOverrideOneTimeNecessary}
            onApplyBudget={handleApplyBudget}
          />

          {/* 4. LIEN VERS CHARGES FIXES */}
          <TouchableOpacity
            onPress={() => router.push('/fixed-expenses')}
            activeOpacity={0.8}
            className="flex-row items-center justify-between bg-card rounded-2xl p-3.5 sm:p-4 border border-border shadow-xs">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                <Ionicons name="calendar-outline" size={18} color={colors.lavender} />
              </View>
              <Text className="text-sm font-bold text-foreground">Gérer mes charges fixes</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* POP-UP CONFIRMATION DE RÉINITIALISATION */}
      <AppDialog
        visible={showResetDialog}
        type="warning"
        title="Restaurer le tableur standard ?"
        message={
          isMonthly
            ? `Cela réinitialisera le Seuil nécessaire au montant par défaut (${formatEuro(DEFAULT_TARGET_NECESSARY)}).`
            : `Cela réinitialisera le Revenu ponctuel (${formatEuro(DEFAULT_ONE_TIME_AMOUNT)}) et le Seuil nécessaire (${formatEuro(DEFAULT_ONE_TIME_NECESSARY)}).`
        }
        subtext="Vos modifications non appliquées seront perdues."
        confirmLabel="Restaurer"
        cancelLabel="Annuler"
        onConfirm={executeReset}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* POP-UP DE RÉSULTAT / FEEDBACK */}
      {feedbackDialog && (
        <AppDialog
          visible={feedbackDialog.visible}
          type={feedbackDialog.type}
          title={feedbackDialog.title}
          message={feedbackDialog.message}
          subtext={feedbackDialog.subtext}
          confirmLabel="Parfait"
          onConfirm={() => setFeedbackDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}
