import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';

interface SimulationControlsCardProps {
  isMonthly: boolean;
  income: number;
  totalFixedExpenses: number;
  totalEstimatedVariable?: number;
  isNecessaryModifiedFromDefault?: boolean;
  monthlyNecessaryInput: string;
  oneTimeAmountInput: string;
  oneTimeNecessaryInput: string;
  isSaving: boolean;
  onReset: () => void;
  onNavigateHome: () => void;
  onNavigateFixedExpenses: () => void;
  onNavigateVariableExpenses?: () => void;
  onChangeMonthlyNecessary: (val: string) => void;
  onResetMonthlyNecessaryToDefault?: () => void;
  onChangeOneTimeAmount: (val: string) => void;
  onChangeOneTimeNecessary: (val: string) => void;
  onApplyBudget: () => void;
}

export function SimulationControlsCard({
  isMonthly,
  income,
  totalFixedExpenses,
  totalEstimatedVariable = 0,
  isNecessaryModifiedFromDefault = false,
  monthlyNecessaryInput,
  oneTimeAmountInput,
  oneTimeNecessaryInput,
  isSaving,
  onReset,
  onNavigateHome,
  onNavigateFixedExpenses,
  onNavigateVariableExpenses,
  onChangeMonthlyNecessary,
  onResetMonthlyNecessaryToDefault,
  onChangeOneTimeAmount,
  onChangeOneTimeNecessary,
  onApplyBudget,
}: SimulationControlsCardProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-4">
      {/* EN-TÊTE DE LA CARTE DE CONTRÔLE */}
      <View className="flex-row items-center gap-2.5 sm:gap-3 justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-1">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
            <Ionicons name="options-outline" size={19} color={colors.lavender} />
          </View>
          <View className="flex-1">
            <Text className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Ajuster la simulation
            </Text>
            <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
              {isMonthly
                ? 'Revenu, charges et seuil de survie'
                : 'Montant ponctuel et seuil minimum'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Rétablir les réglages par défaut"
          className="flex-row items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full border border-slate-200/90 bg-slate-100/80 active:bg-slate-200 shrink-0">
          <Ionicons name="refresh-outline" size={13} color={colors.textMuted} />
          <Text className="text-xs font-semibold text-muted-foreground">Standard</Text>
        </TouchableOpacity>
      </View>

      {/* CHAMPS SELON LE MODE */}
      <View className="gap-3">
        {isMonthly ? (
          <>
            {/* 1. REVENU MENSUEL (Issu de l'Accueil) */}
            <View className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <View className="w-5 h-5 rounded-md bg-emerald-100/80 items-center justify-center">
                    <Ionicons name="cash-outline" size={12} color={colors.accent} />
                  </View>
                  <Text className="text-xs font-bold text-foreground">Revenu net mensuel</Text>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-1.5 py-0 rounded-md">
                    <Text className="text-[10px] font-semibold text-accent">Accueil</Text>
                  </Badge>
                </View>
                <Text className="text-base sm:text-lg font-black text-foreground">
                  {formatEuro(income)}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5">
                  Modifiable depuis le tableau de bord Accueil
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={onNavigateHome}
                accessibilityRole="button"
                accessibilityLabel="Modifier le revenu mensuel"
                className="px-3 py-1.5 min-h-[36px] rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center gap-1 active:bg-emerald-100">
                <Text className="text-xs font-bold text-accent">Modifier</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>

            {/* 2. CHARGES FIXES */}
            <View className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <View className="w-5 h-5 rounded-md bg-indigo-100/80 items-center justify-center">
                    <Ionicons name="calendar-outline" size={12} color={colors.lavender} />
                  </View>
                  <Text className="text-xs font-bold text-foreground">Charges fixes</Text>
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-1.5 py-0 rounded-md">
                    <Text className="text-[10px] font-semibold text-lavender">Charges Fixes</Text>
                  </Badge>
                </View>
                <Text className="text-base sm:text-lg font-black text-foreground">
                  {formatEuro(totalFixedExpenses)}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5">
                  Total récurrent calculé automatiquement
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={onNavigateFixedExpenses}
                accessibilityRole="button"
                accessibilityLabel="Gérer les charges fixes"
                className="px-3 py-1.5 min-h-[36px] rounded-full bg-indigo-50 border border-indigo-200 flex-row items-center gap-1 active:bg-indigo-100">
                <Text className="text-xs font-bold text-lavender">Gérer</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.lavender} />
              </TouchableOpacity>
            </View>

            {/* 3. TOTAL NÉCESSAIRE */}
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between flex-wrap gap-1">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-5 h-5 rounded-md bg-amber-100/80 items-center justify-center">
                    <Ionicons name="pie-chart-outline" size={12} color="#D97706" />
                  </View>
                  <Text className="text-xs font-bold text-foreground">Total Nécessaire (Seuil survie) (€)</Text>
                </View>
                {isNecessaryModifiedFromDefault ? (
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-semibold text-lavender">Personnalisé</Text>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-semibold text-amber-700">Par défaut (Charges variables)</Text>
                  </Badge>
                )}
              </View>

              <Input
                value={monthlyNecessaryInput}
                onChangeText={(v) => onChangeMonthlyNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder={totalEstimatedVariable.toString()}
                placeholderTextColor={colors.textMuted}
                className="bg-slate-100/80 border-slate-200/90 rounded-2xl px-4 py-2.5 text-base font-bold text-foreground min-h-[48px]"
              />

              <View className="gap-1 mt-0.5">
                <Text className="text-[11px] text-muted-foreground leading-relaxed">
                  Égal par défaut au montant de vos charges variables ({formatEuro(totalEstimatedVariable)}/mois), mais modifiable librement pour simuler un autre seuil.
                </Text>
                {isNecessaryModifiedFromDefault && onResetMonthlyNecessaryToDefault && (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    onPress={onResetMonthlyNecessaryToDefault}
                    accessibilityRole="button"
                    accessibilityLabel="Rétablir le montant des charges variables"
                    className="self-start flex-row items-center gap-1.5 mt-0.5 px-3 py-1.5 min-h-[34px] rounded-full bg-amber-50 border border-amber-200/90 active:bg-amber-100">
                    <Ionicons name="refresh-outline" size={12} color="#D97706" />
                    <Text className="text-[11px] font-semibold text-amber-800">
                      Rétablir le montant ({formatEuro(totalEstimatedVariable)})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* REVENU PONCTUEL */}
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <View className="w-5 h-5 rounded-md bg-emerald-100/80 items-center justify-center">
                  <Ionicons name="flash-outline" size={12} color={colors.accent} />
                </View>
                <Text className="text-xs font-bold text-foreground">Montant du revenu ponctuel (€)</Text>
              </View>
              <Input
                value={oneTimeAmountInput}
                onChangeText={(v) => onChangeOneTimeAmount(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                className="bg-slate-100/80 border-slate-200/90 rounded-2xl px-4 py-2.5 text-base font-bold text-foreground min-h-[48px]"
              />
            </View>

            {/* NÉCESSAIRE SUR REVENU PONCTUEL */}
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <View className="w-5 h-5 rounded-md bg-amber-100/80 items-center justify-center">
                  <Ionicons name="pie-chart-outline" size={12} color="#D97706" />
                </View>
                <Text className="text-xs font-bold text-foreground">Part Nécessaire (Seuil survie) (€)</Text>
              </View>
              <Input
                value={oneTimeNecessaryInput}
                onChangeText={(v) => onChangeOneTimeNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                className="bg-slate-100/80 border-slate-200/90 rounded-2xl px-4 py-2.5 text-base font-bold text-foreground min-h-[48px]"
              />
            </View>
          </>
        )}
      </View>

      {/* BOUTON ENREGISTRER / APPLIQUER */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onApplyBudget}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={
          isMonthly
            ? 'Appliquer comme budget officiel'
            : 'Enregistrer ce revenu ponctuel'
        }
        className={`flex-row items-center justify-center bg-primary rounded-2xl py-3.5 px-4 min-h-[50px] gap-2 shadow-sm active:bg-slate-800 ${
          isSaving ? 'opacity-70' : ''
        }`}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" className="mr-1.5" />
        ) : (
          <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
        )}
        <Text className="text-xs sm:text-sm font-bold text-white tracking-wide">
          {isSaving
            ? 'Enregistrement...'
            : isMonthly
            ? 'Appliquer comme budget officiel'
            : 'Enregistrer ce revenu ponctuel'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}
