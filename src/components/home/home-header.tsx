import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface HomeHeaderProps {
  isPrivate: boolean;
  selectedMonthFormatted?: string;
  isSimulating?: boolean;
  simulationOffset?: number;
  onTogglePrivate: () => void;
  onOpenInfo: () => void;
}

export function HomeHeader({
  isPrivate,
  selectedMonthFormatted,
  isSimulating,
  simulationOffset,
  onTogglePrivate,
  onOpenInfo,
}: HomeHeaderProps) {
  const currentMonthYear = new Date()
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const displayMonth = selectedMonthFormatted
    ? selectedMonthFormatted.toUpperCase()
    : currentMonthYear;

  return (
    <View className="bg-primary px-4 sm:px-6 pt-3 pb-8 rounded-b-[36px] shadow-md">
      <View className="flex-row justify-between items-center mb-4">
        {/* Marque Klyro avec typographie moderne et accent vert */}
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 items-center justify-center">
            <Ionicons name="wallet" size={17} color={colors.accent} />
          </View>
          <Text className="text-xl font-extrabold text-white tracking-tight">
            <Text className="text-accent">Fin</Text>Track{' '}
            <Text className="text-xs font-semibold text-slate-400">by Klyro</Text>
          </Text>
        </View>

        {/* Actions Header (Privacy Eye + Notifications) */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onTogglePrivate}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center"
            accessibilityLabel="Masquer ou afficher les montants">
            <Ionicons
              name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
              size={17}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenInfo}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center"
            accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={17} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGE D'ACCUEIL SUBTIL AVEC BADGE SIMULATION */}
      <View className="flex-row items-center gap-2 flex-wrap">
        <Text className="text-xs font-medium text-slate-300">
          {`VUE D'ENSEMBLE BUDGÉTAIRE • ${displayMonth}`}
        </Text>
        {isSimulating && simulationOffset !== undefined && (
          <View className="bg-indigo-500/30 border border-indigo-400/50 px-1.5 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-indigo-200">
              M+{simulationOffset}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
