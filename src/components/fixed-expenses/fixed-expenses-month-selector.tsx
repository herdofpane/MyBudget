import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';
import { SimulationMonthPreset } from '@/utils/fixed-expenses';

interface FixedExpensesMonthSelectorProps {
  selectedMonthStr: string;
  selectedMonthOffset: number;
  selectedMonthFormatted: string;
  isSimulating: boolean;
  simulationPresets: SimulationMonthPreset[];
  differenceWithCurrentMonth: number;
  impactType?: 'charges' | 'resteAVivre';
  onSelectMonth: (monthStr: string) => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onResetToCurrentMonth: () => void;
}

export function FixedExpensesMonthSelector({
  selectedMonthStr,
  selectedMonthOffset,
  selectedMonthFormatted,
  isSimulating,
  simulationPresets,
  differenceWithCurrentMonth,
  impactType = 'charges',
  onSelectMonth,
  onNextMonth,
  onPrevMonth,
  onResetToCurrentMonth,
}: FixedExpensesMonthSelectorProps) {
  const isAtCurrent = selectedMonthOffset === 0;
  const isAtMax = selectedMonthOffset >= 12;

  const quickOffsets = [0, 1, 2, 3, 6, 12];
  const quickPresets = simulationPresets.filter((p) => quickOffsets.includes(p.offset));

  const isResteAVivreMode = impactType === 'resteAVivre';
  const isPositiveImpact = isResteAVivreMode
    ? differenceWithCurrentMonth > 0
    : differenceWithCurrentMonth < 0;
  const isNegativeImpact = isResteAVivreMode
    ? differenceWithCurrentMonth < 0
    : differenceWithCurrentMonth > 0;

  return (
    <Card className="bg-card rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 border border-slate-200/90 shadow-xs gap-1.5">
      {/* 1. BARRE DE NAVIGATION STEPPER COMPACTE */}
      <View className="flex-row items-center justify-between min-h-[34px]">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View
            className={`w-8 h-8 rounded-xl items-center justify-center border shrink-0 ${
              isSimulating
                ? 'bg-indigo-50 border-indigo-200/80'
                : 'bg-emerald-50 border-emerald-200/80'
            }`}>
            <Ionicons
              name={isSimulating ? 'sparkles-outline' : 'calendar-outline'}
              size={15}
              color={isSimulating ? colors.lavender : colors.accent}
            />
          </View>
          <View className="flex-row items-center gap-1.5 flex-wrap flex-1">
            <Text className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              {selectedMonthFormatted}
            </Text>
            <Badge
              variant="outline"
              className={`px-1.5 py-0.5 rounded-full ${
                isSimulating
                  ? 'border-indigo-300/80 bg-indigo-50'
                  : 'border-emerald-300/80 bg-emerald-50'
              }`}>
              <Text
                className={`text-[9px] font-black uppercase tracking-wider ${
                  isSimulating ? 'text-lavender' : 'text-accent'
                }`}>
                {isSimulating ? `M+${selectedMonthOffset}` : 'Actuel'}
              </Text>
            </Badge>

            {isSimulating && differenceWithCurrentMonth !== 0 && (
              <Badge
                variant="outline"
                className={`px-1.5 py-0.5 rounded-full ${
                  isPositiveImpact
                    ? 'border-emerald-300 bg-emerald-50'
                    : isNegativeImpact
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-slate-100'
                }`}>
                <Text
                  className={`text-[9px] font-bold ${
                    isPositiveImpact
                      ? 'text-accentDark'
                      : isNegativeImpact
                      ? 'text-amber-800'
                      : 'text-slate-600'
                  }`}>
                  {differenceWithCurrentMonth > 0 ? '+' : ''}
                  {formatEuro(differenceWithCurrentMonth)}
                </Text>
              </Badge>
            )}

            {isSimulating && (
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={onResetToCurrentMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Réinitialiser au mois en cours"
                className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-300/80 flex-row items-center gap-1 active:bg-indigo-100">
                <Ionicons name="refresh-outline" size={11} color={colors.lavender} />
                <Text className="text-[9px] font-bold text-lavender uppercase tracking-wider">Ce mois</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* BOUTONS FLÉCHÉS DE NAVIGATION (44PT VIA HITSLOP) */}
        <View className="flex-row items-center gap-1 shrink-0">
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={isAtCurrent}
            onPress={onPrevMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className={`w-7 h-7 rounded-full border items-center justify-center ${
              isAtCurrent
                ? 'border-slate-200/50 bg-slate-100/50 opacity-25'
                : 'border-slate-200/90 bg-white active:bg-slate-100 shadow-2xs'
            }`}
            accessibilityLabel="Mois précédent">
            <Ionicons name="chevron-back" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            disabled={isAtMax}
            onPress={onNextMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className={`w-7 h-7 rounded-full border items-center justify-center ${
              isAtMax
                ? 'border-slate-200/50 bg-slate-100/50 opacity-25'
                : 'border-slate-200/90 bg-white active:bg-slate-100 shadow-2xs'
            }`}
            accessibilityLabel="Mois suivant">
            <Ionicons name="chevron-forward" size={14} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ROULEAU DES PRÉSÉLECTIONS HORIZONTALES COMPACT */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-1.5">
        {quickPresets.map((preset) => {
          const isSelected = selectedMonthStr === preset.value;
          return (
            <TouchableOpacity
              key={preset.value}
              activeOpacity={0.6}
              onPress={() => onSelectMonth(preset.value)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Sélectionner le mois ${preset.fullLabel}`}
              className={`px-2.5 py-1 rounded-full border flex-row items-center min-h-[26px] ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-slate-100/80 border-slate-200/80 active:bg-slate-200/60'
              }`}>
              <Text
                className={`text-[11px] font-bold ${
                  isSelected ? 'text-white' : 'text-slate-700'
                }`}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Card>
  );
}
