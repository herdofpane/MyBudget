import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';

interface HomeBalanceCardProps {
  resteAVivreFormatted: string;
  resteAVivreRoundFormatted?: string;
  isSimulating?: boolean;
  selectedMonthLabel?: string;
  income?: number;
  fixedExpenses?: number;
  epargne?: number;
  onNavigateDetails: () => void;
  onNavigateFixedExpenses: () => void;
}

export function HomeBalanceCard({
  resteAVivreFormatted,
  resteAVivreRoundFormatted,
  isSimulating,
  selectedMonthLabel,
  income = 0,
  fixedExpenses = 0,
  epargne = 0,
  onNavigateDetails,
  onNavigateFixedExpenses,
}: HomeBalanceCardProps) {
  const isMasked = resteAVivreFormatted.includes('•');

  const hasIncome = income > 0;
  const fixedPercent = hasIncome ? Math.min(100, Math.max(0, Math.round((fixedExpenses / income) * 100))) : 0;
  const epargnePercent = hasIncome ? Math.min(100 - fixedPercent, Math.max(0, Math.round((epargne / income) * 100))) : 0;
  const livingPercent = hasIncome ? Math.max(0, 100 - fixedPercent - epargnePercent) : 0;

  return (
    <Card className="bg-card rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200/90 shadow-sm gap-1">
      {/* 1. EN-TÊTE : BADGE D'ÉTAT & TITRE SF PRO */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <Text className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isSimulating ? 'Reste à vivre prévisionnel' : 'Reste à vivre disponible'}
          </Text>
        </View>

        {isSimulating && selectedMonthLabel ? (
          <Badge variant="outline" className="bg-indigo-50/90 border-indigo-200/90 px-1.5 py-0.2 rounded-full">
            <Text className="text-[9px] font-black text-lavender uppercase tracking-wider">
              {selectedMonthLabel}
            </Text>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-50/90 border-emerald-200/90 px-1.5 py-0.2 rounded-full flex-row items-center gap-1">
            <Ionicons name="sparkles" size={10} color={colors.accent} />
            <Text className="text-[9px] font-bold text-accent uppercase tracking-wider">Budget actif</Text>
          </Badge>
        )}
      </View>

      {/* 2. MONTANT HÉROÏQUE COMPACT (ARRONDI + PRÉCIS ALIGNÉS) */}
      <View className="flex-row items-baseline justify-between gap-2">
        <Text className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
          {resteAVivreRoundFormatted || resteAVivreFormatted}
        </Text>
        {!isMasked && resteAVivreFormatted && (
          <Text className="text-[11px] font-semibold text-slate-400">
            Précis : {resteAVivreFormatted}
          </Text>
        )}
      </View>

      {/* 3. JAUGE DE RÉPARTITION BUDGÉTAIRE */}
      {hasIncome && !isMasked && (
        <View className="pt-1 border-t border-slate-100 gap-0.5">
          <View className="h-1.5 w-full bg-slate-100 rounded-full flex-row overflow-hidden p-0.5 gap-0.5">
            {fixedPercent > 0 && (
              <View
                style={{ width: `${fixedPercent}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            )}
            {epargnePercent > 0 && (
              <View
                style={{ width: `${epargnePercent}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            )}
            {livingPercent > 0 && (
              <View
                style={{ width: `${livingPercent}%` }}
                className="h-full bg-teal-400 rounded-full"
              />
            )}
          </View>

          <View className="flex-row justify-between items-center px-0.5">
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <Text className="text-[9px] text-slate-500 font-semibold">
                Fixes {fixedPercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-[9px] text-slate-500 font-semibold">
                Épargne {epargnePercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <Text className="text-[9px] text-slate-500 font-semibold">
                Vie {livingPercent}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. ACTIONS RAPIDES (44PT ACCESSIBLE VIA HITSLOP) */}
      <View className="flex-row gap-2 pt-1 border-t border-slate-100">
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onNavigateFixedExpenses}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Consulter et ajuster vos charges fixes"
          className="flex-1 min-h-[32px] flex-row items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-slate-100/80 border border-slate-200/80 active:bg-slate-200/70">
          <Ionicons name="calendar-outline" size={13} color={colors.lavender} />
          <Text className="text-[11px] sm:text-xs font-bold text-slate-800">Charges Fixes</Text>
          <Ionicons name="chevron-forward" size={11} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onNavigateDetails}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le détail des calculs et la simulation"
          className="flex-1 min-h-[32px] flex-row items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-emerald-50 border border-emerald-200/80 active:bg-emerald-100/80">
          <Ionicons name="bar-chart-outline" size={13} color={colors.accentDark} />
          <Text className="text-[11px] sm:text-xs font-bold text-accentDark" numberOfLines={1}>
            Détails du calcul
          </Text>
          <Ionicons name="chevron-forward" size={11} color={colors.accentDark} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}
