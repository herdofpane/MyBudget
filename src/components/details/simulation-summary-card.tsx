import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

interface SimulationSummaryCardProps {
  isMonthly: boolean;
  currentIncome: number;
  parsedMonthlyFixed: number;
  monthlyResteAVivre: number;
  currentChecking: number;
  currentEpargne: number;
  currentNecessary: number;
  currentBaseResteAVivre: number;
}

export function SimulationSummaryCard({
  isMonthly,
  currentIncome,
  parsedMonthlyFixed,
  monthlyResteAVivre,
  currentChecking,
  currentEpargne,
  currentNecessary,
  currentBaseResteAVivre,
}: SimulationSummaryCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3 sm:p-3.5 border border-border shadow-xs gap-2">
      {/* EN-TÊTE DU BILAN */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 items-center justify-center">
            <Ionicons name="bar-chart-outline" size={13} color={colors.accent} />
          </View>
          <Text className="text-xs sm:text-sm font-black text-foreground tracking-tight">
            {isMonthly ? 'Bilan Mensuel Calculé' : 'Bilan du Revenu Ponctuel'}
          </Text>
        </View>

        <View className="bg-slate-100 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] text-muted-foreground font-semibold">
            {isMonthly
              ? `Reste : ${formatEuro(monthlyResteAVivre)}`
              : `Total : ${formatEuro(currentIncome)}`}
          </Text>
        </View>
      </View>

      {/* RÉSULTATS CLÉS (COMPTE COURANT | ÉPARGNE) */}
      <View className="flex-row gap-2">
        {/* Pilier 1 : Compte Courant */}
        <View className="flex-1 rounded-xl p-2.5 border border-emerald-200/90 bg-emerald-50/70 justify-between gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Ionicons name="card-outline" size={11} color={colors.accentDark} />
              <Text className="text-[10px] font-bold text-accentDark">Courant</Text>
            </View>
            <Text className="text-[9px] text-emerald-900 font-bold">
              {currentIncome > 0 ? formatPercent((currentChecking / currentIncome) * 100) : '0%'}
            </Text>
          </View>
          <View>
            <Text
              className="text-base sm:text-lg font-black text-accentDark tracking-tight"
              numberOfLines={1}>
              {formatEuro(currentChecking)}
            </Text>
            <Text className="text-[10px] font-semibold text-emerald-800/80">
              ≈ {formatEuroRound(currentChecking)}
            </Text>
          </View>
          <Text className="text-[9px] text-emerald-700 font-medium">Dépenses de vie</Text>
        </View>

        {/* Pilier 2 : Épargne */}
        <View className="flex-1 rounded-xl p-2.5 border border-indigo-200/90 bg-indigo-50/70 justify-between gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Ionicons name="sparkles-outline" size={11} color={colors.lavender} />
              <Text className="text-[10px] font-bold text-lavender">Épargne</Text>
            </View>
            <Text className="text-[9px] text-indigo-900 font-bold">
              {currentIncome > 0 ? formatPercent((currentEpargne / currentIncome) * 100) : '0%'}
            </Text>
          </View>
          <View>
            <Text
              className={`text-base sm:text-lg font-black tracking-tight ${
                currentEpargne >= 0 ? 'text-lavender' : 'text-danger'
              }`}
              numberOfLines={1}>
              {currentEpargne >= 0 ? '+' : ''}{formatEuro(currentEpargne)}
            </Text>
            <Text className="text-[10px] font-semibold text-indigo-700/80">
              ≈ {currentEpargne >= 0 ? '+' : ''}{formatEuroRound(currentEpargne)}
            </Text>
          </View>
          <Text className="text-[9px] text-indigo-700 font-medium">Épargne conseillée</Text>
        </View>
      </View>

      {/* Pilier 3 : Seuil Nécessaire & Formule condensée */}
      <View className="flex-row items-center justify-between rounded-xl px-2.5 py-1.5 border border-slate-200/80 bg-slate-50">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="cart-outline" size={13} color="#D97706" />
          <Text className="text-[11px] font-bold text-foreground">Total Nécessaire :</Text>
          <Text className="text-xs font-black text-foreground">
            {formatEuro(currentNecessary)}
          </Text>
        </View>
        <Text className="text-[10px] text-muted-foreground font-semibold">
          √({formatEuroRound(currentBaseResteAVivre)} × {formatEuroRound(currentNecessary)})
        </Text>
      </View>
    </Card>
  );
}
