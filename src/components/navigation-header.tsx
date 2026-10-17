import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export type NavRoute = 'index' | 'fixed-expenses' | 'variable-expenses' | 'details';

interface NavHeaderProps {
  currentRoute?: NavRoute;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function NavigationHeader({
  title,
  subtitle,
  actionButton,
}: NavHeaderProps) {
  return (
    <View className="px-3.5 sm:px-4 py-2 sm:py-3 bg-background w-full max-w-[960px] self-center">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-2">
          {subtitle ? (
            <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <Text className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-0.5">
            {title}
          </Text>
        </View>
        {actionButton ? <View className="ml-2 shrink-0">{actionButton}</View> : null}
      </View>
    </View>
  );
}
