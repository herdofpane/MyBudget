import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

interface VariableExpensesStatsProps {
  totalEstimatedVariable: number;
  count: number;
  averageExpense: number;
  variableExpenseRatio: number;
}

export function VariableExpensesStats({
  totalEstimatedVariable,
  count,
  averageExpense,
  variableExpenseRatio,
}: VariableExpensesStatsProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm gap-3.5">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total charges variables
            </Text>
            <Badge variant="outline" className="border-slate-200 bg-slate-100/80 px-2 py-0.5 rounded-full">
              <Text className="text-[9px] text-slate-600 font-black uppercase tracking-wider">
                Arrondi
              </Text>
            </Badge>
          </View>
          <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
            {formatEuroRound(totalEstimatedVariable)}
          </Text>
          <Text className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            Montant exact : {formatEuro(totalEstimatedVariable)} / mois
          </Text>
        </View>

        <Badge variant="outline" className="bg-amber-50/90 border-amber-200/80 px-3 py-1 rounded-full flex-row items-center gap-1.5 shadow-xs">
          <Ionicons name="pie-chart-outline" size={14} color="#D97706" />
          <Text className="text-xs font-bold text-amber-800">
            {count} charge{count > 1 ? 's' : ''}
          </Text>
        </Badge>
      </View>

      {/* RÉCAPITULATIF STATISTIQUE INSET GROUPED */}
      <View className="flex-row items-center bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70">
        <View className="flex-1 items-center">
          <Text className="text-xs text-slate-500 font-medium">Moyenne mensuelle</Text>
          <Text className="text-sm font-bold text-slate-900 mt-0.5">
            ~{formatEuroRound(averageExpense)}
          </Text>
        </View>
        <View className="w-px h-8 bg-slate-200" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-slate-500 font-medium">Part des revenus</Text>
          <Text className="text-sm font-bold text-slate-900 mt-0.5">
            {formatPercent(variableExpenseRatio)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

