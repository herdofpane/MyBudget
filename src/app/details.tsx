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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
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
            className="flex-row items-center gap-1.5 bg-white/15 px-3.5 py-2 min-h-[38px] rounded-full shadow-xs active:bg-white/25">
            <Ionicons name="refresh-outline" size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Défaut</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <DetailsSkeleton />
      ) : (
        <ScrollView
          bounces={true}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-[120px] w-full max-w-[800px] self-center">
          <View className="px-4 sm:px-6 pt-3.5 gap-3.5 sm:gap-4">

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

          {/* 4. LIENS RAPIDES VERS LES CHARGES */}
          <View className="gap-2.5">
            {/* LIEN CHARGES FIXES */}
            <TouchableOpacity
              onPress={() => router.push('/fixed-expenses')}
              activeOpacity={0.6}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Gérer mes charges fixes"
              className="flex-row items-center justify-between bg-card rounded-2xl p-3.5 sm:p-4 border border-border shadow-xs active:bg-slate-50 min-h-[58px]">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                  <Ionicons name="calendar-outline" size={19} color={colors.lavender} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-foreground">Gérer mes charges fixes</Text>
                  <Text className="text-[11px] text-muted-foreground">{formatEuro(totalFixedExpenses)} / mois</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </TouchableOpacity>

            {/* LIEN CHARGES VARIABLES */}
            <TouchableOpacity
              onPress={() => router.push('/variable-expenses')}
              activeOpacity={0.6}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Gérer mes charges variables"
              className="flex-row items-center justify-between bg-card rounded-2xl p-3.5 sm:p-4 border border-border shadow-xs active:bg-slate-50 min-h-[58px]">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 justify-center items-center">
                  <Ionicons name="pie-chart-outline" size={19} color="#D97706" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-foreground">Gérer mes charges variables</Text>
                  <Text className="text-[11px] text-muted-foreground">{formatEuro(totalEstimatedVariable)} / mois</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
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
