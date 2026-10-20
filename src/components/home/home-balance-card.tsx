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
    <Card className="bg-card rounded-2xl p-3.5 sm:p-4 border border-border/80 shadow-xs gap-2">
      {/* 1. ENTÊTE DE LA CARTE : BADGE D'ÉTAT & INTITULÉ */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {isSimulating ? 'Reste à vivre simulé' : 'Reste à vivre disponible'}
          </Text>
        </View>

        {isSimulating && selectedMonthLabel ? (
          <Badge variant="outline" className="bg-indigo-50 border-indigo-200 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-black text-lavender uppercase tracking-wide">
              {selectedMonthLabel}
            </Text>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <Ionicons name="sparkles" size={10} color={colors.accent} />
            <Text className="text-[10px] font-bold text-accent">Budget actif</Text>
          </Badge>
        )}
      </View>

      {/* 2. MONTANT PRINCIPAL */}
      <View className="flex-row items-baseline gap-2 flex-wrap my-0.5">
        <Text className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          {resteAVivreFormatted}
        </Text>
        {!isMasked && resteAVivreRoundFormatted && (
          <Text className="text-xs sm:text-sm font-semibold text-muted-foreground">
            (≈ {resteAVivreRoundFormatted})
          </Text>
        )}
      </View>

      {/* 3. JAUGE VISUELLE DE RÉPARTITION (SI REVENU DISPONIBLE) */}
      {hasIncome && !isMasked && (
        <View className="pt-1.5 border-t border-border/40 gap-1.5">
          {/* Segmented Progress Bar */}
          <View className="h-2 w-full bg-slate-100 rounded-full flex-row overflow-hidden">
            {fixedPercent > 0 && (
              <View
                style={{ width: `${fixedPercent}%` }}
                className="h-full bg-indigo-500 rounded-l-full"
              />
            )}
            {epargnePercent > 0 && (
              <View
                style={{ width: `${epargnePercent}%` }}
                className="h-full bg-emerald-500"
              />
            )}
            {livingPercent > 0 && (
              <View
                style={{ width: `${livingPercent}%` }}
                className="h-full bg-teal-400 rounded-r-full"
              />
            )}
          </View>

          {/* Légende ergonomique */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <Text className="text-[10px] text-muted-foreground font-medium">
                Fixes {fixedPercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-[10px] text-muted-foreground font-medium">
                Épargne {epargnePercent}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <Text className="text-[10px] text-muted-foreground font-medium">
                Vie {livingPercent}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. ACTIONS RAPIDES & ERGONOMIQUES (TOUCH TARGETS CONFORTABLES) */}
      <View className="flex-row gap-2 pt-1 border-t border-border/40">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateFixedExpenses}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Consulter et ajuster vos charges fixes"
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200/80 active:bg-slate-100">
          <Ionicons name="calendar-outline" size={14} color={colors.lavender} />
          <Text className="text-xs font-bold text-foreground">Charges Fixes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateDetails}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la ventilation détaillée et les simulations"
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 active:bg-emerald-100/70">
          <Ionicons name="bar-chart-outline" size={14} color={colors.accentDark} />
          <Text className="text-xs font-bold text-accentDark">Ventilation</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
