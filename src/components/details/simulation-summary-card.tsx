import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

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
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-4">
      {/* EN-TÊTE DU BILAN */}
      <View className="gap-1.5">
        <Text className="text-base sm:text-lg font-black text-foreground tracking-tight">
          {isMonthly ? 'Bilan Mensuel Calculé' : 'Bilan du Revenu Ponctuel'}
        </Text>
        <View className="bg-slate-100/80 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200/60">
          <Text className="text-[11px] sm:text-xs text-muted-foreground font-semibold leading-relaxed">
            {isMonthly
              ? `Revenu net (${formatEuro(currentIncome)}) − Charges fixes (${formatEuro(parsedMonthlyFixed)}) = Reste à vivre (${formatEuro(monthlyResteAVivre)})`
              : `Montant total ponctuel reçu : ${formatEuro(currentIncome)}`}
          </Text>
        </View>
      </View>

      {/* RÉSULTATS CLÉS (COMPTE COURANT | ÉPARGNE | NÉCESSAIRE) */}
      <View className="gap-2.5">
        <View className="flex-row gap-2.5 sm:gap-3">
          {/* Pilier 1 : Compte Courant */}
          <View className="flex-1 rounded-2xl p-3.5 sm:p-4 border border-emerald-200/90 bg-emerald-50/70 justify-between gap-2.5">
            <View className="flex-row items-center gap-1.5 self-start px-2 py-0.5 rounded-full border border-emerald-300 bg-white/90 shadow-2xs">
              <Ionicons name="card-outline" size={13} color={colors.accentDark} />
              <Text className="text-[11px] font-bold text-accentDark">Compte Courant</Text>
            </View>
            <View>
              <Text
                className="text-xl sm:text-2xl font-black text-accentDark tracking-tight"
                numberOfLines={1}
                adjustsFontSizeToFit>
                {formatEuro(currentChecking)}
              </Text>
              <Text className="text-xs font-semibold text-emerald-800/80 mt-0.5">
                ≈ {formatEuroRound(currentChecking)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-1 pt-1 border-t border-emerald-200/60">
              <Text className="text-[11px] text-emerald-700/90 font-medium">Dépenses de vie</Text>
              <View className="bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] text-emerald-900 font-bold">
                  {currentIncome > 0 ? formatPercent((currentChecking / currentIncome) * 100) : '0%'}
                </Text>
              </View>
            </View>
          </View>

          {/* Pilier 2 : Épargne */}
          <View className="flex-1 rounded-2xl p-3.5 sm:p-4 border border-indigo-200/90 bg-indigo-50/70 justify-between gap-2.5">
            <View className="flex-row items-center gap-1.5 self-start px-2 py-0.5 rounded-full border border-indigo-300 bg-white/90 shadow-2xs">
              <Ionicons name="sparkles-outline" size={13} color={colors.lavender} />
              <Text className="text-[11px] font-bold text-lavender">Épargne</Text>
            </View>
            <View>
              <Text
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  currentEpargne >= 0 ? 'text-lavender' : 'text-danger'
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {currentEpargne >= 0 ? '+' : ''}{formatEuro(currentEpargne)}
              </Text>
              <Text className="text-xs font-semibold text-indigo-700/80 mt-0.5">
                ≈ {currentEpargne >= 0 ? '+' : ''}{formatEuroRound(currentEpargne)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-1 pt-1 border-t border-indigo-200/60">
              <Text className="text-[11px] text-indigo-700/90 font-medium">Épargne conseillée</Text>
              <View className="bg-indigo-100/90 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] text-indigo-900 font-bold">
                  {currentIncome > 0 ? formatPercent((currentEpargne / currentIncome) * 100) : '0%'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pilier 3 : Seuil Nécessaire */}
        <View className="flex-row items-center justify-between rounded-2xl px-3.5 py-3 border border-slate-200/90 bg-slate-50/90">
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-200 items-center justify-center">
              <Ionicons name="cart-outline" size={15} color="#D97706" />
            </View>
            <View>
              <Text className="text-xs font-bold text-foreground">Total Nécessaire</Text>
              <Text className="text-[11px] text-muted-foreground">Seuil de survie minimum</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-sm sm:text-base font-black text-foreground">
              {formatEuro(currentNecessary)}
            </Text>
            <Text className="text-[11px] font-semibold text-muted-foreground">
              ≈ {formatEuroRound(currentNecessary)}
            </Text>
          </View>
        </View>
      </View>

      {/* BANDEAUX FORMULES ET CALCULS DÉTAILLÉS */}
      <View className="gap-2.5 pt-0.5">
        {/* BANDEAU 1 : CALCUL DU COMPTE COURANT */}
        <View className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100/90 gap-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="card-outline" size={16} color={colors.accent} />
            <Text className="text-xs font-bold text-foreground">
              Calcul du Compte Courant :{' '}
              <Text className="font-semibold text-accentDark">
                {isMonthly ? 'Reste à vivre − Épargne' : 'Montant ponctuel − Épargne'}
              </Text>
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground pl-6 leading-relaxed">
            = {formatEuro(currentBaseResteAVivre)} − {formatEuro(currentEpargne)} ={' '}
            <Text className="font-bold text-accentDark">{formatEuro(currentChecking)}</Text>
            <Text className="text-[11px] text-muted-foreground">
              {' '}(soit √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}))
            </Text>
          </Text>
        </View>

        {/* BANDEAU 2 : CALCUL DE L'ÉPARGNE */}
        <View className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100/90 gap-1.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="calculator-outline" size={16} color={colors.lavender} />
            <Text className="text-xs font-bold text-foreground">
              Calcul de l’Épargne :{' '}
              <Text className="font-semibold text-lavender">
                {isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} − √({isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} × Nécessaire)
              </Text>
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground pl-6 leading-relaxed">
            = {formatEuro(currentBaseResteAVivre)} − √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}) ={' '}
            <Text className="font-bold text-foreground">{formatEuro(currentEpargne)}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}
