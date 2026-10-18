import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';

interface SimulationControlsCardProps {
  isMonthly: boolean;
  income: number;
  totalFixedExpenses: number;
  monthlyNecessaryInput: string;
  oneTimeAmountInput: string;
  oneTimeNecessaryInput: string;
  isSaving: boolean;
  onReset: () => void;
  onNavigateHome: () => void;
  onNavigateFixedExpenses: () => void;
  onChangeMonthlyNecessary: (val: string) => void;
  onChangeOneTimeAmount: (val: string) => void;
  onChangeOneTimeNecessary: (val: string) => void;
  onApplyBudget: () => void;
}

export function SimulationControlsCard({
  isMonthly,
  income,
  totalFixedExpenses,
  monthlyNecessaryInput,
  oneTimeAmountInput,
  oneTimeNecessaryInput,
  isSaving,
  onReset,
  onNavigateHome,
  onNavigateFixedExpenses,
  onChangeMonthlyNecessary,
  onChangeOneTimeAmount,
  onChangeOneTimeNecessary,
  onApplyBudget,
}: SimulationControlsCardProps) {
  return (
    <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
      <View className="flex-row items-center gap-2.5 sm:gap-3 justify-between">
        <View className="flex-row items-center gap-2.5 flex-1 pr-1">
          <View className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
            <Ionicons name="create-outline" size={18} color={colors.lavender} />
          </View>
          <View className="flex-1">
            <Text className="text-sm sm:text-base font-bold text-foreground">Zone pour modifier le calcul</Text>
            <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
              {isMonthly
                ? 'Revenu (Accueil), Charges fixes et Seuil nécessaire'
                : 'Montant ponctuel et Nécessaire'}
            </Text>
          </View>
        </View>

        <Button
          variant="outline"
          size="sm"
          onPress={onReset}
          className="gap-1 px-2.5 py-1.5 rounded-lg border-border bg-muted/40 h-auto shrink-0">
          <Ionicons name="refresh-outline" size={13} color={colors.textMuted} />
          <Text className="text-[11px] font-semibold text-muted-foreground">Standard</Text>
        </Button>
      </View>

      {/* CHAMPS SELON LE MODE */}
      <View className="gap-2.5 sm:gap-3">
        {isMonthly ? (
          <>
            {/* 1. REVENU MENSUEL (Issu de l'Accueil) */}
            <View className="bg-muted/30 border border-border rounded-2xl p-3 sm:p-3.5 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="cash-outline" size={14} color={colors.accent} />
                  <Text className="text-xs font-bold text-foreground">Revenu mensuel</Text>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-1.5 py-0 rounded">
                    <Text className="text-[10px] font-semibold text-accent">Accueil</Text>
                  </Badge>
                </View>
                <Text className="text-base sm:text-lg font-black text-foreground">
                  {formatEuro(income)}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5">
                  Défini dans l&apos;input de la page Accueil
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onNavigateHome}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex-row items-center gap-1">
                <Text className="text-[11px] font-bold text-accent">Modifier</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>

            {/* 2. CHARGES FIXES */}
            <View className="bg-muted/30 border border-border rounded-2xl p-3 sm:p-3.5 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="calendar-outline" size={14} color={colors.lavender} />
                  <Text className="text-xs font-bold text-foreground">Charges fixes</Text>
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-1.5 py-0 rounded">
                    <Text className="text-[10px] font-semibold text-lavender">Charges Fixes</Text>
                  </Badge>
                </View>
                <Text className="text-base sm:text-lg font-black text-foreground">
                  {formatEuro(totalFixedExpenses)}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5">
                  Total calculé depuis la page Charges Fixes
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onNavigateFixedExpenses}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex-row items-center gap-1">
                <Text className="text-[11px] font-bold text-lavender">Gérer</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.lavender} />
              </TouchableOpacity>
            </View>

            {/* 3. TOTAL NÉCESSAIRE */}
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-foreground">Total Nécessaire (Seuil survie) (€)</Text>
                <Badge variant="outline" className="border-border bg-muted/40 px-1.5 py-0 rounded">
                  <Text className="text-[10px] font-semibold text-muted-foreground">Paramètre de calcul</Text>
                </Badge>
              </View>
              <Input
                value={monthlyNecessaryInput}
                onChangeText={(v) => onChangeMonthlyNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="123"
                placeholderTextColor={colors.textMuted}
                className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
              />
              <Text className="text-[10px] text-muted-foreground mt-1">
                Ajustez le montant nécessaire pour observer l&apos;impact sur la répartition et l&apos;épargne.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* REVENU PONCTUEL */}
            <View>
              <Text className="text-xs font-bold text-foreground mb-1">Montant du revenu ponctuel (€)</Text>
              <Input
                value={oneTimeAmountInput}
                onChangeText={(v) => onChangeOneTimeAmount(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="566.17"
                placeholderTextColor={colors.textMuted}
                className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
              />
            </View>

            {/* NÉCESSAIRE SUR REVENU PONCTUEL */}
            <View>
              <Text className="text-xs font-bold text-foreground mb-1">Part Nécessaire (Seuil survie) (€)</Text>
              <Input
                value={oneTimeNecessaryInput}
                onChangeText={(v) => onChangeOneTimeNecessary(v.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="198.16"
                placeholderTextColor={colors.textMuted}
                className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
              />
            </View>
          </>
        )}
      </View>

      {/* BOUTON ENREGISTRER */}
      <Button
        onPress={onApplyBudget}
        disabled={isSaving}
        className={`flex-row items-center justify-center bg-primary rounded-xl py-3.5 px-4 gap-2 h-auto ${
          isSaving ? 'opacity-80' : ''
        }`}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" className="mr-1.5" />
        ) : (
          <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
        )}
        <Text className="text-xs sm:text-sm font-bold text-white">
          {isSaving
            ? 'Enregistrement...'
            : isMonthly
            ? 'Appliquer comme budget officiel'
            : 'Enregistrer ce revenu ponctuel'}
        </Text>
      </Button>
    </Card>
  );
}
