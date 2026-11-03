import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

export type NavRoute = 'index' | 'fixed-expenses' | 'variable-expenses' | 'details';

interface NavHeaderProps {
  currentRoute?: NavRoute;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function NavigationHeader({
  title,
  subtitle,
  icon,
  badge,
  actionButton,
}: NavHeaderProps) {
  return (
    <View className="bg-primary px-4 sm:px-6 pt-2 pb-3.5 rounded-b-[26px] shadow-sm w-full">
      <View className="flex-row justify-between items-center w-full max-w-[860px] self-center">
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          {icon ? (
            <View className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 items-center justify-center shrink-0">
              <Ionicons name={icon} size={16} color={colors.accent} />
            </View>
          ) : null}

          <View className="flex-1">
            {subtitle ? (
              <Text className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wider" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="text-lg sm:text-xl font-black text-white tracking-tight">
                {title}
              </Text>
              {badge}
            </View>
          </View>
        </View>

        {actionButton ? <View className="shrink-0">{actionButton}</View> : null}
      </View>
    </View>
  );
}
