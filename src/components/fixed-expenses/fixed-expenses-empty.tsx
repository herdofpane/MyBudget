import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { colors } from '@/theme/colors';

interface FixedExpensesEmptyProps {
  onAdd: () => void;
}

export function FixedExpensesEmpty({ onAdd }: FixedExpensesEmptyProps) {
  return (
    <View className="p-8 items-center justify-center gap-3">
      <Ionicons name="folder-open-outline" size={42} color={colors.lavender} />
      <Text className="text-base font-bold text-foreground text-center">
        Aucune charge fixe enregistrée
      </Text>
      <Text className="text-xs text-muted-foreground text-center max-w-[420px]">
        Ajoutez vos charges récurrentes (loyer, abonnements, assurances, crédits...) pour calculer votre budget.
      </Text>
      <Button
        onPress={onAdd}
        className="bg-primary rounded-xl px-4 py-2 mt-2 gap-1.5 h-auto">
        <Ionicons name="add" size={16} color="#ffffff" />
        <Text className="text-xs font-bold text-white">
          Ajouter ma première charge
        </Text>
      </Button>
    </View>
  );
}
