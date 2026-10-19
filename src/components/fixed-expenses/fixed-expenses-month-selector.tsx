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

  // Filtrer les présélections clés pour les pills horizontaux (+0, +1, +2, +3, +6, +12)
  const quickOffsets = [0, 1, 2, 3, 6, 12];
  const quickPresets = simulationPresets.filter((p) => quickOffsets.includes(p.offset));

  const isResteAVivreMode = impactType === 'resteAVivre';
  // Pour le reste à vivre, differenceWithCurrentMonth > 0 est positif/vert (plus d'argent pour vivre).
  // Pour les charges, differenceWithCurrentMonth < 0 est positif/vert (moins de charges).
  const isPositiveImpact = isResteAVivreMode
    ? differenceWithCurrentMonth > 0
    : differenceWithCurrentMonth < 0;
  const isNegativeImpact = isResteAVivreMode
    ? differenceWithCurrentMonth < 0
    : differenceWithCurrentMonth > 0;

  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5">
      {/* 1. BARRE DE NAVIGATION PAS À PAS */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center border ${
              isSimulating
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
            <Ionicons
              name={isSimulating ? 'sparkles-outline' : 'calendar-outline'}
              size={18}
              color={isSimulating ? colors.lavender : colors.accent}
            />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {isSimulating ? 'Simulation Temporelle' : 'Mois en Cours'}
              </Text>
              <Badge
                variant="outline"
                className={`px-1.5 py-0 rounded ${
                  isSimulating
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-emerald-300 bg-emerald-50'
                }`}>
                <Text
                  className={`text-[9px] font-extrabold ${
                    isSimulating ? 'text-lavender' : 'text-accent'
                  }`}>
                  {isSimulating ? `M+${selectedMonthOffset}` : 'Actuel'}
                </Text>
              </Badge>
            </View>
            <Text className="text-base sm:text-lg font-black text-foreground tracking-tight mt-0.5">
              {selectedMonthFormatted}
            </Text>
          </View>
        </View>

        {/* BOUTONS FLÉCHÉS DE NAVIGATION */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isAtCurrent}
            onPress={onPrevMonth}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            className={`w-8 h-8 rounded-full border items-center justify-center ${
              isAtCurrent
                ? 'border-border/40 bg-muted/20 opacity-30'
                : 'border-border bg-card'
            }`}
            accessibilityLabel="Mois précédent">
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isAtMax}
            onPress={onNextMonth}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            className={`w-8 h-8 rounded-full border items-center justify-center ${
              isAtMax
                ? 'border-border/40 bg-muted/20 opacity-30'
                : 'border-border bg-card'
            }`}
            accessibilityLabel="Mois suivant">
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ROULEAU DES PRÉSÉLECTIONS RAPIDES (PILLS DÉFILABLES) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 py-0.5">
        {quickPresets.map((preset) => {
          const isSelected = selectedMonthStr === preset.value;
          return (
            <TouchableOpacity
              key={preset.value}
              activeOpacity={0.75}
              onPress={() => onSelectMonth(preset.value)}
              accessibilityRole="button"
              accessibilityLabel={`Sélectionner le mois ${preset.fullLabel}`}
              className={`px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-muted/40 border-border'
              }`}>
              <Text
                className={`text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-foreground'
                }`}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. ENCART D'IMPACT DE LA SIMULATION (SI UN MOIS FUTUR EST SÉLECTIONNÉ) */}
      {isSimulating && (
        <View className="flex-row items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
          <View className="flex-1 mr-2 flex-row items-center gap-2">
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
              size={16}
              color={
                isPositiveImpact
                  ? colors.accent
                  : isNegativeImpact
                  ? '#D97706'
                  : colors.textMuted
              }
            />
            <View className="flex-1">
              <Text className="text-xs font-bold text-foreground">
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
                      <Text className="text-muted-foreground">
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
                      <Text className="text-muted-foreground">
                        Même total que ce mois-ci
                      </Text>
                    )}
                  </>
                )}
              </Text>
              <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
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
            activeOpacity={0.7}
            onPress={onResetToCurrentMonth}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser au mois en cours"
            className="px-2.5 py-1 rounded-lg bg-card border border-indigo-300 flex-row items-center gap-1">
            <Ionicons name="refresh-outline" size={12} color={colors.lavender} />
            <Text className="text-[11px] font-bold text-lavender">Ce mois</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}
