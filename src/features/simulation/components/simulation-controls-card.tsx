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
  onChangeMonthlyNecessary,
  onResetMonthlyNecessaryToDefault,
  onChangeOneTimeAmount,
  onChangeOneTimeNecessary,
  onApplyBudget,
}: SimulationControlsCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3 sm:p-3.5 border border-border shadow-xs gap-2">
      {/* EN-TÊTE DE LA CARTE DE CONTRÔLE */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1 pr-1">
          <View className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
            <Ionicons name="options-outline" size={13} color={colors.lavender} />
          </View>
          <Text className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            Ajuster la simulation
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Rétablir les réglages par défaut"
          className="flex-row items-center gap-1 px-2.5 py-1 min-h-[30px] rounded-full border border-slate-200/90 bg-slate-100/80 active:bg-slate-200 shrink-0">
          <Ionicons name="refresh-outline" size={11} color={colors.textMuted} />
          <Text className="text-[11px] font-semibold text-muted-foreground">Standard</Text>
        </TouchableOpacity>
      </View>

      {/* CHAMPS INTERACTIFS COMPACTS */}
      {isMonthly ? (
        <View className="gap-1.5">
          {/* Ligne récapitulative Revenu & Charges */}
          <View className="flex-row items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Text className="text-[10px] text-muted-foreground">
              Revenu : <Text className="font-bold text-slate-800">{formatEuro(income)}</Text>
            </Text>
            <Text className="text-[10px] text-muted-foreground">
              Charges fixes : <Text className="font-bold text-slate-800">{formatEuro(totalFixedExpenses)}</Text>
            </Text>
          </View>

          {/* Saisie Seuil Nécessaire */}
          <View className="flex-row items-center justify-between bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200/80 min-h-[42px]">
            <View className="flex-row items-center gap-1.5 flex-1 pr-2">
              <Ionicons name="pie-chart-outline" size={13} color="#D97706" />
              <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                Seuil Nécessaire
              </Text>
              {isNecessaryModifiedFromDefault && (
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-1.5 py-0 rounded-md">
                  <Text className="text-[8px] font-semibold text-lavender">Modifié</Text>
                </Badge>
              )}
            </View>

            <View className="flex-row items-center min-w-[90px] max-w-[130px]">
              <Input
                value={monthlyNecessaryInput}
                onChangeText={(v) => onChangeMonthlyNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder={totalEstimatedVariable.toString()}
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-sm font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0 h-auto text-right"
              />
              <Text className="text-xs font-bold text-slate-500 ml-1">€</Text>
            </View>
          </View>

          {isNecessaryModifiedFromDefault && onResetMonthlyNecessaryToDefault && (
            <TouchableOpacity
              activeOpacity={0.6}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={onResetMonthlyNecessaryToDefault}
              accessibilityRole="button"
              className="self-end flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80">
              <Ionicons name="refresh-outline" size={10} color="#D97706" />
              <Text className="text-[10px] font-semibold text-amber-800">
                Par défaut ({formatEuro(totalEstimatedVariable)})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="gap-1.5">
          {/* Saisie Montant Ponctuel */}
          <View className="flex-row items-center justify-between bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200/80 min-h-[42px]">
            <View className="flex-row items-center gap-1.5 flex-1 pr-2">
              <Ionicons name="flash-outline" size={13} color={colors.accent} />
              <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                Montant Ponctuel
              </Text>
            </View>
            <View className="flex-row items-center min-w-[90px] max-w-[130px]">
              <Input
                value={oneTimeAmountInput}
                onChangeText={(v) => onChangeOneTimeAmount(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-sm font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0 h-auto text-right"
              />
              <Text className="text-xs font-bold text-slate-500 ml-1">€</Text>
            </View>
          </View>

          {/* Saisie Part Nécessaire */}
          <View className="flex-row items-center justify-between bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200/80 min-h-[42px]">
            <View className="flex-row items-center gap-1.5 flex-1 pr-2">
              <Ionicons name="pie-chart-outline" size={13} color="#D97706" />
              <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                Part Nécessaire
              </Text>
            </View>
            <View className="flex-row items-center min-w-[90px] max-w-[130px]">
              <Input
                value={oneTimeNecessaryInput}
                onChangeText={(v) => onChangeOneTimeNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-sm font-black text-foreground border-0 bg-transparent shadow-none px-0 py-0 h-auto text-right"
              />
              <Text className="text-xs font-bold text-slate-500 ml-1">€</Text>
            </View>
          </View>
        </View>
      )}

      {/* BOUTON ENREGISTRER / APPLIQUER COMPACT */}
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
        className={`flex-row items-center justify-center bg-primary rounded-xl py-2 px-3 min-h-[40px] gap-1.5 shadow-2xs active:bg-slate-800 ${
          isSaving ? 'opacity-70' : ''
        }`}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" className="mr-1" />
        ) : (
          <Ionicons name="checkmark-circle" size={15} color="#ffffff" />
        )}
        <Text className="text-xs font-bold text-white tracking-wide">
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
