import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';

interface HomeAccountsCardProps {
  checkingFormatted: string;
  epargneFormatted: string;
}

export function HomeAccountsCard({
  checkingFormatted,
  epargneFormatted,
}: HomeAccountsCardProps) {
  return (
    <View className="flex-row gap-2.5 sm:gap-3.5">
      {/* COMPTE COURANT */}
      <Card className="flex-1 bg-card rounded-3xl p-4 border border-border shadow-xs justify-between">
        <View>
          <View className="flex-row items-center justify-between mb-1.5">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-bold text-accent uppercase tracking-wider">
                Courant
              </Text>
            </Badge>
            <Ionicons name="card-outline" size={15} color={colors.accent} />
          </View>
          <Text className="text-xl sm:text-2xl font-black text-foreground tracking-tight my-0.5">
            {checkingFormatted}
          </Text>
        </View>
        <View className="pt-2 mt-2 border-t border-slate-100">
          <Text className="text-xs font-bold text-foreground">Dépenses de vie</Text>
          <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
            Alimentation & quotidien
          </Text>
        </View>
      </Card>

      {/* COMPTE ÉPARGNE */}
      <Card className="flex-1 bg-card rounded-3xl p-4 border border-border shadow-xs justify-between">
        <View>
          <View className="flex-row items-center justify-between mb-1.5">
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-bold text-lavender uppercase tracking-wider">
                Épargne
              </Text>
            </Badge>
            <Ionicons name="sparkles-outline" size={15} color={colors.lavender} />
          </View>
          <Text className="text-xl sm:text-2xl font-black text-foreground tracking-tight my-0.5">
            {epargneFormatted}
          </Text>
        </View>
        <View className="pt-2 mt-2 border-t border-slate-100">
          <Text className="text-xs font-bold text-foreground">Épargne Klyro</Text>
          <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
            Formule racine carrée
          </Text>
        </View>
      </Card>
    </View>
  );
}
