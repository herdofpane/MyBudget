import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface TabButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  activeColor: string;
  onPress: () => void;
}

function TabButton(props: TabButtonProps) {
  const { label, icon, isSelected, activeColor, onPress } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
      className={`flex-1 flex-row justify-center items-center gap-1.5 min-h-[34px] py-1.5 rounded-lg ${
        isSelected ? 'bg-white shadow-xs border border-slate-200/80' : 'bg-transparent'
      }`}>
      <Ionicons name={icon} size={14} color={isSelected ? activeColor : colors.textMuted} />
      <Text
        className={`text-xs ${isSelected ? 'font-black' : 'text-slate-600 font-bold'}`}
        style={isSelected ? { color: activeColor } : undefined}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface SimulationTabsProps {
  isMonthly: boolean;
  onSelectTab: (tab: 'monthly' | 'onetime') => void;
}

export function SimulationTabs({ isMonthly, onSelectTab }: SimulationTabsProps) {
  return (
    <View className="flex-row bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shadow-2xs">
      <TabButton
        label="Répartition Mensuelle"
        icon="calendar-outline"
        isSelected={isMonthly}
        activeColor={colors.primary}
        onPress={() => onSelectTab('monthly')}
      />
      <TabButton
        label="Revenu Ponctuel"
        icon="flash-outline"
        isSelected={!isMonthly}
        activeColor={colors.accentDark}
        onPress={() => onSelectTab('onetime')}
      />
    </View>
  );
}
