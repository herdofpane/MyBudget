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
    <View className="px-4 py-3.5 bg-background w-full max-w-[960px] self-center">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          {subtitle ? (
            <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {subtitle}
            </Text>
          ) : null}
          <Text className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            {title}
          </Text>
        </View>
        {actionButton ? <View className="ml-3">{actionButton}</View> : null}
      </View>
    </View>
  );
}
