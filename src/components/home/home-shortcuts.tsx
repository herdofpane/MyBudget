import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface HomeShortcutsProps {
  fixedExpensesFormatted: string;
  onNavigateFixedExpenses: () => void;
  onNavigateVariableExpenses: () => void;
  onNavigateDetails: () => void;
}

export function HomeShortcuts({
  fixedExpensesFormatted,
  onNavigateFixedExpenses,
  onNavigateVariableExpenses,
  onNavigateDetails,
}: HomeShortcutsProps) {
  return (
    <View className="flex-row gap-2.5">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNavigateFixedExpenses}
        className="flex-1 bg-card rounded-2xl p-3.5 border border-border shadow-xs justify-between">
        <View className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 items-center justify-center mb-2">
          <Ionicons name="calendar-outline" size={16} color={colors.lavender} />
        </View>
        <Text className="text-xs font-bold text-foreground">Charges Fixes</Text>
        <Text className="text-[11px] text-muted-foreground mt-0.5">
          -{fixedExpensesFormatted}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNavigateVariableExpenses}
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
        onPress={onNavigateDetails}
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
  );
}
