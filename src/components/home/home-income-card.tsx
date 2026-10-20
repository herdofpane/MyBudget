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
    <Card className="bg-card rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm flex-row items-center justify-between min-h-[58px]">
      {/* Icon squircle & Title (Apple HIG Table Cell Format) */}
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        <View className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 items-center justify-center shrink-0">
          <Ionicons name="cash-outline" size={19} color={colors.accent} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs sm:text-sm font-bold text-slate-800">Revenu Net</Text>
            <View className="bg-slate-100 px-1.5 py-0.5 rounded-full">
              <Text className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">Ajustable</Text>
            </View>
          </View>
          <Text className="text-[11px] text-slate-400 mt-0.5">Base mensuelle de calcul</Text>
        </View>
      </View>

      {/* Input container style Apple Inset Value */}
      <View className="flex-row items-center bg-slate-100/90 rounded-2xl px-3 py-1.5 border border-slate-200/80 min-w-[130px] max-w-[170px] min-h-[44px]">
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
          className="flex-1 text-base sm:text-lg font-black text-slate-900 border-0 bg-transparent shadow-none px-0 py-0 h-auto text-right"
        />
        <Text className="text-xs font-bold text-slate-500 ml-1.5">
          € / m
        </Text>
      </View>
    </Card>
  );
}

