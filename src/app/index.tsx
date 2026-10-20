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
          bounces={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-between pb-[92px] w-full max-w-[800px] self-center">

          {/* 1. TOP BAR SUR FOND BLEU NUIT AVEC SÉLECTEUR DE MOIS INTÉGRÉ (APPLE HIG) */}
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
                title: 'FinTrack — Budget & Épargne',
                message:
                  'Application de gestion budgétaire épurée conçue selon les principes d\'ergonomie Human Interface Guidelines.',
                subtext:
                  'Visualisez votre solde disponible en temps réel, simulez vos échéances futures et sécurisez votre épargne.',
              })
            }
          />

          {/* 2. CONTENU PRINCIPAL ERGONOMIQUE (APPLE INSET GROUPED CONTAINERS) */}
          <View className="px-4 sm:px-6 pt-3.5 gap-3.5 flex-1 justify-center py-2">
            {/* CARTE HÉROS DU RESTE À VIVRE (STYLE APPLE CARD / WALLET) */}
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

            {/* DUO DES COMPTES COURANT & ÉPARGNE */}
            <HomeAccountsCard
              checkingFormatted={renderMoney(simulatedCheckingAmount)}
              checkingRoundFormatted={renderMoneyRound(simulatedCheckingAmount)}
              epargneFormatted={renderMoney(simulatedEpargneAmount)}
              epargneRoundFormatted={renderMoneyRound(simulatedEpargneAmount)}
              onPressChecking={() => router.push('/variable-expenses')}
              onPressEpargne={() => router.push('/details')}
            />

            {/* ÉDITION DIRECTE DU REVENU (CELLULE TABLEAU iOS) */}
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

