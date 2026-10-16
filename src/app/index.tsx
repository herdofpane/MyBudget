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
            className="w-[38px] h-[38px] rounded-full bg-card border-border shadow-none"
            accessibilityLabel="Masquer ou afficher les montants">
            <Ionicons
              name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748B"
            />
          </Button>
        }
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2.5 pb-[110px] gap-4 w-full max-w-[860px] self-center">

          {/* 1. CARTE HERO : RESTE À VIVRE */}
          <Card className="bg-primary rounded-3xl p-6 shadow-sm border border-slate-800">
            <View className="flex-row justify-between items-center mb-4">
              <Badge variant="outline" className="border-white/20 bg-white/10 gap-1.5 px-2.5 py-1 rounded-full">
                <View className="w-2 h-2 rounded-full bg-accent" />
                <Text className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Reste à Vivre
                </Text>
              </Badge>
              <Text className="text-xs font-medium text-slate-400">
                Revenu - Charges Fixes
              </Text>
            </View>

            <View className="flex-row items-baseline gap-3 mb-4 flex-wrap">
              <Text className="text-4xl font-black text-white tracking-tight">
                {renderMoney(resteAVivre)}
              </Text>
              <Badge variant="secondary" className="bg-white/10 border-0 px-2 py-0.5 rounded-md">
                <Text className="text-xs font-semibold text-slate-300">
                  ≈ {renderMoneyRound(resteAVivre)}
                </Text>
              </Badge>
            </View>

            {/* Formule explicative cliquable */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setInfoDialog({
                  visible: true,
                  title: 'Formule du Reste à Vivre',
                  message:
                    'Le Reste à Vivre représente la somme dont vous disposez réellement après avoir honoré toutes vos charges incompressibles du mois.',
                  subtext:
                    'Calcul : Revenu mensuel net (' +
                    renderMoney(budget.income) +
                    ') − Total des charges fixes (' +
                    renderMoney(totalFixedExpenses) +
                    ') = ' +
                    renderMoney(resteAVivre) +
                    '.',
                })
              }
              className="flex-row items-center pt-3 border-t border-white/10 gap-2">
              <Ionicons name="information-circle-outline" size={16} color="#10B981" />
              <Text className="text-xs text-slate-300 flex-1 font-medium">
                Disponible pour épargner & vivre après charges
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </Card>

          {/* 2. REVENU MENSUEL (MODIFIABLE DIRECTEMENT) */}
          <Card className="bg-card rounded-2xl p-5 border border-border shadow-xs">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 justify-center items-center">
                <Ionicons name="wallet-outline" size={20} color="#10B981" />
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

            <View className="flex-row items-baseline bg-muted/40 rounded-xl px-4 py-1.5 border border-border">
              <Input
                value={incomeInput}
                onChangeText={setLocalIncome}
                onBlur={handleBlurIncome}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#64748B"
                className="flex-1 text-2xl font-black text-foreground border-0 bg-transparent shadow-none px-0 py-1 h-auto sm:h-auto"
              />
              <Text className="text-sm font-semibold text-muted-foreground ml-2">
                € / mois
              </Text>
            </View>
          </Card>

          {/* 3. CHARGES FIXES MENSUELLES (LIEN VERS PAGE DÉDIÉE) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/fixed-expenses')}>
            <Card className="bg-card rounded-2xl p-5 border border-border shadow-xs flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                  <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Charges Fixes</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Loyer, abonnements, assurances, crédits...
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-lg font-black text-foreground">
                  - {renderMoney(totalFixedExpenses)}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Text className="text-xs font-bold text-lavender">Gérer le détail</Text>
                  <Ionicons name="chevron-forward" size={12} color="#6366F1" />
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* 4. COMPTE COURANT & ÉPARGNE */}
          <View className="flex-row gap-3">
            {/* COMPTE COURANT (NÉCESSAIRE + FACULTATIF) */}
            <Card className="flex-1 bg-card rounded-2xl p-4 border border-border border-l-4 border-l-accent shadow-xs">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="card-outline" size={18} color="#10B981" />
                  <Text className="text-xs font-bold text-foreground">Compte Courant</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
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
                  <Ionicons name="help-circle-outline" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-baseline gap-2 mb-2 flex-wrap">
                <Text className="text-lg font-black text-foreground">
                  {renderMoney(checkingAmount)}
                </Text>
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-1.5 py-0.5 rounded">
                  <Text className="text-[11px] font-semibold text-accentDark">
                    ≈ {renderMoneyRound(checkingAmount)}
                  </Text>
                </Badge>
              </View>

              <Text className="text-xs font-bold text-foreground">Dépenses courantes</Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Reste à vivre − Épargne
              </Text>
            </Card>

            {/* COMPTE ÉPARGNE (FORMULE RACINE CARRÉE) */}
            <Card className="flex-1 bg-card rounded-2xl p-4 border border-border border-l-4 border-l-lavender shadow-xs">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="trending-up" size={18} color="#6366F1" />
                  <Text className="text-xs font-bold text-foreground">Pour Épargne</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
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
                  <Ionicons name="help-circle-outline" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-baseline gap-2 mb-2 flex-wrap">
                <Text className="text-lg font-black text-foreground">
                  {renderMoney(epargneAmount)}
                </Text>
                <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-1.5 py-0.5 rounded">
                  <Text className="text-[11px] font-semibold text-lavender">
                    ≈ {renderMoneyRound(epargneAmount)}
                  </Text>
                </Badge>
              </View>

              <Text className="text-xs font-bold text-foreground">Épargne optimisée</Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                B4 − √(B4 × Nécessaire)
              </Text>
            </Card>
          </View>

          {/* 5. LIENS DE GESTION DIRECTS */}
          <Card className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push('/variable-expenses')}
              activeOpacity={0.8}
              className="flex-row items-center p-4 gap-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 justify-center items-center">
                <Ionicons name="pie-chart-outline" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Charges Variables & Lissage</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Courses, shopping, santé et impact mensuel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
            </TouchableOpacity>

            <View className="h-px bg-border mx-4" />

            <TouchableOpacity
              onPress={() => router.push('/details')}
              activeOpacity={0.8}
              className="flex-row items-center p-4 gap-3">
              <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                <MaterialCommunityIcons name="calculator-variant-outline" size={20} color="#6366F1" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Simulation & Calculs Avancés</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Ventilation 49/37/14 et revenus ponctuels
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
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
