import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { AppDialog } from '@/components/confirm-dialog';
import { DetailsSkeleton } from '@/components/ui/loading-state';
import { formatEuro } from '@/constants/formatters';

import {
  useDetailsSimulation,
  SimulationTabs,
  SimulationSummaryCard,
  SimulationControlsCard,
} from '@/features/simulation';

export default function DetailsScreen() {
  const {
    budget,
    totalFixedExpenses,
    totalEstimatedVariable,
    isNecessaryModifiedFromDefault,
    resetMonthlyNecessaryToDefault,
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']} style={{ flex: 1, minHeight: 0 }}>
      <StatusBar style="light" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ UNIFIÉ */}
      <NavigationHeader
        title="Calcul & Détails"
        subtitle="SIMULATION & PRÉVOYANCE"
        icon="calculator-outline"
        actionButton={
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setShowResetDialog(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser les paramètres par défaut"
            className="flex-row items-center gap-1 bg-white/15 px-3 py-1.5 min-h-[34px] rounded-full shadow-xs active:bg-white/25">
            <Ionicons name="refresh-outline" size={15} color="#ffffff" />
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Défaut</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <DetailsSkeleton />
      ) : (
        <View
          style={{ flex: 1, minHeight: 0 }}
          className="w-full max-w-[800px] self-center px-3.5 sm:px-6 pt-2 pb-[98px] gap-2.5 justify-evenly overflow-hidden">
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
            totalEstimatedVariable={totalEstimatedVariable}
            isNecessaryModifiedFromDefault={isNecessaryModifiedFromDefault}
            monthlyNecessaryInput={monthlyNecessaryInput}
            oneTimeAmountInput={oneTimeAmountInput}
            oneTimeNecessaryInput={oneTimeNecessaryInput}
            isSaving={isSaving}
            onReset={() => setShowResetDialog(true)}
            onNavigateHome={() => router.push('/')}
            onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
            onNavigateVariableExpenses={() => router.push('/variable-expenses')}
            onChangeMonthlyNecessary={setOverrideMonthlyNecessary}
            onResetMonthlyNecessaryToDefault={resetMonthlyNecessaryToDefault}
            onChangeOneTimeAmount={setOverrideOneTimeAmount}
            onChangeOneTimeNecessary={setOverrideOneTimeNecessary}
            onApplyBudget={handleApplyBudget}
          />
        </View>
      )}

      {/* POP-UP CONFIRMATION DE RÉINITIALISATION */}
      <AppDialog
        visible={showResetDialog}
        type="warning"
        title="Restaurer le tableur standard ?"
        message={
          isMonthly
            ? `Cela réinitialisera le Seuil nécessaire au montant par défaut (${formatEuro(totalEstimatedVariable)}, égal à vos charges variables).`
            : 'Cela réinitialisera le Revenu ponctuel et son Seuil nécessaire à 0 €.'
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
