import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

interface FixedExpensesStatsProps {
  totalFixedExpenses: number;
  activeCount: number;
  expiredCreditsCount: number;
  upcomingChargesCount: number;
  averageExpense: number;
  fixedExpenseRatio: number;
  isSimulating?: boolean;
  selectedMonthLabel?: string;
}

export function FixedExpensesStats({
  totalFixedExpenses,
  activeCount,
  expiredCreditsCount,
  upcomingChargesCount,
  averageExpense,
  fixedExpenseRatio,
  isSimulating = false,
  selectedMonthLabel,
}: FixedExpensesStatsProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isSimulating ? `Charges fixes • ${selectedMonthLabel}` : 'Total charges fixes'}
            </Text>
            <Badge
              variant="outline"
              className={`px-1.5 py-0.5 rounded-full ${
                isSimulating
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-border bg-muted/30'
              }`}>
              <Text
                className={`text-[10px] font-semibold ${
                  isSimulating ? 'text-lavender font-bold' : 'text-muted-foreground'
                }`}>
                {isSimulating ? 'Simulé' : 'Arrondi unité'}
              </Text>
            </Badge>
          </View>
          <Text className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {formatEuroRound(totalFixedExpenses)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Montant exact : {formatEuro(totalFixedExpenses)}
          </Text>
        </View>

        <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
          <Ionicons name="layers-outline" size={14} color={colors.lavender} />
          <Text className="text-xs font-bold text-lavender">
            {activeCount} active{activeCount > 1 ? 's' : ''}
          </Text>
        </Badge>
      </View>

      {/* BANDEAU SI DES CRÉDITS SONT ARRIVÉS À ÉCHÉANCE */}
      {expiredCreditsCount > 0 && (
        <View className="flex-row items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 gap-2">
          <Ionicons name="shield-checkmark" size={15} color={colors.accent} />
          <Text className="text-xs font-semibold text-emerald-800 flex-1">
            {isSimulating
              ? `${expiredCreditsCount} crédit${expiredCreditsCount > 1 ? 's' : ''} soldé${expiredCreditsCount > 1 ? 's' : ''} d’ici ${selectedMonthLabel}`
              : `${expiredCreditsCount} crédit${expiredCreditsCount > 1 ? 's' : ''} arrivé${expiredCreditsCount > 1 ? 's' : ''} à terme (imputation 0 €)`}
          </Text>
        </View>
      )}

      {/* BANDEAU SI DES CHARGES SONT DIFFÉRÉES */}
      {upcomingChargesCount > 0 && (
        <View className="flex-row items-center bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 gap-2">
          <Ionicons name="calendar-outline" size={15} color={colors.lavender} />
          <Text className="text-xs text-lavender font-semibold flex-1">
            {upcomingChargesCount} charge{upcomingChargesCount > 1 ? 's' : ''} différée{upcomingChargesCount > 1 ? 's' : ''} à venir (non imputée{upcomingChargesCount > 1 ? 's' : ''} ce mois-ci)
          </Text>
        </View>
      )}

      {/* RÉCAPITULATIF STATISTIQUE */}
      <View className="flex-row items-center bg-muted/30 rounded-2xl p-2.5 sm:p-3 border border-border">
        <View className="flex-1 items-center">
          <Text className="text-[11px] text-muted-foreground font-medium">Moyenne par charge</Text>
          <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
            ~{formatEuroRound(averageExpense)}
          </Text>
        </View>
        <View className="w-px h-7 bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-[11px] text-muted-foreground font-medium">Part des revenus</Text>
          <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
            {formatPercent(fixedExpenseRatio)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
