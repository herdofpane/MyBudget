import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/theme/colors';
import { formatEuro, formatPercent } from '@/constants/formatters';

interface SimulationSummaryCardProps {
  isMonthly: boolean;
  currentIncome: number;
  parsedMonthlyFixed: number;
  monthlyResteAVivre: number;
  currentChecking: number;
  currentEpargne: number;
  currentNecessary: number;
  currentBaseResteAVivre: number;
}

export function SimulationSummaryCard({
  isMonthly,
  currentIncome,
  parsedMonthlyFixed,
  monthlyResteAVivre,
  currentChecking,
  currentEpargne,
  currentNecessary,
  currentBaseResteAVivre,
}: SimulationSummaryCardProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
      <View>
        <Text className="text-base sm:text-lg font-black text-foreground">
          {isMonthly ? 'Bilan Mensuel Calculé' : 'Bilan du Revenu Ponctuel'}
        </Text>
        <Text className="text-xs text-muted-foreground font-semibold mt-0.5">
          {isMonthly
            ? `Revenu (${formatEuro(currentIncome)}) − Charges (${formatEuro(parsedMonthlyFixed)}) = Reste à vivre (${formatEuro(monthlyResteAVivre)})`
            : `Montant total ponctuel reçu : ${formatEuro(currentIncome)}`}
        </Text>
      </View>

      {/* RÉSULTATS CLÉS (COMPTE COURANT | ÉPARGNE | NÉCESSAIRE) */}
      <View className="gap-2.5">
        <View className="flex-row gap-2.5 sm:gap-3">
          {/* Pilier 1 : Compte Courant */}
          <View className="flex-1 rounded-2xl p-3 sm:p-3.5 border border-emerald-200 bg-emerald-50 justify-between">
            <Badge variant="outline" className="border-emerald-300 bg-emerald-100/60 self-start gap-1 px-1.5 py-0.5 mb-1 rounded-md">
              <Ionicons name="card-outline" size={12} color={colors.accentDark} />
              <Text className="text-[10px] sm:text-[11px] font-bold text-accentDark">Compte Courant</Text>
            </Badge>
            <Text
              className="text-lg sm:text-xl font-black text-accentDark my-1"
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatEuro(currentChecking)}
            </Text>
            <View className="flex-row items-center justify-between gap-1 flex-wrap">
              <Text className="text-[10px] sm:text-[11px] text-emerald-700/80 font-medium">Dépenses de vie</Text>
              <Badge variant="secondary" className="bg-emerald-100/70 border-0 px-1 py-0.2 rounded">
                <Text className="text-[9px] sm:text-[10px] text-emerald-800 font-bold">
                  {currentIncome > 0 ? formatPercent((currentChecking / currentIncome) * 100) : '0%'}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Pilier 2 : Épargne */}
          <View className="flex-1 rounded-2xl p-3 sm:p-3.5 border border-indigo-200 bg-indigo-50 justify-between">
            <Badge variant="outline" className="border-indigo-300 bg-indigo-100/60 self-start gap-1 px-1.5 py-0.5 mb-1 rounded-md">
              <Ionicons name="sparkles-outline" size={12} color={colors.lavender} />
              <Text className="text-[10px] sm:text-[11px] font-bold text-lavender">Épargne</Text>
            </Badge>
            <Text
              className={`text-lg sm:text-xl font-black my-1 ${
                currentEpargne >= 0 ? 'text-lavender' : 'text-danger'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {currentEpargne >= 0 ? '+' : ''}{formatEuro(currentEpargne)}
            </Text>
            <View className="flex-row items-center justify-between gap-1 flex-wrap">
              <Text className="text-[10px] sm:text-[11px] text-indigo-700/80 font-medium">Épargne Klyro</Text>
              <Badge variant="secondary" className="bg-indigo-100/70 border-0 px-1 py-0.2 rounded">
                <Text className="text-[9px] sm:text-[10px] text-indigo-800 font-bold">
                  {currentIncome > 0 ? formatPercent((currentEpargne / currentIncome) * 100) : '0%'}
                </Text>
              </Badge>
            </View>
          </View>
        </View>

        {/* Pilier 3 : Seuil Nécessaire */}
        <View className="flex-row items-center justify-between rounded-2xl px-3 py-2 sm:py-2.5 border border-slate-200 bg-slate-50">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-md bg-emerald-100/70 border border-emerald-200 items-center justify-center">
              <Ionicons name="cart-outline" size={13} color={colors.accentDark} />
            </View>
            <View>
              <Text className="text-xs font-bold text-foreground">Total Nécessaire</Text>
              <Text className="text-[10px] text-muted-foreground">Seuil de survie minimum</Text>
            </View>
          </View>
          <Text className="text-xs sm:text-sm font-black text-foreground">
            {formatEuro(currentNecessary)}
          </Text>
        </View>
      </View>

      {/* BANDEAUX FORMULES ET CALCULS DÉTAILLÉS */}
      <View className="gap-2 pt-1">
        {/* BANDEAU 1 : CALCUL DU COMPTE COURANT */}
        <View className="flex-row items-start bg-emerald-50/70 p-3 sm:p-3.5 rounded-2xl border border-emerald-100 gap-2.5">
          <Ionicons name="card-outline" size={18} color={colors.accent} className="mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-foreground">
              Calcul du Compte Courant :{' '}
              <Text className="font-semibold text-accentDark">
                {isMonthly ? 'Reste à vivre − Épargne' : 'Montant ponctuel − Épargne'}
              </Text>
            </Text>
            <Text className="text-[11px] text-muted-foreground mt-0.5">
              = {formatEuro(currentBaseResteAVivre)} − {formatEuro(currentEpargne)} ={' '}
              <Text className="font-bold text-accentDark">{formatEuro(currentChecking)}</Text>
              <Text className="text-[10px] text-muted-foreground">
                {' '}(soit √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}))
              </Text>
            </Text>
          </View>
        </View>

        {/* BANDEAU 2 : CALCUL DE L'ÉPARGNE */}
        <View className="flex-row items-start bg-indigo-50/70 p-3 sm:p-3.5 rounded-2xl border border-indigo-100 gap-2.5">
          <Ionicons name="calculator-outline" size={18} color={colors.lavender} className="mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-foreground">
              Calcul de l’Épargne :{' '}
              <Text className="font-semibold text-lavender">
                {isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} − √({isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} × Nécessaire)
              </Text>
            </Text>
            <Text className="text-[11px] text-muted-foreground mt-0.5">
              = {formatEuro(currentBaseResteAVivre)} − √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}) ={' '}
              <Text className="font-bold text-foreground">{formatEuro(currentEpargne)}</Text>
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
