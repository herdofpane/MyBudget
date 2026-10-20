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
    <View className="flex-row gap-3">
      {/* 1. COMPTE COURANT (INTERACTIF TYPE CARTE APPLE WALLET) */}
      <TouchableOpacity
        activeOpacity={onPressChecking ? 0.6 : 1}
        onPress={onPressChecking}
        accessibilityRole={onPressChecking ? 'button' : 'none'}
        accessibilityLabel="Consulter vos charges variables et compte courant"
        accessibilityHint="Navigue vers la gestion des charges variables et du compte courant"
        className="flex-1">
        <Card className="bg-card rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm justify-between gap-2.5 active:bg-slate-50/90">
          <View className="flex-row items-center justify-between">
            <Badge variant="outline" className="border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 rounded-full flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                Courant
              </Text>
            </Badge>
            <View className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/70 items-center justify-center">
              <Ionicons name="card-outline" size={14} color={colors.accent} />
            </View>
          </View>

          <View className="my-0.5">
            <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
              {checkingFormatted}
            </Text>
            {!isCheckingMasked && checkingRoundFormatted && (
              <Text className="text-xs font-semibold text-slate-400 mt-0.5">
                ≈ {checkingRoundFormatted}
              </Text>
            )}
          </View>

          <View className="pt-2 border-t border-slate-100 flex-row items-center justify-between min-h-[24px]">
            <Text className="text-xs font-bold text-slate-700">Vie courante</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* 2. COMPTE ÉPARGNE (INTERACTIF TYPE CARTE APPLE WALLET) */}
      <TouchableOpacity
        activeOpacity={onPressEpargne ? 0.6 : 1}
        onPress={onPressEpargne}
        accessibilityRole={onPressEpargne ? 'button' : 'none'}
        accessibilityLabel="Consulter votre plan d'épargne et simulation"
        accessibilityHint="Navigue vers les détails de calcul et la répartition de l'épargne"
        className="flex-1">
        <Card className="bg-card rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm justify-between gap-2.5 active:bg-slate-50/90">
          <View className="flex-row items-center justify-between">
            <Badge variant="outline" className="border-indigo-300/80 bg-indigo-50 px-2.5 py-0.5 rounded-full flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <Text className="text-[10px] font-black text-lavender uppercase tracking-wider">
                Épargne
              </Text>
            </Badge>
            <View className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200/70 items-center justify-center">
              <Ionicons name="sparkles-outline" size={14} color={colors.lavender} />
            </View>
          </View>

          <View className="my-0.5">
            <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
              {epargneFormatted}
            </Text>
            {!isEpargneMasked && epargneRoundFormatted && (
              <Text className="text-xs font-semibold text-slate-400 mt-0.5">
                ≈ {epargneRoundFormatted}
              </Text>
            )}
          </View>

          <View className="pt-2 border-t border-slate-100 flex-row items-center justify-between min-h-[24px]">
            <Text className="text-xs font-bold text-slate-700">Réserve & projets</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
}

