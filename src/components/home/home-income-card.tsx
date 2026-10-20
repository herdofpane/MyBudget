import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { colors } from '@/theme/colors';

interface HomeIncomeCardProps {
  incomeInput: string;
  onIncomeChange: (val: string) => void;
  onIncomeBlur: () => void;
  onSubmitEditing?: () => void;
}

export function HomeIncomeCard({
  incomeInput,
  onIncomeChange,
  onIncomeBlur,
  onSubmitEditing,
}: HomeIncomeCardProps) {
  return (
    <Card className="bg-card rounded-2xl px-3.5 py-2.5 border border-border/80 shadow-xs flex-row items-center justify-between">
      <View className="flex-row items-center gap-2 flex-1 pr-2">
        <View className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 items-center justify-center shrink-0">
          <Ionicons name="cash-outline" size={16} color={colors.accent} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-foreground">Revenu Net</Text>
            <View className="bg-slate-100 px-1.5 py-0.2 rounded">
              <Text className="text-[9px] font-semibold text-slate-500">Ajustable</Text>
            </View>
          </View>
          <Text className="text-[10px] text-muted-foreground mt-0.5">Base mensuelle de calcul</Text>
        </View>
      </View>

      <View className="flex-row items-center bg-slate-50/90 rounded-xl px-3 py-1.5 border border-slate-200/80 min-w-[125px] max-w-[170px] focus:border-accent">
        <Input
          value={incomeInput}
          onChangeText={onIncomeChange}
          onBlur={onIncomeBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="done"
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Montant du revenu mensuel net en euros"
          className="flex-1 text-base sm:text-lg font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0 h-auto text-right"
        />
        <Text className="text-xs font-bold text-slate-500 ml-1.5">
          € / m
        </Text>
      </View>
    </Card>
  );
}
