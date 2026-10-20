import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface HomeHeaderProps {
  isPrivate: boolean;
  selectedMonthFormatted?: string;
  selectedMonthOffset?: number;
  isSimulating?: boolean;
  differenceResteAVivre?: number;
  onNextMonth?: () => void;
  onPrevMonth?: () => void;
  onResetMonth?: () => void;
  onTogglePrivate: () => void;
  onOpenInfo: () => void;
}

export function HomeHeader({
  isPrivate,
  selectedMonthFormatted,
  selectedMonthOffset = 0,
  isSimulating = false,
  differenceResteAVivre,
  onNextMonth,
  onPrevMonth,
  onResetMonth,
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
    <View className="bg-primary px-4 sm:px-6 pt-2 pb-5 rounded-b-[28px] shadow-sm gap-2.5">
      {/* 1. LIGNE DU HAUT : MARQUE & ACTIONS */}
      <View className="flex-row justify-between items-center">
        {/* Marque FinTrack avec icône portefeuille */}
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 items-center justify-center">
            <Ionicons name="wallet" size={16} color={colors.accent} />
          </View>
          <Text className="text-xl font-extrabold text-white tracking-tight">
            <Text className="text-accent">Fin</Text>Track
          </Text>
        </View>

        {/* Actions (Masquer montants + Info) */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onTogglePrivate}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
            accessibilityLabel="Notifications et informations">
            <Ionicons name="notifications-outline" size={17} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BARRE DE NAVIGATION TEMPORELLE INTÉGRÉE & ERGONOMIQUE */}
      <View className="flex-row items-center justify-between bg-white/10 rounded-2xl px-2 py-1.5 border border-white/15">
        <TouchableOpacity
          onPress={onPrevMonth}
          disabled={selectedMonthOffset === 0}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Mois précédent"
          className={`w-8 h-8 rounded-xl items-center justify-center ${
            selectedMonthOffset === 0 ? 'opacity-25' : 'bg-white/15 active:bg-white/25'
          }`}>
          <Ionicons name="chevron-back" size={16} color="#ffffff" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2 flex-wrap justify-center">
          <Text className="text-xs sm:text-sm font-black text-white tracking-wide">
            {displayMonth}
          </Text>

          {isSimulating && (
            <View className="bg-indigo-500/40 border border-indigo-300/40 px-1.5 py-0.5 rounded-md">
              <Text className="text-[10px] font-black text-indigo-100">
                M+{selectedMonthOffset}
              </Text>
            </View>
          )}

          {isSimulating && differenceResteAVivre !== undefined && differenceResteAVivre !== 0 && (
            <View
              className={`px-1.5 py-0.5 rounded-md ${
                differenceResteAVivre > 0 ? 'bg-emerald-500/30' : 'bg-rose-500/30'
              }`}>
              <Text
                className={`text-[10px] font-black ${
                  differenceResteAVivre > 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                {differenceResteAVivre > 0 ? `+${Math.round(differenceResteAVivre)} €` : `${Math.round(differenceResteAVivre)} €`}
              </Text>
            </View>
          )}

          {isSimulating && onResetMonth && (
            <TouchableOpacity
              onPress={onResetMonth}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Revenir au mois en cours"
              className="bg-accent/25 px-2 py-0.5 rounded-lg border border-accent/40 active:bg-accent/40">
              <Text className="text-[10px] font-black text-accent">Ce mois</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onNextMonth}
          disabled={selectedMonthOffset >= 12}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Mois suivant"
          className={`w-8 h-8 rounded-xl items-center justify-center ${
            selectedMonthOffset >= 12 ? 'opacity-25' : 'bg-white/15 active:bg-white/25'
          }`}>
          <Ionicons name="chevron-forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
