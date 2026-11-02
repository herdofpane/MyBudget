import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface SimulationTabsProps {
  isMonthly: boolean;
  onSelectTab: (tab: 'monthly' | 'onetime') => void;
}

export function SimulationTabs({ isMonthly, onSelectTab }: SimulationTabsProps) {
  return (
    <View className="flex-row bg-slate-200/80 p-1 rounded-2xl border border-slate-300/60 shadow-2xs">
      <TouchableOpacity
        onPress={() => onSelectTab('monthly')}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="tab"
        accessibilityState={{ selected: isMonthly }}
        className={`flex-1 flex-row justify-center items-center gap-2 min-h-[44px] py-2 rounded-xl transition-all ${
          isMonthly
            ? 'bg-white shadow-xs border border-slate-200/80'
            : 'bg-transparent'
        }`}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={isMonthly ? colors.primary : colors.textMuted}
        />
        <Text
          className={`text-xs ${
            isMonthly ? 'text-primary font-black' : 'text-slate-600 font-bold'
          }`}>
          Répartition Mensuelle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectTab('onetime')}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="tab"
        accessibilityState={{ selected: !isMonthly }}
        className={`flex-1 flex-row justify-center items-center gap-2 min-h-[44px] py-2 rounded-xl transition-all ${
          !isMonthly
            ? 'bg-white shadow-xs border border-slate-200/80'
            : 'bg-transparent'
        }`}>
        <Ionicons
          name="flash-outline"
          size={16}
          color={!isMonthly ? colors.accentDark : colors.textMuted}
        />
        <Text
          className={`text-xs ${
            !isMonthly ? 'text-accentDark font-black' : 'text-slate-600 font-bold'
          }`}>
          Revenu Ponctuel
        </Text>
      </TouchableOpacity>
    </View>
  );
}
