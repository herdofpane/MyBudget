import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AppDialog } from '@/components/confirm-dialog';
import { HomeSkeleton } from '@/components/ui/loading-state';
import { useHomeSummary } from '@/hooks/use-home-summary';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const {
    budget,
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

          {/* 1. TOP BAR ÉLÉGANTE SUR FOND BLEU NUIT (STYLE FINTECH DU MOCKUP) */}
          <View className="bg-primary px-4 sm:px-6 pt-3 pb-8 rounded-b-[36px] shadow-md">
            <View className="flex-row justify-between items-center mb-4">
              {/* Marque Klyro avec typographie moderne et accent vert */}
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 items-center justify-center">
                  <Ionicons name="wallet" size={17} color={colors.accent} />
                </View>
                <Text className="text-xl font-extrabold text-white tracking-tight">
                  <Text className="text-accent">Fin</Text>Track{' '}
                  <Text className="text-xs font-semibold text-slate-400">by Klyro</Text>
                </Text>
              </View>

              {/* Actions Header (Privacy Eye + Notifications) */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={togglePrivate}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center"
                  accessibilityLabel="Masquer ou afficher les montants">
                  <Ionicons
                    name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
                    size={17}
                    color="#ffffff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setInfoDialog({
                      visible: true,
                      title: 'Bienvenue sur Klyro',
                      message:
                        'Votre application de gestion budgétaire épurée inspirée du design fintech contemporain.',
                      subtext:
                        'Visualisez votre solde total, vos jauges de dépenses et vos transactions en temps réel.',
                    })
                  }
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center"
                  accessibilityLabel="Notifications">
                  <Ionicons name="notifications-outline" size={17} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* MESSAGE D'ACCUEIL SUBTIL */}
            <Text className="text-xs font-medium text-slate-300">
              {"VUE D'ENSEMBLE BUDGÉTAIRE • " + new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </Text>
          </View>

          {/* CONTENU PRINCIPAL DÉCALÉ VERS LE HAUT SUR LE BANDEAU BLEU NUIT */}
          <View className="px-3.5 sm:px-4 -mt-5 gap-3.5 sm:gap-4">

            {/* 2. CARTE HÉROS DU TOTAL BALANCE */}
            <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-sm">
              {/* SECTION TOTAL BALANCE */}
              <View>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total Balance
                    </Text>
                    <Text className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">
                      {renderMoney(totalBalance)}
                    </Text>
                  </View>

                  {/* Actions Rapides Carte (Graph & Wallet Icons) */}
                  <View className="flex-row items-center gap-1.5">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push('/details')}
                      className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center">
                      <Ionicons name="bar-chart-outline" size={15} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push('/fixed-expenses')}
                      className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center">
                      <Ionicons name="wallet-outline" size={15} color={colors.accent} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Badge de Progression Positive (+3.2% Today style mockup) */}
                <View className="flex-row items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                    <Ionicons name="trending-up" size={12} color={colors.accent} />
                    <Text className="text-xs font-extrabold text-accent">
                      {"+3.2% Aujourd'hui"}
                    </Text>
                  </Badge>
                  <Text className="text-[11px] text-muted-foreground">
                    Reste à vivre : {renderMoney(resteAVivre)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* 3. DUO DES 2 COMPTES : COURANT & ÉPARGNE */}
            <View className="flex-row gap-2.5 sm:gap-3.5">
              {/* COMPTE COURANT */}
              <Card className="flex-1 bg-card rounded-3xl p-4 border border-border shadow-xs justify-between">
                <View>
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        Courant
                      </Text>
                    </Badge>
                    <Ionicons name="card-outline" size={15} color={colors.accent} />
                  </View>
                  <Text className="text-xl sm:text-2xl font-black text-foreground tracking-tight my-0.5">
                    {renderMoney(checkingAmount)}
                  </Text>
                </View>
                <View className="pt-2 mt-2 border-t border-slate-100">
                  <Text className="text-xs font-bold text-foreground">Dépenses de vie</Text>
                  <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                    Alimentation & quotidien
                  </Text>
                </View>
              </Card>

              {/* COMPTE ÉPARGNE */}
              <Card className="flex-1 bg-card rounded-3xl p-4 border border-border shadow-xs justify-between">
                <View>
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-lavender uppercase tracking-wider">
                        Épargne
                      </Text>
                    </Badge>
                    <Ionicons name="sparkles-outline" size={15} color={colors.lavender} />
                  </View>
                  <Text className="text-xl sm:text-2xl font-black text-foreground tracking-tight my-0.5">
                    {renderMoney(epargneAmount)}
                  </Text>
                </View>
                <View className="pt-2 mt-2 border-t border-slate-100">
                  <Text className="text-xs font-bold text-foreground">Épargne Klyro</Text>
                  <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                    Formule racine carrée
                  </Text>
                </View>
              </Card>
            </View>

            {/* 5. ÉDITION DIRECTE DU REVENU (PRATIQUE & VISIBLE) */}
            <Card className="bg-card rounded-2xl p-4 border border-border shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cash-outline" size={17} color={colors.accent} />
                  <Text className="text-xs font-bold text-foreground">Revenu Mensuel Net</Text>
                </View>
                <Badge variant="outline" className="border-border bg-muted/40 px-1.5 py-0 rounded">
                  <Text className="text-[10px] font-semibold text-muted-foreground">Ajustable</Text>
                </Badge>
              </View>

              <View className="flex-row items-baseline bg-muted/30 rounded-xl px-3 py-1.5 border border-border">
                <Input
                  value={incomeInput}
                  onChangeText={setLocalIncome}
                  onBlur={handleBlurIncome}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  className="flex-1 text-lg font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0.5 h-auto"
                />
                <Text className="text-xs font-bold text-muted-foreground ml-2">
                  € / mois
                </Text>
              </View>
            </Card>

            {/* 6. RACCOURCIS RAPIDES VERS LES AUTRES ÉCRANS */}
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/fixed-expenses')}
                className="flex-1 bg-card rounded-2xl p-3.5 border border-border shadow-xs justify-between">
                <View className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 items-center justify-center mb-2">
                  <Ionicons name="calendar-outline" size={16} color={colors.lavender} />
                </View>
                <Text className="text-xs font-bold text-foreground">Charges Fixes</Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5">
                  -{renderMoney(totalFixedExpenses)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/variable-expenses')}
                className="flex-1 bg-card rounded-2xl p-3.5 border border-border shadow-xs justify-between">
                <View className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mb-2">
                  <Ionicons name="pie-chart-outline" size={16} color={colors.accent} />
                </View>
                <Text className="text-xs font-bold text-foreground">Variables</Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5">
                  Gestion & Lissage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/details')}
                className="flex-1 bg-card rounded-2xl p-3.5 border border-border shadow-xs justify-between">
                <View className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center mb-2">
                  <MaterialCommunityIcons name="calculator-variant-outline" size={16} color={colors.primary} />
                </View>
                <Text className="text-xs font-bold text-foreground">Simulation</Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5">
                  Formule Klyro
                </Text>
              </TouchableOpacity>
            </View>

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
