import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';

interface HomeBalanceCardProps {
  totalBalanceFormatted: string;
  resteAVivreFormatted: string;
  onNavigateDetails: () => void;
  onNavigateFixedExpenses: () => void;
}

export function HomeBalanceCard({
  totalBalanceFormatted,
  resteAVivreFormatted,
  onNavigateDetails,
  onNavigateFixedExpenses,
}: HomeBalanceCardProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-sm">
      <View>
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Balance
            </Text>
            <Text className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">
              {totalBalanceFormatted}
            </Text>
          </View>

          {/* Actions Rapides Carte (Graph & Wallet Icons) */}
          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateDetails}
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center">
              <Ionicons name="bar-chart-outline" size={15} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateFixedExpenses}
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center">
              <Ionicons name="wallet-outline" size={15} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge de Progression Positive (+3.2% Today style mockup) */}
        <View className="flex-row items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <Ionicons name="trending-up" size={12} color={colors.accent} />
            <Text className="text-xs font-extrabold text-accent">
              {"+3.2% Aujourd'hui"}
            </Text>
          </Badge>
          <Text className="text-[11px] text-muted-foreground">
            Reste à vivre : {resteAVivreFormatted}
          </Text>
        </View>
      </View>
    </Card>
  );
}
