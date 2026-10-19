import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppDialog } from '@/components/confirm-dialog';
import { HomeSkeleton } from '@/components/ui/loading-state';
import { useHomeSummary } from '@/hooks/use-home-summary';
import { FixedExpensesMonthSelector } from '@/components/fixed-expenses/fixed-expenses-month-selector';
import {
  HomeHeader,
  HomeBalanceCard,
  HomeAccountsCard,
  HomeIncomeCard,
  HomeShortcuts,
} from '@/components/home';

export default function HomeScreen() {
  const {
    isLoading,
    isPrivate,
    incomeInput,
    // Données de simulation du mois sélectionné
    selectedSimulationMonth,
    selectedMonthOffset,
    isSimulating,
    simulationPresets,
    selectedMonthFormatted,
    simulatedTotalFixedExpenses,
    simulatedResteAVivre,
    simulatedEpargneAmount,
    simulatedCheckingAmount,
    differenceResteAVivre,
    // Handlers navigation temporelle
    handleSelectSimulationMonth,
    handleNextSimulationMonth,
    handlePrevSimulationMonth,
    handleResetToCurrentMonth,
    // Dialogs & inputs
    infoDialog,
    setInfoDialog,
    setLocalIncome,
    handleBlurIncome,
    togglePrivate,
    renderMoney,
    renderMoneyRound,
  } = useHomeSummary();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-[120px] w-full max-w-[860px] self-center">

          {/* 1. TOP BAR SUR FOND BLEU NUIT AVEC INDICATEUR DU MOIS */}
          <HomeHeader
            isPrivate={isPrivate}
            selectedMonthFormatted={selectedMonthFormatted}
            isSimulating={isSimulating}
            simulationOffset={selectedMonthOffset}
            onTogglePrivate={togglePrivate}
            onOpenInfo={() =>
              setInfoDialog({
                visible: true,
                title: 'Bienvenue sur Klyro',
                message:
                  'Votre application de gestion budgétaire épurée inspirée du design fintech contemporain.',
                subtext:
                  'Visualisez votre solde total, vos jauges de dépenses et vos transactions en temps réel.',
              })
            }
          />

          {/* CONTENU PRINCIPAL DÉCALÉ VERS LE HAUT SUR LE BANDEAU BLEU NUIT */}
          <View className="px-3.5 sm:px-4 -mt-5 gap-3.5 sm:gap-4">
            {/* 2. SÉLECTEUR & SIMULATEUR DE MOIS AVANCÉ */}
            <FixedExpensesMonthSelector
              selectedMonthStr={selectedSimulationMonth}
              selectedMonthOffset={selectedMonthOffset}
              selectedMonthFormatted={selectedMonthFormatted}
              isSimulating={isSimulating}
              simulationPresets={simulationPresets}
              differenceWithCurrentMonth={differenceResteAVivre}
              impactType="resteAVivre"
              onSelectMonth={handleSelectSimulationMonth}
              onNextMonth={handleNextSimulationMonth}
              onPrevMonth={handlePrevSimulationMonth}
              onResetToCurrentMonth={handleResetToCurrentMonth}
            />

            {/* 3. CARTE HÉROS DU RESTE À VIVRE (DYNAMIQUE SELON LE MOIS CHOISI) */}
            <HomeBalanceCard
              resteAVivreFormatted={renderMoney(simulatedResteAVivre)}
              resteAVivreRoundFormatted={renderMoneyRound(simulatedResteAVivre)}
              isSimulating={isSimulating}
              selectedMonthLabel={isSimulating ? `M+${selectedMonthOffset}` : undefined}
              onNavigateDetails={() => router.push('/details')}
              onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
            />

            {/* 4. DUO DES 2 COMPTES : COURANT & ÉPARGNE */}
            <HomeAccountsCard
              checkingFormatted={renderMoney(simulatedCheckingAmount)}
              checkingRoundFormatted={renderMoneyRound(simulatedCheckingAmount)}
              epargneFormatted={renderMoney(simulatedEpargneAmount)}
              epargneRoundFormatted={renderMoneyRound(simulatedEpargneAmount)}
            />

            {/* 5. ÉDITION DIRECTE DU REVENU */}
            <HomeIncomeCard
              incomeInput={incomeInput}
              onIncomeChange={setLocalIncome}
              onIncomeBlur={handleBlurIncome}
              onSubmitEditing={handleBlurIncome}
            />

            {/* 6. RACCOURCIS RAPIDES VERS LES AUTRES ÉCRANS */}
            <HomeShortcuts
              fixedExpensesFormatted={renderMoney(simulatedTotalFixedExpenses)}
              fixedExpensesRoundFormatted={renderMoneyRound(simulatedTotalFixedExpenses)}
              isSimulating={isSimulating}
              onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
              onNavigateVariableExpenses={() => router.push('/variable-expenses')}
              onNavigateDetails={() => router.push('/details')}
            />
          </View>
        </ScrollView>
      )}

      {/* POP-UP PÉDAGOGIQUE */}
      {infoDialog && (
        <AppDialog
          visible={infoDialog.visible}
          type="info"
          title={infoDialog.title}
          message={infoDialog.message}
          subtext={infoDialog.subtext}
          confirmLabel="J'ai compris"
          onConfirm={() => setInfoDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}
