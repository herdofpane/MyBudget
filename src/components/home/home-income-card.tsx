import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { colors } from '@/theme/colors';

interface HomeIncomeCardProps {
  incomeInput: string;
  onIncomeChange: (val: string) => void;
  onIncomeBlur: () => void;
  onSubmitEditing?: () => void;
}

export function HomeIncomeCard({
  incomeInput,
  onIncomeChange,
  onIncomeBlur,
  onSubmitEditing,
}: HomeIncomeCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-4 border border-border shadow-xs">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cash-outline" size={17} color={colors.accent} />
          <Text className="text-xs font-bold text-foreground">Revenu Mensuel Net</Text>
        </View>
        <Badge variant="outline" className="border-border bg-muted/40 px-1.5 py-0 rounded">
          <Text className="text-[10px] font-semibold text-muted-foreground">Ajustable</Text>
        </Badge>
      </View>

      <View className="flex-row items-baseline bg-muted/30 rounded-xl px-3 py-1.5 border border-border">
        <Input
          value={incomeInput}
          onChangeText={onIncomeChange}
          onBlur={onIncomeBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="done"
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          className="flex-1 text-lg font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0.5 h-auto"
        />
        <Text className="text-xs font-bold text-muted-foreground ml-2">
          € / mois
        </Text>
      </View>
    </Card>
  );
}
