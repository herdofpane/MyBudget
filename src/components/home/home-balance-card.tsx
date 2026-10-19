import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface HomeBalanceCardProps {
  resteAVivreFormatted: string;
  resteAVivreRoundFormatted?: string;
  isSimulating?: boolean;
  selectedMonthLabel?: string;
  onNavigateDetails: () => void;
  onNavigateFixedExpenses: () => void;
}

export function HomeBalanceCard({
  resteAVivreFormatted,
  resteAVivreRoundFormatted,
  isSimulating,
  selectedMonthLabel,
  onNavigateDetails,
  onNavigateFixedExpenses,
}: HomeBalanceCardProps) {
  const isMasked = resteAVivreFormatted.includes('•');

  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-sm">
      <View>
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isSimulating ? 'Reste à vivre simulé' : 'Reste à vivre'}
              </Text>
              {isSimulating && selectedMonthLabel && (
                <View className="bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  <Text className="text-[9px] font-extrabold text-lavender uppercase">
                    {selectedMonthLabel}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-baseline gap-2 flex-wrap mt-1">
              <Text className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {resteAVivreFormatted}
              </Text>
              {!isMasked && resteAVivreRoundFormatted && (
                <Text className="text-sm sm:text-base font-semibold text-muted-foreground">
                  (≈ {resteAVivreRoundFormatted})
                </Text>
              )}
            </View>
          </View>

          {/* Actions Rapides Carte (Graph & Wallet Icons) */}
          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateDetails}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center"
              accessibilityLabel="Voir les détails et simulations">
              <Ionicons name="bar-chart-outline" size={15} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateFixedExpenses}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center"
              accessibilityLabel="Gérer les charges fixes">
              <Ionicons name="wallet-outline" size={15} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
}
