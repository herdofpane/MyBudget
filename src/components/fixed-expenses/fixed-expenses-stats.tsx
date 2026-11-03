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
    <Card className="bg-card rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200/90 shadow-xs gap-1.5">
      <View className="flex-row justify-between items-center flex-wrap gap-2">
        {/* Gauche : Titre + Montant arrondi + Montant exact en ligne */}
        <View className="flex-1 min-w-[160px]">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isSimulating ? `Charges fixes • ${selectedMonthLabel}` : 'Total charges fixes'}
            </Text>
            {expiredCreditsCount > 0 && (
              <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-1.5 py-0 rounded-full">
                <Text className="text-[8px] font-bold text-emerald-800">
                  {expiredCreditsCount} soldé{expiredCreditsCount > 1 ? 's' : ''}
                </Text>
              </Badge>
            )}
            {upcomingChargesCount > 0 && (
              <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-1.5 py-0 rounded-full">
                <Text className="text-[8px] font-bold text-lavender">
                  {upcomingChargesCount} à venir
                </Text>
              </Badge>
            )}
          </View>
          <View className="flex-row items-baseline gap-2 mt-0.5">
            <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
              {formatEuroRound(totalFixedExpenses)}
            </Text>
            <Text className="text-[11px] font-semibold text-slate-400">
              ({formatEuro(totalFixedExpenses)})
            </Text>
          </View>
        </View>

        {/* Droite : Indicateurs compacts (Moyenne, Part revenus, Actives) */}
        <View className="flex-row items-center bg-slate-100/80 rounded-xl px-2.5 py-1.5 border border-slate-200/70 gap-2.5">
          <View className="items-center">
            <Text className="text-[9px] text-slate-500 font-semibold uppercase">Moyenne</Text>
            <Text className="text-xs font-black text-slate-900">
              ~{formatEuroRound(averageExpense)}
            </Text>
          </View>
          <View className="w-px h-6 bg-slate-200" />
          <View className="items-center">
            <Text className="text-[9px] text-slate-500 font-semibold uppercase">Revenus</Text>
            <Text className="text-xs font-black text-slate-900">
              {formatPercent(fixedExpenseRatio)}
            </Text>
          </View>
          <View className="w-px h-6 bg-slate-200" />
          <View className="items-center flex-row gap-1">
            <Ionicons name="layers-outline" size={12} color={colors.lavender} />
            <Text className="text-xs font-black text-lavender">
              {activeCount}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
