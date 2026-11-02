import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';
import { CATEGORY_CONFIG } from '@/data';
import { formatEuro } from '@/constants/formatters';
import {
  getChargeScheduleStatus,
  formatMonthYear,
} from '@/utils/fixed-expenses';
import { getCreditProgressInMonth } from '@/utils/credit';
import { FixedExpenseItem, FixedCategoryType } from '@/types';

interface FixedExpenseRowProps {
  item: FixedExpenseItem;
  isEven: boolean;
  currentMonthStr: string;
  baseMonthStr?: string;
  onAdvanceMonth: (item: FixedExpenseItem) => void;
  onEdit: (item: FixedExpenseItem) => void;
  onDelete: (id: string, label: string) => void;
}

export function FixedExpenseRow({
  item,
  isEven,
  currentMonthStr,
  baseMonthStr,
  onAdvanceMonth,
  onEdit,
  onDelete,
}: FixedExpenseRowProps) {
  const cat = CATEGORY_CONFIG[item.category as FixedCategoryType] || CATEGORY_CONFIG.autre;
  const isCredit = !!item.isCredit;
  const creditInfo = isCredit ? getCreditProgressInMonth(item, currentMonthStr, baseMonthStr) : null;
  const isExpired = creditInfo?.isExpired ?? false;
  const schedule = getChargeScheduleStatus(item, currentMonthStr, baseMonthStr);
  const isNotCounted = !schedule.isCounted;

  return (
    <View
      className={`flex-row items-center px-3.5 sm:px-4 py-3 border-b border-slate-100 ${
        isExpired
          ? 'bg-slate-50/60 opacity-60'
          : isNotCounted
          ? 'bg-slate-50/80 opacity-75'
          : isEven
          ? 'bg-card'
          : 'bg-slate-50/40'
      }`}>
      {/* COLONNE 1 : SQUIRCLE D'ICÔNE & INTITULÉ DE LA CHARGE (APPLE HIG) */}
      <View className="flex-1 flex-row items-center gap-3 pr-2">
        <View
          className="w-10 h-10 rounded-2xl justify-center items-center shrink-0 border border-black/[0.04] shadow-2xs"
          style={{ backgroundColor: cat.bg }}>
          <Ionicons name={(item.icon || cat.icon) as any} size={18} color={cat.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Text
              className={`text-xs sm:text-sm font-bold text-slate-800 ${
                isExpired ? 'line-through text-slate-400' : ''
              }`}
              numberOfLines={1}>
              {item.label}
            </Text>

            {/* Badge Crédit */}
            {isCredit && (
              <Badge
                variant="outline"
                className={`px-2 py-0.2 rounded-full ${
                  isExpired
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                <Text
                  className={`text-[9px] font-black uppercase tracking-wider ${
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
                className="px-2 py-0.2 rounded-full"
                style={{
                  backgroundColor: schedule.badgeBg,
                  borderColor: schedule.badgeBorder,
                }}>
                <Text
                  className="text-[9px] font-black uppercase tracking-wider"
                  style={{ color: schedule.badgeColor }}>
                  {schedule.badgeLabel}
                </Text>
              </Badge>
            )}
          </View>

          <Text className="text-[11px] font-semibold mt-0.5" style={{ color: cat.color }}>
            {cat.label}
            {isCredit && !isExpired && ` • Reste ${creditInfo?.remainingMonths} mois`}
            {!isCredit && schedule.status === 'upcoming' && ` • Dès ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
            {!isCredit && schedule.status === 'past' && ` • Était pour ${formatMonthYear(item.targetMonth || item.startMonth || '')}`}
            {!isCredit && schedule.status === 'only_month_active' && ' • Ce mois-ci uniquement'}
          </Text>

          {/* Barre de progression du crédit style capsule Apple */}
          {isCredit && !isExpired && (
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 max-w-[110px]">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${creditInfo?.percent || 0}%` }}
              />
            </View>
          )}
        </View>
      </View>

      {/* COLONNE 2 : MONTANT EN TYPOGRAPHIE SF PRO */}
      <View className="items-end pr-2 shrink-0">
        <Text
          className={`text-xs sm:text-sm font-black ${
            isExpired ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}>
          -{formatEuro(item.amount)}
        </Text>
        {isExpired && (
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">0 € imputé</Text>
        )}
        {isNotCounted && !isExpired && (
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Non imputé</Text>
        )}
        {isCredit && !isExpired && (
          <Text className="text-[10px] text-slate-400 font-medium">
            Dû: {formatEuro(creditInfo?.remainingAmount || 0)}
          </Text>
        )}
      </View>

      {/* COLONNE 3 : ACTIONS AVEC TOUCH TARGETS CONFORTABLES (APPLE HIG 44PT) */}
      <View className="w-20 sm:w-24 flex-row items-center justify-end gap-1.5 shrink-0">
        {isCredit && !isExpired && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => onAdvanceMonth(item)}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityRole="button"
            className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/80 items-center justify-center active:bg-emerald-100"
            accessibilityLabel={`Enregistrer +1 mois payé pour ${item.label}`}>
            <Ionicons name="checkmark-circle-outline" size={17} color={colors.accent} />
          </TouchableOpacity>
        )}

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

