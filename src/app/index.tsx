import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppDialog } from '@/components/confirm-dialog';
import { HomeSkeleton } from '@/components/ui/loading-state';
import { useHomeSummary } from '@/hooks/use-home-summary';
import {
  HomeHeader,
  HomeBalanceCard,
  HomeAccountsCard,
  HomeIncomeCard,
} from '@/components/home';

export default function HomeScreen() {
  const {
    isLoading,
    isPrivate,
    incomeInput,
    parsedIncome,
    simulatedTotalFixedExpenses,
    selectedMonthOffset,
    isSimulating,
    selectedMonthFormatted,
    simulatedResteAVivre,
    simulatedEpargneAmount,
    simulatedCheckingAmount,
    differenceResteAVivre,
    handleNextSimulationMonth,
    handlePrevSimulationMonth,
    handleResetToCurrentMonth,
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
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-between pb-[82px] w-full max-w-[860px] self-center">

          {/* 1. TOP BAR SUR FOND BLEU NUIT AVEC SÉLECTEUR DE MOIS INTÉGRÉ */}
          <HomeHeader
            isPrivate={isPrivate}
            selectedMonthFormatted={selectedMonthFormatted}
            selectedMonthOffset={selectedMonthOffset}
            isSimulating={isSimulating}
            differenceResteAVivre={differenceResteAVivre}
            onNextMonth={handleNextSimulationMonth}
            onPrevMonth={handlePrevSimulationMonth}
            onResetMonth={handleResetToCurrentMonth}
            onTogglePrivate={togglePrivate}
            onOpenInfo={() =>
              setInfoDialog({
                visible: true,
                title: 'Bienvenue sur FinTrack',
                message:
                  'Votre application de gestion budgétaire épurée inspirée du design fintech contemporain.',
                subtext:
                  'Visualisez votre solde disponible, simulez vos mois futurs et ventilez votre épargne en un coup d\'œil.',
              })
            }
          />

          {/* 2. CONTENU PRINCIPAL COMPACT TENANT SUR 1 SEUL ÉCRAN SANS DÉFILEMENT */}
          <View className="px-3.5 sm:px-4 -mt-3.5 gap-3 flex-1 justify-center py-1">
            {/* CARTE HÉROS DU RESTE À VIVRE (DYNAMIQUE SELON LE MOIS CHOISI) */}
            <HomeBalanceCard
              resteAVivreFormatted={renderMoney(simulatedResteAVivre)}
              resteAVivreRoundFormatted={renderMoneyRound(simulatedResteAVivre)}
              isSimulating={isSimulating}
              selectedMonthLabel={isSimulating ? `M+${selectedMonthOffset}` : undefined}
              income={parsedIncome}
              fixedExpenses={simulatedTotalFixedExpenses}
              epargne={simulatedEpargneAmount}
              onNavigateDetails={() => router.push('/details')}
              onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
            />

            {/* DUO DES 2 COMPTES : COURANT & ÉPARGNE (INTERACTIFS) */}
            <HomeAccountsCard
              checkingFormatted={renderMoney(simulatedCheckingAmount)}
              checkingRoundFormatted={renderMoneyRound(simulatedCheckingAmount)}
              epargneFormatted={renderMoney(simulatedEpargneAmount)}
              epargneRoundFormatted={renderMoneyRound(simulatedEpargneAmount)}
              onPressChecking={() => router.push('/variable-expenses')}
              onPressEpargne={() => router.push('/details')}
            />

            {/* ÉDITION DIRECTE DU REVENU (LIGNE COMPACTE) */}
            <HomeIncomeCard
              incomeInput={incomeInput}
              onIncomeChange={setLocalIncome}
              onIncomeBlur={handleBlurIncome}
              onSubmitEditing={handleBlurIncome}
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
