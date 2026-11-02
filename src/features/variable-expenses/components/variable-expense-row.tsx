import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
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
      className={`flex-row items-center px-3.5 sm:px-4 py-3 border-b border-slate-100 ${
        isEven ? 'bg-card' : 'bg-slate-50/40'
      }`}>
      {/* COLONNE 1 : SQUIRCLE D'ICÔNE & INTITULÉ DE LA CHARGE (APPLE HIG) */}
      <View className="flex-1 flex-row items-center gap-3 pr-2">
        <View
          className="w-10 h-10 rounded-2xl justify-center items-center shrink-0 border border-black/[0.04] shadow-2xs"
          style={{ backgroundColor: `${item.color}15` }}>
          <Ionicons name={item.icon as any} size={18} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-xs sm:text-sm font-bold text-slate-800" numberOfLines={1}>
            {item.label}
          </Text>
          <Badge variant="outline" className="border-amber-200/90 bg-amber-50/90 gap-1 px-2 py-0.5 rounded-full self-start mt-1">
            <Ionicons name="calendar-outline" size={10} color="#D97706" />
            <Text className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              {formattedDuration}
            </Text>
          </Badge>
        </View>
      </View>

      {/* COLONNE 2 : MONTANTS TOTAL & LISSÉ (TYPOGRAPHIE SF PRO) */}
      <View className="items-end pr-2 shrink-0">
        <Text className="text-xs sm:text-sm font-black text-slate-900">
          -{formatEuro(total)}
        </Text>
        <Text className="text-[10px] sm:text-[11px] text-amber-800 font-bold mt-0.5">
          {formatEuro(monthly)}/m
        </Text>
      </View>

      {/* COLONNE 3 : ACTIONS (CIBLES TACTILES CONFORTABLES APPLE 44PT) */}
      <View className="w-16 flex-row items-center justify-end gap-1.5 shrink-0">
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => onEdit(item)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          accessibilityRole="button"
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center active:bg-slate-200"
          accessibilityLabel={`Modifier ${item.label}`}>
          <Ionicons name="pencil-outline" size={15} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => onDelete(item.id, item.label)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          accessibilityRole="button"
          className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200/80 items-center justify-center active:bg-rose-100"
          accessibilityLabel={`Supprimer ${item.label}`}>
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

