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
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/navigation-header';
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
    renderMoneyRound,
  } = useHomeSummary();

  // Date actuelle
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ — KLYRO */}
      <NavigationHeader
        title="Klyro"
        subtitle={`VUE D'ENSEMBLE • ${formattedMonth.toUpperCase()}`}
        actionButton={
          <Button
            variant="outline"
            size="icon"
            onPress={togglePrivate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-[38px] h-[38px] rounded-full bg-card border-border shadow-none"
            accessibilityLabel="Masquer ou afficher les montants">
            <Ionicons
              name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </Button>
        }
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-3.5 sm:px-4 pt-1.5 pb-[115px] gap-3.5 sm:gap-4 w-full max-w-[860px] self-center">

          {/* 1. DUO HERO : LES 2 SOLDES CLÉS (COMPTE COURANT & ÉPARGNE) */}
          <View className="flex-row gap-2.5 sm:gap-3.5">
            {/* COMPTE COURANT (DÉPENSES COURANTES & QUOTIDIEN) */}
            <Card className="flex-1 bg-primary rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-sm justify-between">
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/15 gap-1.5 px-2 py-0.5 rounded-full">
                    <View className="w-2 h-2 rounded-full bg-accent" />
                    <Text className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Courant
                    </Text>
                  </Badge>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() =>
                      setInfoDialog({
                        visible: true,
                        title: 'Montant pour Compte Courant',
                        message:
                          'Ce montant couvre vos dépenses de vie quotidienne (alimentation, transport, sorties et facultatif).',
                        subtext:
                          'Formule tableur : Reste à vivre (' +
                          renderMoney(resteAVivre) +
                          ') − Montant pour Épargne (' +
                          renderMoney(epargneAmount) +
                          ') = ' +
                          renderMoney(checkingAmount) +
                          '.',
                      })
                    }>
                    <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1"
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {renderMoney(checkingAmount)}
                </Text>

                <Badge variant="secondary" className="bg-white/10 border-0 px-2 py-0.5 rounded-md self-start my-0.5">
                  <Text className="text-[10px] sm:text-[11px] font-semibold text-emerald-300">
                    ≈ {renderMoneyRound(checkingAmount)}
                  </Text>
                </Badge>
              </View>

              <View className="pt-2 mt-2 border-t border-white/10">
                <Text className="text-xs font-bold text-slate-200">Dépenses courantes</Text>
                <Text className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                  Alimentation & quotidien
                </Text>
              </View>
            </Card>

            {/* COMPTE ÉPARGNE (CROISSANCE & PROJETS) */}
            <Card className="flex-1 bg-primary rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-sm justify-between">
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/15 gap-1.5 px-2 py-0.5 rounded-full">
                    <View className="w-2 h-2 rounded-full bg-lavender" />
                    <Text className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Épargne
                    </Text>
                  </Badge>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() =>
                      setInfoDialog({
                        visible: true,
                        title: 'Formule d’Épargne Klyro',
                        message:
                          'L’épargne est calculée selon la formule mathématique optimale du tableur :',
                        subtext:
                          'Épargne = Reste à Vivre − √(Reste à Vivre × Total Nécessaire). Avec un seuil nécessaire fixé à ' +
                          renderMoney(budget.targetNecessary || 123) +
                          ', le montant calculé est de ' +
                          renderMoney(epargneAmount) +
                          '.',
                      })
                    }>
                    <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1"
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {renderMoney(epargneAmount)}
                </Text>

                <Badge variant="secondary" className="bg-white/10 border-0 px-2 py-0.5 rounded-md self-start my-0.5">
                  <Text className="text-[10px] sm:text-[11px] font-semibold text-indigo-300">
                    ≈ {renderMoneyRound(epargneAmount)}
                  </Text>
                </Badge>
              </View>

              <View className="pt-2 mt-2 border-t border-white/10">
                <Text className="text-xs font-bold text-slate-200">Épargne optimisée</Text>
                <Text className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                  Formule racine carrée
                </Text>
              </View>
            </Card>
          </View>

          {/* 2. BANDEAU DE SYNTHÈSE : RESTE À VIVRE TOTAL */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setInfoDialog({
                visible: true,
                title: 'Formule du Reste à Vivre',
                message:
                  'Le Reste à Vivre représente la somme globale disponible après avoir honoré toutes vos charges fixes.',
                subtext:
                  'Calcul : Revenu mensuel net (' +
                  renderMoney(budget.income) +
                  ') − Total des charges fixes (' +
                  renderMoney(totalFixedExpenses) +
                  ') = ' +
                  renderMoney(resteAVivre) +
                  ' (qui se répartit en Compte Courant ' +
                  renderMoney(checkingAmount) +
                  ' + Épargne ' +
                  renderMoney(epargneAmount) +
                  ').',
              })
            }>
            <Card className="bg-card rounded-2xl p-3.5 sm:p-4 border border-border shadow-xs flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 justify-center items-center shrink-0">
                  <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 flex-wrap">
                    <Text className="text-xs sm:text-sm font-bold text-foreground">Reste à Vivre Total</Text>
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 px-1.5 py-0 rounded">
                      <Text className="text-[10px] font-semibold text-muted-foreground">Courant + Épargne</Text>
                    </Badge>
                  </View>
                  <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
                    Revenu ({renderMoney(budget.income)}) − Charges fixes ({renderMoney(totalFixedExpenses)})
                  </Text>
                </View>
              </View>

              <View className="items-end shrink-0">
                <Text className="text-base sm:text-lg font-black text-foreground">
                  {renderMoney(resteAVivre)}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Text className="text-xs font-bold text-accent">Détail formule</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.accent} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* 3. REVENU MENSUEL (MODIFIABLE DIRECTEMENT) */}
          <Card className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs">
            <View className="flex-row items-center gap-3 mb-2.5">
              <View className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 justify-center items-center">
                <Ionicons name="wallet-outline" size={20} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">Revenu Mensuel</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Base salaires, primes ou aides nettes
                </Text>
              </View>
              <Badge variant="secondary" className="bg-emerald-50 border-0 px-2 py-0.5 rounded-md">
                <Text className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  MODIFIABLE
                </Text>
              </Badge>
            </View>

            <View className="flex-row items-baseline bg-muted/40 rounded-xl px-3.5 py-1 border border-border">
              <Input
                value={incomeInput}
                onChangeText={setLocalIncome}
                onBlur={handleBlurIncome}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-xl sm:text-2xl font-black text-foreground border-0 bg-transparent shadow-none px-0 py-1 h-auto sm:h-auto"
              />
              <Text className="text-xs sm:text-sm font-semibold text-muted-foreground ml-2">
                € / mois
              </Text>
            </View>
          </Card>

          {/* 4. CHARGES FIXES MENSUELLES (LIEN VERS PAGE DÉDIÉE) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/fixed-expenses')}>
            <Card className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                  <Ionicons name="calendar-outline" size={20} color={colors.lavender} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Charges Fixes</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                    Loyer, abonnements, assurances, crédits...
                  </Text>
                </View>
              </View>
              <View className="items-end shrink-0">
                <Text className="text-base sm:text-lg font-black text-foreground">
                  - {renderMoney(totalFixedExpenses)}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Text className="text-xs font-bold text-lavender">Gérer le détail</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.lavender} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* 5. LIENS DE GESTION DIRECTS */}
          <Card className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push('/variable-expenses')}
              activeOpacity={0.8}
              className="flex-row items-center p-3.5 sm:p-4 gap-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 justify-center items-center shrink-0">
                <Ionicons name="pie-chart-outline" size={20} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Charges Variables & Lissage</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Courses, shopping, santé et impact mensuel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View className="h-px bg-border mx-3.5 sm:mx-4" />

            <TouchableOpacity
              onPress={() => router.push('/details')}
              activeOpacity={0.8}
              className="flex-row items-center p-3.5 sm:p-4 gap-3">
              <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
                <MaterialCommunityIcons name="calculator-variant-outline" size={20} color={colors.lavender} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Simulation & Calculs Avancés</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Ventilation 49/37/14 et revenus ponctuels
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}

      {/* POP-UP PÉDAGOGIQUE UNIVERSELLE */}
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
