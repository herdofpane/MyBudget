import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { colors } from '@/theme/colors';
import { CATEGORY_CONFIG } from '@/data';
import { formatEuro } from '@/constants/formatters';
import {
  getChargeScheduleStatus,
  formatMonthYear,
} from '@/utils/fixed-expenses';
import { getCreditProgress } from '@/utils/credit';
import { FixedExpenseItem, FixedCategoryType } from '@/types';

interface FixedExpenseRowProps {
  item: FixedExpenseItem;
  isEven: boolean;
  currentMonthStr: string;
  onAdvanceMonth: (item: FixedExpenseItem) => void;
  onEdit: (item: FixedExpenseItem) => void;
  onDelete: (id: string, label: string) => void;
}

export function FixedExpenseRow({
  item,
  isEven,
  currentMonthStr,
  onAdvanceMonth,
  onEdit,
  onDelete,
}: FixedExpenseRowProps) {
  const cat = CATEGORY_CONFIG[item.category as FixedCategoryType] || CATEGORY_CONFIG.autre;
  const isCredit = !!item.isCredit;
  const creditInfo = isCredit ? getCreditProgress(item) : null;
  const isExpired = creditInfo?.isExpired ?? false;
  const schedule = getChargeScheduleStatus(item, currentMonthStr);
  const isNotCounted = !schedule.isCounted;

  return (
    <View
      className={`flex-row items-center px-3.5 sm:px-4 py-3 border-b border-border/60 ${
        isExpired
          ? 'bg-slate-50/70 opacity-60'
          : isNotCounted
          ? 'bg-muted/20 opacity-75'
          : isEven
          ? 'bg-card'
          : 'bg-muted/10'
      }`}>
      {/* COLONNE 1 : CHARGE & CATÉGORIE & CRÉDIT */}
      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
        <View
          className="w-8 h-8 rounded-lg justify-center items-center shrink-0"
          style={{ backgroundColor: cat.bg }}>
          <Ionicons name={(item.icon || cat.icon) as any} size={16} color={cat.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Text
              className={`text-xs sm:text-sm font-bold text-foreground ${
                isExpired ? 'line-through text-muted-foreground' : ''
              }`}
              numberOfLines={1}>
              {item.label}
            </Text>

            {/* Badge Crédit */}
            {isCredit && (
              <Badge
                variant="outline"
                className={`px-1.5 py-0.5 rounded ${
                  isExpired
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                <Text
                  className={`text-[10px] font-bold ${
                    isExpired ? 'text-slate-500' : 'text-lavender'
                  }`}>
                  {isExpired ? 'Soldé' : `${creditInfo?.paid}/${creditInfo?.total}m`}
                </Text>
              </Badge>
            )}

            {/* Badge Planification */}
            {schedule.status !== 'active' && schedule.status !== 'credit_expired' && (
              <Badge
                variant="outline"
                className="px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: schedule.badgeBg,
                  borderColor: schedule.badgeBorder,
                }}>
                <Text
                  className="text-[10px] font-black"
                  style={{ color: schedule.badgeColor }}>
                  {schedule.badgeLabel}
                </Text>
              </Badge>
            )}
          </View>

          <Text className="text-[10px] sm:text-[11px] font-medium mt-0.5" style={{ color: cat.color }}>
            {cat.label}
            {isCredit && !isExpired && ` • Reste ${creditInfo?.remainingMonths} mois`}
            {!isCredit && schedule.status === 'upcoming' && ` • Dès ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
            {!isCredit && schedule.status === 'past' && ` • Était pour ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
            {!isCredit && schedule.status === 'only_month_active' && ' • Ce mois-ci uniquement'}
          </Text>

          {/* Progression du crédit */}
          {isCredit && !isExpired && (
            <View className="h-1 bg-muted rounded-full overflow-hidden mt-1 max-w-[100px]">
              <View
                className="h-full bg-accent rounded-full"
                style={{ width: `${creditInfo?.percent || 0}%` }}
              />
            </View>
          )}
        </View>
      </View>

      {/* COLONNE 2 : MONTANT */}
      <View className="items-end pr-2 shrink-0">
        <Text
          className={`text-xs sm:text-sm font-black ${
            isExpired ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}>
          -{formatEuro(item.amount)}
        </Text>
        {isExpired && (
          <Text className="text-[10px] text-muted-foreground font-semibold">0 € imputé</Text>
        )}
        {isNotCounted && !isExpired && (
          <Text className="text-[10px] text-muted-foreground font-semibold">Non imputé</Text>
        )}
        {isCredit && !isExpired && (
          <Text className="text-[10px] text-muted-foreground">
            Dû: {formatEuro(creditInfo?.remainingAmount || 0)}
          </Text>
        )}
      </View>

      {/* COLONNE 3 : ACTIONS */}
      <View className="w-20 sm:w-24 flex-row items-center justify-end gap-1 shrink-0">
        {isCredit && !isExpired && (
          <Button
            variant="ghost"
            size="icon"
            onPress={() => onAdvanceMonth(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-7 h-7 rounded-lg"
            accessibilityLabel={`Enregistrer +1 mois payé pour ${item.label}`}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
          </Button>
        )}
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
