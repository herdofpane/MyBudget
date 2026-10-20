import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        className="flex-1 bg-slate-900/40 justify-center items-center p-4 sm:p-6"
        onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-w-[500px]">
          <Pressable
            className="bg-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xl w-full gap-4 max-h-[88vh]"
            onPress={(e) => e.stopPropagation()}>
            
            {/* EN-TÊTE DE LA FEUILLE MODALE APPLE HIG */}
            <View className="flex-row justify-between items-center min-h-[44px]">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View
                  className="w-10 h-10 rounded-2xl justify-center items-center shrink-0 border border-black/[0.04] shadow-2xs"
                  style={{
                    backgroundColor: `${colorInput}18`,
                  }}>
                  <Ionicons
                    name={(iconInput || (editingCategory ? 'create-outline' : 'add-circle-outline')) as any}
                    size={20}
                    color={colorInput}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {editingCategory ? 'Modifier la charge' : 'Nouvelle charge variable'}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                    Lissage automatique : Montant ÷ Durée en mois
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center active:bg-slate-200"
                accessibilityLabel="Fermer la boîte de dialogue">
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-3.5 pb-2"
              bounces={false}>
              
              {/* CHAMP 1 : TITRE */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-slate-700">Titre</Text>
                  {iconInput && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50/80 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                      <Ionicons name={iconInput as any} size={11} color={colorInput} />
                      <Text className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Auto</Text>
                    </Badge>
                  )}
                </View>
                <Input
                  value={labelInput}
                  onChangeText={onLabelChange}
                  placeholder="Ex: Courses, Restaurant, Essence, Vacances..."
                  placeholderTextColor={colors.textMuted}
                  className="bg-slate-100/90 border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 min-h-[44px]"
                  autoFocus={!editingCategory}
                />
              </View>

              {/* CHAMP 2 : MONTANT */}
              <View className="gap-1.5">
                <Text className="text-xs font-bold text-slate-700">Montant (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 600.00"
                  placeholderTextColor={colors.textMuted}
                  className="bg-slate-100/90 border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 min-h-[44px]"
                />
              </View>

              {/* CHAMP 3 : DURÉE DE LISSAGE (CAPSULES RAPIDES HIG) */}
              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-slate-700">Durée de lissage (mois)</Text>
                  <Text className="text-xs text-slate-400">Étalement mensuel</Text>
                </View>

                <View className="flex-row items-center gap-2.5">
                  <Input
                    value={durationInput}
                    onChangeText={(val) => {
                      const sanitized = val.replace(/[^0-9.,]/g, '');
                      onDurationChange(sanitized);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    className="w-16 bg-slate-100/90 border-slate-200/80 rounded-2xl px-2 py-2 text-sm font-bold text-slate-900 min-h-[44px] text-center"
                  />
                  <Text className="text-xs font-bold text-slate-500">mois</Text>

                  {/* BOUTONS PRÉRÉGLAGES RAPIDES CAPSULES */}
                  <View className="flex-row gap-1.5 flex-1 justify-end flex-wrap">
                    {DURATION_PRESETS.map((m) => {
                      const isActive = durationInput === m.toString();
                      return (
                        <TouchableOpacity
                          key={m}
                          activeOpacity={0.6}
                          onPress={() => onDurationChange(m.toString())}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          className={`px-3 py-1.5 rounded-full border min-h-[34px] justify-center ${
                            isActive
                              ? 'bg-primary border-primary shadow-xs'
                              : 'border-slate-200 bg-white active:bg-slate-100'
                          }`}>
                          <Text
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-slate-600'
                            }`}>
                            {m}m
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* ENCART DE CALCUL DE LISSAGE STYLE iOS BANNER */}
                {modalParsedAmount > 0 && (
                  <View className="flex-row items-center bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 gap-2.5 mt-1">
                    <Ionicons name="calculator-outline" size={17} color="#D97706" />
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900">
                        Impact mensuel :{' '}
                        <Text className="text-amber-800 font-black">
                          {formatEuro(modalMonthlyImpact)} / mois
                        </Text>
                      </Text>
                      <Text className="text-[11px] text-slate-500 mt-0.5">
                        {formatEuro(modalParsedAmount)} lissés sur {modalParsedDuration.toString().replace('.', ',')} mois
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* APERÇU ICÔNE & COULEUR AUTOMATIQUES */}
              <View className="flex-row items-center bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 gap-3">
                <View
                  className="w-10 h-10 rounded-2xl justify-center items-center shrink-0 border border-black/[0.04]"
                  style={{
                    backgroundColor: `${colorInput}18`,
                  }}>
                  <Ionicons name={(iconInput || 'pricetag-outline') as any} size={18} color={colorInput} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold text-slate-900">
                      Icône & teinte automatiques
                    </Text>
                    <Badge variant="outline" className="border-amber-300/80 bg-white px-2 py-0.2 rounded-full">
                      <Text className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Auto</Text>
                    </Badge>
                  </View>
                  <Text className="text-[11px] text-slate-500 mt-0.5">
                    Détectées automatiquement dès la frappe du nom.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* BOUTONS D'ACTION DU MODAL (APPLE HIG 44PT MINIMUM) */}
            <View className="flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                className="rounded-2xl px-4 py-2.5 min-h-[44px] justify-center bg-slate-100 border border-slate-200/80 active:bg-slate-200">
                <Text className="text-xs font-bold text-slate-700">Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={onSave}
                disabled={isSaving}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                className={`bg-primary rounded-2xl px-5 py-2.5 min-h-[44px] flex-row items-center justify-center gap-2 shadow-xs active:bg-slate-800 ${
                  isSaving ? 'opacity-80' : ''
                }`}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-1" />
                ) : (
                  <Ionicons name="checkmark" size={17} color="#ffffff" />
                )}
                <Text className="text-xs font-bold text-white">
                  {isSaving ? 'Enregistrement...' : editingCategory ? 'Enregistrer' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

