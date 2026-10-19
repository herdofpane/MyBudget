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
  HomeShortcuts,
} from '@/components/home';

export default function HomeScreen() {
  const {
    isLoading,
    isPrivate,
    incomeInput,
    resteAVivre,
    epargneAmount,
    checkingAmount,
    totalFixedExpenses,
    infoDialog,
    setInfoDialog,
    setLocalIncome,
    handleBlurIncome,
    togglePrivate,
    renderMoney,
  } = useHomeSummary();

  const totalBalance = checkingAmount + epargneAmount;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-[120px] w-full max-w-[860px] self-center">

          {/* 1. TOP BAR SUR FOND BLEU NUIT */}
          <HomeHeader
            isPrivate={isPrivate}
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
            {/* 2. CARTE HÉROS DU TOTAL BALANCE */}
            <HomeBalanceCard
              totalBalanceFormatted={renderMoney(totalBalance)}
              resteAVivreFormatted={renderMoney(resteAVivre)}
              onNavigateDetails={() => router.push('/details')}
              onNavigateFixedExpenses={() => router.push('/fixed-expenses')}
            />

            {/* 3. DUO DES 2 COMPTES : COURANT & ÉPARGNE */}
            <HomeAccountsCard
              checkingFormatted={renderMoney(checkingAmount)}
              epargneFormatted={renderMoney(epargneAmount)}
            />

            {/* 4. ÉDITION DIRECTE DU REVENU */}
            <HomeIncomeCard
              incomeInput={incomeInput}
              onIncomeChange={setLocalIncome}
              onIncomeBlur={handleBlurIncome}
              onSubmitEditing={handleBlurIncome}
            />

            {/* 5. RACCOURCIS RAPIDES VERS LES AUTRES ÉCRANS */}
            <HomeShortcuts
              fixedExpensesFormatted={renderMoney(totalFixedExpenses)}
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
