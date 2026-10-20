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

  // Filtrer les présélections clés pour les capsules horizontales (+0, +1, +2, +3, +6, +12)
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
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm gap-3.5">
      {/* 1. BARRE DE NAVIGATION STEPPER (APPLE HIG SEGMENTED BAR) */}
      <View className="flex-row items-center justify-between min-h-[44px]">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-2xl items-center justify-center border ${
              isSimulating
                ? 'bg-indigo-50 border-indigo-200/80'
                : 'bg-emerald-50 border-emerald-200/80'
            }`}>
            <Ionicons
              name={isSimulating ? 'sparkles-outline' : 'calendar-outline'}
              size={19}
              color={isSimulating ? colors.lavender : colors.accent}
            />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isSimulating ? 'Simulation Temporelle' : 'Mois Actif'}
              </Text>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 rounded-full ${
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
            </View>
            <Text className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {selectedMonthFormatted}
            </Text>
          </View>
        </View>

        {/* BOUTONS FLÉCHÉS DE NAVIGATION (CIBLES TACTILES 44PT CONFORMES HIG) */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={isAtCurrent}
            onPress={onPrevMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className={`w-9 h-9 rounded-full border items-center justify-center ${
              isAtCurrent
                ? 'border-slate-200/50 bg-slate-100/50 opacity-25'
                : 'border-slate-200/90 bg-white active:bg-slate-100 shadow-xs'
            }`}
            accessibilityLabel="Mois précédent">
            <Ionicons name="chevron-back" size={17} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            disabled={isAtMax}
            onPress={onNextMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className={`w-9 h-9 rounded-full border items-center justify-center ${
              isAtMax
                ? 'border-slate-200/50 bg-slate-100/50 opacity-25'
                : 'border-slate-200/90 bg-white active:bg-slate-100 shadow-xs'
            }`}
            accessibilityLabel="Mois suivant">
            <Ionicons name="chevron-forward" size={17} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ROULEAU DES PRÉSÉLECTIONS HORIZONTALES (CAPSULES DÉFILABLES HIG) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 py-0.5">
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
              className={`px-3.5 py-1.5 rounded-full border flex-row items-center min-h-[34px] ${
                isSelected
                  ? 'bg-primary border-primary shadow-xs'
                  : 'bg-slate-100/80 border-slate-200/80 active:bg-slate-200/60'
              }`}>
              <Text
                className={`text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-slate-700'
                }`}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. ENCART D'IMPACT PRÉVISIONNEL (STYLE BANNIÈRE iOS) */}
      {isSimulating && (
        <View className="flex-row items-center justify-between p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
          <View className="flex-1 mr-2 flex-row items-center gap-2.5">
            <Ionicons
              name={
                isPositiveImpact
                  ? isResteAVivreMode
                    ? 'trending-up'
                    : 'trending-down'
                  : isNegativeImpact
                  ? isResteAVivreMode
                    ? 'trending-down'
                    : 'trending-up'
                  : 'swap-horizontal'
              }
              size={17}
              color={
                isPositiveImpact
                  ? colors.accent
                  : isNegativeImpact
                  ? '#D97706'
                  : colors.textMuted
              }
            />
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-900">
                {isResteAVivreMode ? (
                  <>
                    {differenceWithCurrentMonth > 0 && (
                      <Text className="text-accent">
                        +{formatEuro(differenceWithCurrentMonth)} de reste à vivre en plus
                      </Text>
                    )}
                    {differenceWithCurrentMonth < 0 && (
                      <Text className="text-amber-800">
                        {formatEuro(differenceWithCurrentMonth)} de reste à vivre en moins
                      </Text>
                    )}
                    {differenceWithCurrentMonth === 0 && (
                      <Text className="text-slate-600">
                        Reste à vivre identique à ce mois-ci
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    {differenceWithCurrentMonth < 0 && (
                      <Text className="text-accent">
                        {formatEuro(differenceWithCurrentMonth)} de charges en moins
                      </Text>
                    )}
                    {differenceWithCurrentMonth > 0 && (
                      <Text className="text-amber-800">
                        +{formatEuro(differenceWithCurrentMonth)} de charges en plus
                      </Text>
                    )}
                    {differenceWithCurrentMonth === 0 && (
                      <Text className="text-slate-600">
                        Même total que ce mois-ci
                      </Text>
                    )}
                  </>
                )}
              </Text>
              <Text className="text-[11px] text-slate-500 mt-0.5" numberOfLines={1}>
                {isResteAVivreMode
                  ? differenceWithCurrentMonth > 0
                    ? 'Grâce aux crédits amortis ou charges terminées'
                    : differenceWithCurrentMonth < 0
                    ? 'Suite à l’activation de nouvelles charges programmées'
                    : 'Aucun changement de charge programmé d’ici là'
                  : differenceWithCurrentMonth < 0
                  ? 'Amortissement de crédits soldés d’ici cette date'
                  : differenceWithCurrentMonth > 0
                  ? 'Activation de nouvelles charges différées'
                  : 'Aucun changement de charge programmé'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onResetToCurrentMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser au mois en cours"
            className="px-3 py-1.5 rounded-full bg-white border border-indigo-300/80 flex-row items-center gap-1.5 shadow-xs active:bg-indigo-50">
            <Ionicons name="refresh-outline" size={13} color={colors.lavender} />
            <Text className="text-xs font-bold text-lavender uppercase tracking-wider">Ce mois</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

