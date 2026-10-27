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
  onOpenBackup?: () => void;
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
  onOpenBackup,
}: HomeHeaderProps) {
  const currentMonthYear = new Date()
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const displayMonth = selectedMonthFormatted
    ? selectedMonthFormatted.toUpperCase()
    : currentMonthYear;

  return (
    <View className="bg-primary px-4 sm:px-6 pt-3 pb-5 rounded-b-[32px] shadow-sm gap-3">
      {/* 1. TOP BAR : BRANDING & ACTIONS (APPLE HIG NAVIGATION BAR) */}
      <View className="flex-row justify-between items-center min-h-[44px]">
        {/* Logo & App Title */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 items-center justify-center shadow-xs">
            <Ionicons name="wallet-outline" size={20} color={colors.accent} />
          </View>
          <View>
            <Text className="text-xl font-black text-white tracking-tight leading-none">
              <Text className="text-accent">Fin</Text>Track
            </Text>
            <Text className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Budget & Épargne
            </Text>
          </View>
        </View>

        {/* Action Controls (Apple Circular Action Buttons, 44pt touch target) */}
        <View className="flex-row items-center gap-2">
          {onOpenBackup && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onOpenBackup}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
              accessibilityLabel="Sauvegarde et données">
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onTogglePrivate}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
            accessibilityLabel={isPrivate ? 'Afficher les montants' : 'Masquer les montants'}>
            <Ionicons
              name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onOpenInfo}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
            accessibilityLabel="Informations et aide">
            <Ionicons name="information-circle-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. APPLE-STYLE SEGMENTED MONTH CONTROLLER / STEPPER */}
      <View className="bg-white/10 rounded-2xl p-1.5 border border-white/15 flex-row items-center justify-between">
        {/* Previous Month Button (44pt accessible hit zone) */}
        <TouchableOpacity
          onPress={onPrevMonth}
          disabled={selectedMonthOffset === 0}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Mois précédent"
          className={`w-9 h-9 rounded-xl items-center justify-center ${
            selectedMonthOffset === 0 ? 'opacity-20' : 'bg-white/15 active:bg-white/25'
          }`}>
          <Ionicons name="chevron-back" size={17} color="#ffffff" />
        </TouchableOpacity>

        {/* Month Label & Dynamic Status Pills */}
        <View className="flex-row items-center gap-2 flex-wrap justify-center py-0.5">
          <Text className="text-xs sm:text-sm font-black text-white tracking-wider">
            {displayMonth}
          </Text>

          {isSimulating && (
            <View className="bg-indigo-500/40 border border-indigo-300/40 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-black text-indigo-100 uppercase tracking-wider">
                M+{selectedMonthOffset}
              </Text>
            </View>
          )}

          {isSimulating && differenceResteAVivre !== undefined && differenceResteAVivre !== 0 && (
            <View
              className={`px-2 py-0.5 rounded-full border ${
                differenceResteAVivre > 0
                  ? 'bg-emerald-500/30 border-emerald-400/40'
                  : 'bg-rose-500/30 border-rose-400/40'
              }`}>
              <Text
                className={`text-[10px] font-black ${
                  differenceResteAVivre > 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                {differenceResteAVivre > 0
                  ? `+${Math.round(differenceResteAVivre)} €`
                  : `${Math.round(differenceResteAVivre)} €`}
              </Text>
            </View>
          )}

          {isSimulating && onResetMonth && (
            <TouchableOpacity
              onPress={onResetMonth}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Revenir au mois en cours"
              className="bg-accent/25 px-2.5 py-0.5 rounded-full border border-accent/40 active:bg-accent/40">
              <Text className="text-[10px] font-black text-accent uppercase tracking-wider">
                Ce mois
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Next Month Button (44pt accessible hit zone) */}
        <TouchableOpacity
          onPress={onNextMonth}
          disabled={selectedMonthOffset >= 12}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Mois suivant"
          className={`w-9 h-9 rounded-xl items-center justify-center ${
            selectedMonthOffset >= 12 ? 'opacity-20' : 'bg-white/15 active:bg-white/25'
          }`}>
          <Ionicons name="chevron-forward" size={17} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

