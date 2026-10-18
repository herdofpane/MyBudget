import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface VariableExpensesEmptyProps {
  onAdd: () => void;
}

export function VariableExpensesEmpty({ onAdd }: VariableExpensesEmptyProps) {
  return (
    <View className="p-8 items-center justify-center gap-3">
      <Ionicons name="folder-open-outline" size={42} color="#D97706" />
      <Text className="text-base font-bold text-foreground text-center">
        Aucune charge variable enregistrée
      </Text>
      <Text className="text-xs text-muted-foreground text-center max-w-[420px]">
        Ajoutez vos charges variables avec leur montant et leur durée de vie sur X mois pour calculer automatiquement l&apos;impact mensuel.
      </Text>
      <Button
        onPress={onAdd}
        className="bg-primary rounded-xl px-4 py-2 mt-2 gap-1.5 h-auto">
        <Ionicons name="add" size={16} color="#ffffff" />
        <Text className="text-xs font-bold text-white">
          Ajouter ma première charge variable
        </Text>
      </Button>
    </View>
  );
}
