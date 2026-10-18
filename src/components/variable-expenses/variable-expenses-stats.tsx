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
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total charges variables
            </Text>
            <Badge variant="outline" className="border-border bg-muted/30 px-1.5 py-0.5 rounded-full">
              <Text className="text-[10px] text-muted-foreground font-semibold">
                Arrondi unité
              </Text>
            </Badge>
          </View>
          <Text className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {formatEuroRound(totalEstimatedVariable)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Montant exact : {formatEuro(totalEstimatedVariable)} / mois
          </Text>
        </View>

        <Badge variant="outline" className="bg-amber-50 border-amber-200 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
          <Ionicons name="pie-chart-outline" size={14} color="#D97706" />
          <Text className="text-xs font-bold text-amber-800">
            {count} charge{count > 1 ? 's' : ''}
          </Text>
        </Badge>
      </View>

      {/* RÉCAPITULATIF STATISTIQUE */}
      <View className="flex-row items-center bg-muted/30 rounded-2xl p-2.5 sm:p-3 border border-border">
        <View className="flex-1 items-center">
          <Text className="text-[11px] text-muted-foreground font-medium">Moyenne mensuelle</Text>
          <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
            ~{formatEuroRound(averageExpense)}
          </Text>
        </View>
        <View className="w-px h-7 bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-[11px] text-muted-foreground font-medium">Part des revenus</Text>
          <Text className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
            {formatPercent(variableExpenseRatio)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
