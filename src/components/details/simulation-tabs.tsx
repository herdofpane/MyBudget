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
    <View className="flex-row bg-slate-100 p-1 rounded-2xl gap-1">
      <TouchableOpacity
        onPress={() => onSelectTab('monthly')}
        activeOpacity={0.8}
        className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-xl ${
          isMonthly ? 'bg-primary shadow-xs' : ''
        }`}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={isMonthly ? '#ffffff' : colors.textMuted}
        />
        <Text
          className={`text-xs ${
            isMonthly ? 'text-white font-extrabold' : 'text-muted-foreground font-bold'
          }`}>
          Mensuelle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectTab('onetime')}
        activeOpacity={0.8}
        className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-xl ${
          !isMonthly ? 'bg-primary shadow-xs' : ''
        }`}>
        <Ionicons
          name="flash-outline"
          size={16}
          color={!isMonthly ? '#ffffff' : colors.textMuted}
        />
        <Text
          className={`text-xs ${
            !isMonthly ? 'text-white font-extrabold' : 'text-muted-foreground font-bold'
          }`}>
          Revenu Ponctuel
        </Text>
      </TouchableOpacity>
    </View>
  );
}
