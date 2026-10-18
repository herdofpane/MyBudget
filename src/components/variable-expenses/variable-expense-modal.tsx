import React from 'react';
import {
  View,
  ScrollView,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import { formatEuro } from '@/constants/formatters';
import { VariableCategory } from '@/types';

interface VariableExpenseModalProps {
  visible: boolean;
  editingCategory: VariableCategory | null;
  isSaving: boolean;
  labelInput: string;
  amountInput: string;
  durationInput: string;
  iconInput: string;
  colorInput: string;
  modalParsedAmount: number;
  modalParsedDuration: number;
  modalMonthlyImpact: number;
  onLabelChange: (text: string) => void;
  onAmountChange: (text: string) => void;
  onDurationChange: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const DURATION_PRESETS = [1, 3, 6, 12, 24];

export function VariableExpenseModal({
  visible,
  editingCategory,
  isSaving,
  labelInput,
  amountInput,
  durationInput,
  iconInput,
  colorInput,
  modalParsedAmount,
  modalParsedDuration,
  modalMonthlyImpact,
  onLabelChange,
  onAmountChange,
  onDurationChange,
  onClose,
  onSave,
}: VariableExpenseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-primary/50 justify-center items-center p-3.5 sm:p-4"
        onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-w-[500px]">
          <Pressable
            className="bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-lg w-full gap-3.5 sm:gap-4 max-h-[90vh]"
            onPress={(e) => e.stopPropagation()}>
            
            {/* EN-TÊTE MODAL */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                <View
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl justify-center items-center shrink-0 border"
                  style={{
                    backgroundColor: `${colorInput}18`,
                    borderColor: `${colorInput}35`,
                  }}>
                  <Ionicons
                    name={(iconInput || (editingCategory ? 'create-outline' : 'add-circle-outline')) as any}
                    size={18}
                    color={colorInput}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base sm:text-lg font-black text-foreground">
                    {editingCategory ? 'Modifier la charge' : 'Nouvelle charge variable'}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                    Lissage automatique : Montant ÷ Durée en mois
                  </Text>
                </View>
              </View>

              <Button
                variant="ghost"
                size="icon"
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-8 h-8 rounded-full"
                accessibilityLabel="Fermer la boîte de dialogue">
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Button>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-3 pb-2"
              bounces={false}>
              
              {/* CHAMP 1 : TITRE */}
              <View className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-foreground">Titre</Text>
                  {iconInput && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50/70 px-1.5 py-0.5 rounded-full flex-row items-center gap-1">
                      <Ionicons name={iconInput as any} size={11} color={colorInput} />
                      <Text className="text-[10px] font-semibold text-amber-800">Auto</Text>
                    </Badge>
                  )}
                </View>
                <Input
                  value={labelInput}
                  onChangeText={onLabelChange}
                  placeholder="Ex: Courses, Restaurant, Essence, Vacances..."
                  placeholderTextColor={colors.textMuted}
                  className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                  autoFocus={!editingCategory}
                />
              </View>

              {/* CHAMP 2 : MONTANT */}
              <View className="gap-1">
                <Text className="text-xs font-bold text-foreground">Montant (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 600.00"
                  placeholderTextColor={colors.textMuted}
                  className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                />
              </View>

              {/* CHAMP 3 : DURÉE DE VIE SUR X MOIS */}
              <View className="gap-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-foreground">Durée de vie (mois)</Text>
                  <Text className="text-[11px] text-muted-foreground">Lissage</Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Input
                    value={durationInput}
                    onChangeText={(val) => {
                      const sanitized = val.replace(/[^0-9.,]/g, '');
                      onDurationChange(sanitized);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    className="w-16 bg-muted/40 border-border rounded-xl px-2 py-2 text-sm font-bold text-foreground h-10 text-center"
                  />
                  <Text className="text-xs font-bold text-muted-foreground">mois</Text>

                  {/* BOUTONS PRÉRÉGLAGES RAPIDES */}
                  <View className="flex-row gap-1 flex-1 justify-end flex-wrap">
                    {DURATION_PRESETS.map((m) => {
                      const isActive = durationInput === m.toString();
                      return (
                        <Button
                          key={m}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          onPress={() => onDurationChange(m.toString())}
                          className={`px-2 py-1 rounded-lg h-8 ${
                            isActive ? 'bg-primary' : 'border-border bg-muted/30'
                          }`}>
                          <Text
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-muted-foreground'
                            }`}>
                              {m}m
                          </Text>
                        </Button>
                      );
                    })}
                  </View>
                </View>

                {/* ENCART EN DIRECT DU CALCUL DE LISSAGE */}
                {modalParsedAmount > 0 && (
                  <View className="flex-row items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200 gap-2 mt-1">
                    <Ionicons name="calculator-outline" size={16} color="#D97706" />
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-foreground">
                        Impact mensuel :{' '}
                        <Text className="text-amber-800 font-extrabold">
                          {formatEuro(modalMonthlyImpact)} / mois
                        </Text>
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {formatEuro(modalParsedAmount)} lissés sur {modalParsedDuration.toString().replace('.', ',')} mois
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* APERÇU ICÔNE & COULEUR AUTOMATIQUES */}
              <View className="flex-row items-center bg-amber-50/60 p-3 rounded-2xl border border-amber-200/70 gap-2.5">
                <View
                  className="w-8 h-8 rounded-xl justify-center items-center shrink-0 border"
                  style={{
                    backgroundColor: `${colorInput}18`,
                    borderColor: `${colorInput}35`,
                  }}>
                  <Ionicons name={(iconInput || 'pricetag-outline') as any} size={16} color={colorInput} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold text-foreground">
                      Icône & couleur automatiques
                    </Text>
                    <Badge variant="outline" className="border-amber-300 bg-white px-1.5 py-0.2 rounded-full">
                      <Text className="text-[9px] font-bold text-amber-800">Auto</Text>
                    </Badge>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Détectées automatiquement selon le titre saisi.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* BOUTONS D'ACTION DU MODAL */}
            <View className="flex-row justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onPress={onClose}
                className="rounded-xl px-3.5 py-2 h-auto">
                <Text className="text-xs font-bold text-foreground">Annuler</Text>
              </Button>

              <Button
                onPress={onSave}
                disabled={isSaving}
                className={`bg-primary rounded-xl px-4 py-2 gap-1.5 h-auto ${
                  isSaving ? 'opacity-80' : ''
                }`}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-1" />
                ) : (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
                <Text className="text-xs font-bold text-white">
                  {isSaving ? 'Enregistrement...' : editingCategory ? 'Enregistrer' : 'Ajouter'}
                </Text>
              </Button>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
