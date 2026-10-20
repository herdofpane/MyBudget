import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';

interface HomeAccountsCardProps {
  checkingFormatted: string;
  checkingRoundFormatted?: string;
  epargneFormatted: string;
  epargneRoundFormatted?: string;
  onPressChecking?: () => void;
  onPressEpargne?: () => void;
}

export function HomeAccountsCard({
  checkingFormatted,
  checkingRoundFormatted,
  epargneFormatted,
  epargneRoundFormatted,
  onPressChecking,
  onPressEpargne,
}: HomeAccountsCardProps) {
  const isCheckingMasked = checkingFormatted.includes('•');
  const isEpargneMasked = epargneFormatted.includes('•');

  return (
    <View className="flex-row gap-2.5">
      {/* 1. COMPTE COURANT (INTERACTIF) */}
      <TouchableOpacity
        activeOpacity={onPressChecking ? 0.7 : 1}
        onPress={onPressChecking}
        accessibilityRole={onPressChecking ? 'button' : 'none'}
        accessibilityLabel="Consulter vos charges variables et compte courant"
        className="flex-1">
        <Card className="bg-card rounded-2xl p-3 border border-border/80 shadow-xs justify-between gap-1.5 active:bg-slate-50/80">
          <View className="flex-row items-center justify-between">
            <Badge variant="outline" className="border-emerald-300/80 bg-emerald-50 px-2 py-0.2 rounded-full flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">
                Courant
              </Text>
            </Badge>
            <View className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 items-center justify-center">
              <Ionicons name="card-outline" size={12} color={colors.accent} />
            </View>
          </View>

          <View className="my-0.5">
            <Text className="text-lg sm:text-xl font-black text-foreground tracking-tight" numberOfLines={1}>
              {checkingFormatted}
            </Text>
            {!isCheckingMasked && checkingRoundFormatted && (
              <Text className="text-[11px] font-semibold text-muted-foreground">
                ≈ {checkingRoundFormatted}
              </Text>
            )}
          </View>

          <View className="pt-1.5 border-t border-slate-100 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold text-foreground">Vie & courses</Text>
            <Ionicons name="chevron-forward" size={11} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* 2. COMPTE ÉPARGNE (INTERACTIF) */}
      <TouchableOpacity
        activeOpacity={onPressEpargne ? 0.7 : 1}
        onPress={onPressEpargne}
        accessibilityRole={onPressEpargne ? 'button' : 'none'}
        accessibilityLabel="Consulter votre plan d'épargne et simulation"
        className="flex-1">
        <Card className="bg-card rounded-2xl p-3 border border-border/80 shadow-xs justify-between gap-1.5 active:bg-slate-50/80">
          <View className="flex-row items-center justify-between">
            <Badge variant="outline" className="border-indigo-300/80 bg-indigo-50 px-2 py-0.2 rounded-full flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <Text className="text-[9px] font-black text-lavender uppercase tracking-wider">
                Épargne
              </Text>
            </Badge>
            <View className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200/60 items-center justify-center">
              <Ionicons name="sparkles-outline" size={12} color={colors.lavender} />
            </View>
          </View>

          <View className="my-0.5">
            <Text className="text-lg sm:text-xl font-black text-foreground tracking-tight" numberOfLines={1}>
              {epargneFormatted}
            </Text>
            {!isEpargneMasked && epargneRoundFormatted && (
              <Text className="text-[11px] font-semibold text-muted-foreground">
                ≈ {epargneRoundFormatted}
              </Text>
            )}
          </View>

          <View className="pt-1.5 border-t border-slate-100 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold text-foreground">Épargne</Text>
            <Ionicons name="chevron-forward" size={11} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
}
