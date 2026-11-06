import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppDialog } from '@/components/confirm-dialog';
import { HomeSkeleton } from '@/components/ui/loading-state';
import {
  useHomeSummary,
  HomeHeader,
  HomeBalanceCard,
  HomeAccountsCard,
  HomeIncomeCard,
  BackupModal,
  BudgetTrendChart,
} from '@/features/dashboard';

export default function HomeScreen() {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const {
    isLoading,
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
    renderMoney,
    renderMoneyRound,
  } = useHomeSummary();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <View className="flex-1 justify-between pb-[82px] sm:pb-[88px] w-full max-w-[800px] self-center overflow-hidden">
          {/* 1. TOP BAR SUR FOND BLEU NUIT AVEC SÉLECTEUR DE MOIS INTÉGRÉ (APPLE HIG) */}
          <HomeHeader
            selectedMonthFormatted={selectedMonthFormatted}
            selectedMonthOffset={selectedMonthOffset}
            isSimulating={isSimulating}
            differenceResteAVivre={differenceResteAVivre}
            onNextMonth={handleNextSimulationMonth}
            onPrevMonth={handlePrevSimulationMonth}
            onResetMonth={handleResetToCurrentMonth}
            onOpenBackup={() => setShowBackupModal(true)}
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

          {/* 2. CONTENU PRINCIPAL SUR UN SEUL ÉCRAN SANS SCROLL */}
          <View className="px-3.5 sm:px-6 py-1 gap-1.5 flex-1 justify-between">
            {/* CARTE HÉROS DU RESTE À VIVRE */}
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

            {/* ÉDITION DIRECTE DU REVENU */}
            <HomeIncomeCard
              incomeInput={incomeInput}
              onIncomeChange={setLocalIncome}
              onIncomeBlur={handleBlurIncome}
              onSubmitEditing={handleBlurIncome}
            />

            {/* PROJECTION TRAJECTOIRE BUDGÉTAIRE SUR 12 MOIS */}
            <BudgetTrendChart />
          </View>
        </View>
      )}

      {/* MODALE DE SAUVEGARDE & EXPORT / IMPORT */}
      <BackupModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />

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
          onCancel={() => setInfoDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}
