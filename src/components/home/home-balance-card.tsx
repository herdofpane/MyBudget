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

  // Calcul des proportions pour la barre visuelle de ventilation budgétaire
  const hasIncome = income > 0;
  const fixedPercent = hasIncome ? Math.min(100, Math.max(0, Math.round((fixedExpenses / income) * 100))) : 0;
  const epargnePercent = hasIncome ? Math.min(100 - fixedPercent, Math.max(0, Math.round((epargne / income) * 100))) : 0;
  const livingPercent = hasIncome ? Math.max(0, 100 - fixedPercent - epargnePercent) : 0;

  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm gap-3">
      {/* 1. EN-TÊTE : BADGE D'ÉTAT & TITRE SF PRO (APPLE HIG CAPSULE) */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isSimulating ? 'Reste à vivre prévisionnel' : 'Reste à vivre disponible'}
          </Text>
        </View>

        {isSimulating && selectedMonthLabel ? (
          <Badge variant="outline" className="bg-indigo-50/90 border-indigo-200/90 px-2.5 py-0.5 rounded-full">
            <Text className="text-[10px] font-black text-lavender uppercase tracking-wider">
              {selectedMonthLabel}
            </Text>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-50/90 border-emerald-200/90 px-2.5 py-0.5 rounded-full flex-row items-center gap-1.5">
            <Ionicons name="sparkles" size={11} color={colors.accent} />
            <Text className="text-[10px] font-bold text-accent uppercase tracking-wider">Budget actif</Text>
          </Badge>
        )}
      </View>

      {/* 2. MONTANT HÉROÏQUE TYPE APPLE CARD (ARRONDI PRIORITAIRE) */}
      <View className="gap-1 my-0.5">
        <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
          {resteAVivreRoundFormatted || resteAVivreFormatted}
        </Text>
        {!isMasked && resteAVivreFormatted && (
          <Text className="text-xs sm:text-sm font-semibold text-slate-400">
            Précis : {resteAVivreFormatted}
          </Text>
        )}
      </View>

      {/* 3. JAUGE DE RÉPARTITION BUDGÉTAIRE INSPIRÉE D'APPLE FITNESS / HEALTH */}
      {hasIncome && !isMasked && (
        <View className="pt-2 border-t border-slate-100 gap-2">
          {/* Segmented Pill Progress Bar */}
          <View className="h-2.5 w-full bg-slate-100 rounded-full flex-row overflow-hidden p-0.5 gap-1">
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

          {/* Légende ergonomique avec indicateurs colorés */}
          <View className="flex-row justify-between items-center px-0.5">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-indigo-500" />
              <Text className="text-[11px] text-slate-500 font-semibold">
                Fixes {fixedPercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-[11px] text-slate-500 font-semibold">
                Épargne {epargnePercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-teal-400" />
              <Text className="text-[11px] text-slate-500 font-semibold">
                Vie {livingPercent}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. ACTIONS RAPIDES TINTED BUTTONS (APPLE HIG 44PT MINIMUM TOUCH TARGET) */}
      <View className="flex-row gap-2.5 pt-2 border-t border-slate-100">
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onNavigateFixedExpenses}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Consulter et ajuster vos charges fixes"
          className="flex-1 min-h-[44px] flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 active:bg-slate-200/70">
          <Ionicons name="calendar-outline" size={16} color={colors.lavender} />
          <Text className="text-xs font-bold text-slate-800">Charges Fixes</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onNavigateDetails}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le détail des calculs et la simulation"
          className="flex-1 min-h-[44px] flex-row items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 active:bg-emerald-100/80">
          <Ionicons name="bar-chart-outline" size={16} color={colors.accentDark} />
          <Text className="text-xs font-bold text-accentDark" numberOfLines={1}>
            Détails du calcul
          </Text>
          <Ionicons name="chevron-forward" size={13} color={colors.accentDark} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

