import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';

interface FixedExpensesEmptyProps {
  onAdd: () => void;
}

export function FixedExpensesEmpty({ onAdd }: FixedExpensesEmptyProps) {
  return (
    <View className="py-12 px-6 items-center justify-center gap-3.5">
      <View className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200/80 items-center justify-center shadow-xs">
        <Ionicons name="folder-open-outline" size={32} color={colors.lavender} />
      </View>
      <View className="gap-1 items-center">
        <Text className="text-base sm:text-lg font-black text-slate-900 text-center tracking-tight">
          Aucune charge fixe enregistrée
        </Text>
        <Text className="text-xs text-slate-400 text-center max-w-[360px] leading-relaxed">
          Ajoutez vos charges récurrentes (loyer, abonnements, assurances, crédits) pour calculer votre budget disponible en temps réel.
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onAdd}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Ajouter ma première charge fixe"
        className="bg-primary rounded-2xl px-5 py-3 min-h-[44px] mt-2 flex-row items-center gap-2 shadow-xs active:bg-slate-800">
        <Ionicons name="add" size={17} color="#ffffff" />
        <Text className="text-xs font-bold text-white tracking-wide">
          Ajouter ma première charge
        </Text>
      </TouchableOpacity>
    </View>
  );
}

