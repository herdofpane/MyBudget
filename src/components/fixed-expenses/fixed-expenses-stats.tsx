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
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm gap-3.5">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSimulating ? `Charges fixes • ${selectedMonthLabel}` : 'Total charges fixes'}
            </Text>
            <Badge
              variant="outline"
              className={`px-2 py-0.5 rounded-full ${
                isSimulating
                  ? 'border-indigo-300/80 bg-indigo-50'
                  : 'border-slate-200 bg-slate-100/80'
              }`}>
              <Text
                className={`text-[9px] font-black uppercase tracking-wider ${
                  isSimulating ? 'text-lavender' : 'text-slate-600'
                }`}>
                {isSimulating ? 'Simulé' : 'Arrondi'}
              </Text>
            </Badge>
          </View>
          <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
            {formatEuroRound(totalFixedExpenses)}
          </Text>
          <Text className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            Montant exact : {formatEuro(totalFixedExpenses)}
          </Text>
        </View>

        <Badge variant="outline" className="bg-indigo-50 border-indigo-200/80 px-3 py-1 rounded-full flex-row items-center gap-1.5 shadow-xs">
          <Ionicons name="layers-outline" size={14} color={colors.lavender} />
          <Text className="text-xs font-bold text-lavender">
            {activeCount} active{activeCount > 1 ? 's' : ''}
          </Text>
        </Badge>
      </View>

      {/* BANDEAU SI DES CRÉDITS SONT ARRIVÉS À ÉCHÉANCE */}
      {expiredCreditsCount > 0 && (
        <View className="flex-row items-center bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80 gap-2.5">
          <Ionicons name="shield-checkmark" size={17} color={colors.accent} />
          <Text className="text-xs font-semibold text-emerald-900 flex-1">
            {isSimulating
              ? `${expiredCreditsCount} crédit${expiredCreditsCount > 1 ? 's' : ''} soldé${expiredCreditsCount > 1 ? 's' : ''} d’ici ${selectedMonthLabel}`
              : `${expiredCreditsCount} crédit${expiredCreditsCount > 1 ? 's' : ''} arrivé${expiredCreditsCount > 1 ? 's' : ''} à terme (imputation 0 €)`}
          </Text>
        </View>
      )}

      {/* BANDEAU SI DES CHARGES SONT DIFFÉRÉES */}
      {upcomingChargesCount > 0 && (
        <View className="flex-row items-center bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200/80 gap-2.5">
          <Ionicons name="calendar-outline" size={17} color={colors.lavender} />
          <Text className="text-xs text-lavender font-semibold flex-1">
            {upcomingChargesCount} charge{upcomingChargesCount > 1 ? 's' : ''} différée{upcomingChargesCount > 1 ? 's' : ''} à venir (non imputée{upcomingChargesCount > 1 ? 's' : ''} ce mois-ci)
          </Text>
        </View>
      )}

      {/* RÉCAPITULATIF STATISTIQUE INSET GROUPED */}
      <View className="flex-row items-center bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70">
        <View className="flex-1 items-center">
          <Text className="text-xs text-slate-500 font-medium">Moyenne par charge</Text>
          <Text className="text-sm font-bold text-slate-900 mt-0.5">
            ~{formatEuroRound(averageExpense)}
          </Text>
        </View>
        <View className="w-px h-8 bg-slate-200" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-slate-500 font-medium">Part des revenus</Text>
          <Text className="text-sm font-bold text-slate-900 mt-0.5">
            {formatPercent(fixedExpenseRatio)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

