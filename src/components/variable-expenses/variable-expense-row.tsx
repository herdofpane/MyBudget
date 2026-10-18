import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';
import { VariableCategory } from '@/types';

interface VariableExpenseRowProps {
  item: VariableCategory;
  isEven: boolean;
  onEdit: (item: VariableCategory) => void;
  onDelete: (id: string, label: string) => void;
}

export function VariableExpenseRow({
  item,
  isEven,
  onEdit,
  onDelete,
}: VariableExpenseRowProps) {
  const total = item.totalAmount !== undefined ? item.totalAmount : item.estimatedBudget;
  const duration = Math.max(0.01, item.durationMonths || 1);
  const monthly = item.estimatedBudget || Math.round((total / duration) * 100) / 100;
  const formattedDuration = Number.isInteger(duration)
    ? `${duration} mois`
    : `${duration.toString().replace('.', ',')} mois`;

  return (
    <View
      className={`flex-row items-center px-3.5 sm:px-4 py-3 border-b border-border/60 ${
        isEven ? 'bg-card' : 'bg-muted/10'
      }`}>
      {/* COLONNE 1 : TITRE & BADGE DURÉE EN DESSOUS */}
      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
        <View
          className="w-8 h-8 rounded-lg justify-center items-center shrink-0"
          style={{ backgroundColor: `${item.color}15` }}>
          <Ionicons name={item.icon as any} size={16} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-xs sm:text-sm font-bold text-foreground" numberOfLines={1}>
            {item.label}
          </Text>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 gap-1 px-1.5 py-0.5 rounded-md self-start mt-1">
            <Ionicons name="calendar-outline" size={10} color="#D97706" />
            <Text className="text-[10px] font-semibold text-amber-800">
              {formattedDuration}
            </Text>
          </Badge>
        </View>
      </View>

      {/* COLONNE 2 : MONTANTS TOTAL & LISSÉ */}
      <View className="items-end pr-2 shrink-0">
        <Text className="text-xs sm:text-sm font-black text-foreground">
          -{formatEuro(total)}
        </Text>
        <Text className="text-[10px] sm:text-[11px] text-amber-800 font-semibold mt-0.5">
          {formatEuro(monthly)}/m
        </Text>
      </View>

      {/* COLONNE 3 : ACTIONS (MODIFIER / SUPPRIMER) */}
      <View className="w-16 flex-row items-center justify-end gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onPress={() => onEdit(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-7 h-7 rounded-lg"
          accessibilityLabel={`Modifier ${item.label}`}>
          <Ionicons name="pencil-outline" size={15} color={colors.textMuted} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => onDelete(item.id, item.label)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-7 h-7 rounded-lg"
          accessibilityLabel={`Supprimer ${item.label}`}>
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
        </Button>
      </View>
    </View>
  );
}
