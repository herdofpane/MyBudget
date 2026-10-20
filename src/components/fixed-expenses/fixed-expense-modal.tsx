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
import { CATEGORY_CONFIG } from '@/data';
import { formatEuro } from '@/constants/formatters';
import { formatMonthYearFull } from '@/utils/fixed-expenses';
import { FixedExpenseItem, FixedCategoryType, FixedExpenseActivationType } from '@/types';

interface FixedExpenseModalProps {
  visible: boolean;
  editingItem: FixedExpenseItem | null;
  isSaving: boolean;
  labelInput: string;
  amountInput: string;
  categoryInput: string;
  iconInput: string;
  isCreditInput: boolean;
  durationInput: string;
  paidMonthsInput: string;
  isScheduledInput: boolean;
  activationTypeInput: FixedExpenseActivationType;
  targetMonthInput: string;
  monthPresets: { label: string; value: string }[];
  currentMonthStr: string;
  parsedAmountForCredit: number;
  parsedDurationForCredit: number;
  remainingMonthsPreview: number;
  remainingCostCreditPreview: number;
  estimatedEndDatePreview: string;
  targetMonthPreviewStatus: { isCounted: boolean; label: string; description: string };
  onLabelChange: (text: string) => void;
  onAmountChange: (text: string) => void;
  onToggleCredit: () => void;
  onDurationChange: (text: string) => void;
  onPaidMonthsChange: (text: string) => void;
  onToggleScheduled: () => void;
  onActivationTypeChange: (type: FixedExpenseActivationType) => void;
  onTargetMonthChange: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const CREDIT_PRESETS = [
  { label: '3x', months: '3' },
  { label: '6 mois', months: '6' },
  { label: '12 mois', months: '12' },
  { label: '24 mois', months: '24' },
  { label: '36 mois', months: '36' },
  { label: '48 mois', months: '48' },
];

export function FixedExpenseModal({
  visible,
  editingItem,
  isSaving,
  labelInput,
  amountInput,
  categoryInput,
  iconInput,
  isCreditInput,
  durationInput,
  paidMonthsInput,
  isScheduledInput,
  activationTypeInput,
  targetMonthInput,
  monthPresets,
  currentMonthStr,
  parsedAmountForCredit,
  parsedDurationForCredit,
  remainingMonthsPreview,
  remainingCostCreditPreview,
  estimatedEndDatePreview,
  targetMonthPreviewStatus,
  onLabelChange,
  onAmountChange,
  onToggleCredit,
  onDurationChange,
  onPaidMonthsChange,
  onToggleScheduled,
  onActivationTypeChange,
  onTargetMonthChange,
  onClose,
  onSave,
}: FixedExpenseModalProps) {
  const currentCategory = CATEGORY_CONFIG[categoryInput as FixedCategoryType] || CATEGORY_CONFIG.autre;

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
                    backgroundColor: currentCategory.bg,
                  }}>
                  <Ionicons
                    name={(iconInput || (editingItem ? 'create-outline' : 'add-circle-outline')) as any}
                    size={20}
                    color={currentCategory.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                    Poste de dépense mensuelle récurrente
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
              
              {/* CHAMP 1 : NOM */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-slate-700">Nom de la charge</Text>
                  {iconInput && (
                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50/80 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                      <Ionicons name={iconInput as any} size={11} color={colors.lavender} />
                      <Text className="text-[10px] font-bold text-lavender uppercase tracking-wider">Auto</Text>
                    </Badge>
                  )}
                </View>
                <Input
                  value={labelInput}
                  onChangeText={onLabelChange}
                  placeholder="Ex: Loyer, EDF, Forfait internet, Netflix..."
                  placeholderTextColor={colors.textMuted}
                  className="bg-slate-100/90 border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 min-h-[44px]"
                  autoFocus={!editingItem}
                />
              </View>

              {/* CHAMP 2 : MONTANT */}
              <View className="gap-1.5">
                <Text className="text-xs font-bold text-slate-700">Montant mensuel (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 85.00"
                  placeholderTextColor={colors.textMuted}
                  className="bg-slate-100/90 border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 min-h-[44px]"
                />
              </View>

              {/* APERÇU CATÉGORIE & ICÔNE AUTOMATIQUES */}
              <View className="flex-row items-center bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200/80 gap-3">
                <View
                  className="w-10 h-10 rounded-2xl justify-center items-center shrink-0 border border-black/[0.04]"
                  style={{
                    backgroundColor: currentCategory.bg,
                  }}>
                  <Ionicons
                    name={(iconInput || currentCategory.icon || 'receipt-outline') as any}
                    size={19}
                    color={currentCategory.color}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold text-slate-900">
                      {currentCategory.label}
                    </Text>
                    <Badge variant="outline" className="border-indigo-300/80 bg-white px-2 py-0.2 rounded-full">
                      <Text className="text-[9px] font-black text-lavender uppercase tracking-wider">Auto</Text>
                    </Badge>
                  </View>
                  <Text className="text-[11px] text-slate-500 mt-0.5">
                    Catégorie et icône adaptées automatiquement dès la frappe du nom.
                  </Text>
                </View>
              </View>

              {/* OPTION CRÉDIT (COMMUTATEUR STYLE iOS) */}
              <View className="rounded-2xl border border-slate-200/90 bg-slate-100/60 p-3.5 gap-3">
                <View className="flex-row justify-between items-center min-h-[44px]">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View
                      className={`w-9 h-9 rounded-xl justify-center items-center ${
                        isCreditInput ? 'bg-emerald-100' : 'bg-slate-200/80'
                      }`}>
                      <Ionicons
                        name={isCreditInput ? 'time' : 'time-outline'}
                        size={18}
                        color={isCreditInput ? colors.accent : colors.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-800">
                        Crédit sur durée limitée
                      </Text>
                      <Text className="text-[11px] text-slate-500">
                        Déduction automatique du budget une fois soldé
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onToggleCredit}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isCreditInput }}
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      isCreditInput ? 'bg-accent items-end' : 'bg-slate-300 items-start'
                    }`}>
                    <View className="w-6 h-6 rounded-full bg-white shadow-xs" />
                  </TouchableOpacity>
                </View>

                {isCreditInput && (
                  <View className="gap-2.5 pt-2.5 border-t border-slate-200">
                    <Text className="text-xs font-bold text-slate-700">
                      Durée de remboursement
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {CREDIT_PRESETS.map((preset) => {
                        const isSelected = durationInput === preset.months;
                        return (
                          <TouchableOpacity
                            key={preset.months}
                            activeOpacity={0.6}
                            onPress={() => onDurationChange(preset.months)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            className={`px-3 py-1.5 rounded-full border min-h-[32px] justify-center ${
                              isSelected
                                ? 'bg-primary border-primary shadow-xs'
                                : 'border-slate-200/90 bg-white active:bg-slate-100'
                            }`}>
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-white' : 'text-slate-600'
                              }`}>
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View className="flex-row gap-2.5">
                      <View className="flex-1 gap-1">
                        <Text className="text-xs font-bold text-slate-500">
                          Mois totaux
                        </Text>
                        <Input
                          value={durationInput}
                          onChangeText={onDurationChange}
                          keyboardType="number-pad"
                          placeholder="12"
                          placeholderTextColor={colors.textMuted}
                          className="bg-white border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 min-h-[40px]"
                        />
                      </View>

                      <View className="flex-1 gap-1">
                        <Text className="text-xs font-bold text-slate-500">
                          Mois déjà payés
                        </Text>
                        <Input
                          value={paidMonthsInput}
                          onChangeText={onPaidMonthsChange}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                          className="bg-white border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 min-h-[40px]"
                        />
                      </View>
                    </View>

                    {/* Aperçu du solde restant dû */}
                    <View className="bg-white rounded-2xl p-3 border border-slate-200/80 gap-1.5 shadow-2xs">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-slate-500">Mensualité :</Text>
                        <Text className="text-xs font-bold text-slate-900">
                          {formatEuro(parsedAmountForCredit)} / mois
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-slate-500">Restantes :</Text>
                        <Text className="text-xs font-bold text-slate-900">
                          {remainingMonthsPreview} sur {parsedDurationForCredit} mois
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-slate-500">Solde dû :</Text>
                        <Text className="text-xs font-extrabold text-danger">
                          {formatEuro(remainingCostCreditPreview)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-slate-500">Fin estimée :</Text>
                        <Text className="text-xs font-extrabold text-accentDark">
                          {remainingMonthsPreview === 0 ? 'Soldé' : estimatedEndDatePreview}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* OPTION PLANIFICATION (COMMUTATEUR STYLE iOS) */}
              <View className="rounded-2xl border border-slate-200/90 bg-slate-100/60 p-3.5 gap-3">
                <View className="flex-row justify-between items-center min-h-[44px]">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View
                      className={`w-9 h-9 rounded-xl justify-center items-center ${
                        isScheduledInput ? 'bg-indigo-100' : 'bg-slate-200/80'
                      }`}>
                      <Ionicons
                        name={isScheduledInput ? 'calendar' : 'calendar-outline'}
                        size={18}
                        color={isScheduledInput ? colors.lavender : colors.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-800">
                        Planifier l&apos;activation
                      </Text>
                      <Text className="text-[11px] text-slate-500">
                        Démarrer plus tard ou pour un mois donné
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onToggleScheduled}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isScheduledInput }}
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      isScheduledInput ? 'bg-lavender items-end' : 'bg-slate-300 items-start'
                    }`}>
                    <View className="w-6 h-6 rounded-full bg-white shadow-xs" />
                  </TouchableOpacity>
                </View>

                {isScheduledInput && (
                  <View className="gap-2.5 pt-2.5 border-t border-slate-200">
                    <Text className="text-xs font-bold text-slate-700">Mode d&apos;application</Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => onActivationTypeChange('starting_from')}
                        className={`flex-1 p-2.5 rounded-2xl border ${
                          activationTypeInput === 'starting_from'
                            ? 'border-indigo-400 bg-indigo-50/80 shadow-2xs'
                            : 'border-slate-200 bg-white'
                        }`}>
                        <View className="flex-row items-center gap-1.5 mb-0.5">
                          <Ionicons
                            name="arrow-forward-circle-outline"
                            size={15}
                            color={activationTypeInput === 'starting_from' ? colors.lavender : colors.textMuted}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              activationTypeInput === 'starting_from'
                                ? 'text-lavender'
                                : 'text-slate-800'
                            }`}>
                            À partir de
                          </Text>
                        </View>
                        <Text className="text-[10px] text-slate-500">
                          Démarre et reste active
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => onActivationTypeChange('only_month')}
                        className={`flex-1 p-2.5 rounded-2xl border ${
                          activationTypeInput === 'only_month'
                            ? 'border-indigo-400 bg-indigo-50/80 shadow-2xs'
                            : 'border-slate-200 bg-white'
                        }`}>
                        <View className="flex-row items-center gap-1.5 mb-0.5">
                          <Ionicons
                            name="stopwatch-outline"
                            size={15}
                            color={activationTypeInput === 'only_month' ? colors.lavender : colors.textMuted}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              activationTypeInput === 'only_month'
                                ? 'text-lavender'
                                : 'text-slate-800'
                            }`}>
                            Uniquement
                          </Text>
                        </View>
                        <Text className="text-[10px] text-slate-500">
                          Ce mois spécifique
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Présélections mois capsules */}
                    <Text className="text-xs font-bold text-slate-500">
                      Sélection rapide
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {monthPresets.map((preset) => {
                        const isSelected = targetMonthInput === preset.value;
                        return (
                          <TouchableOpacity
                            key={preset.value}
                            activeOpacity={0.6}
                            onPress={() => onTargetMonthChange(preset.value)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            className={`px-3 py-1.5 rounded-full border min-h-[32px] justify-center ${
                              isSelected
                                ? 'bg-primary border-primary shadow-xs'
                                : 'border-slate-200 bg-white active:bg-slate-100'
                            }`}>
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-white' : 'text-slate-600'
                              }`}>
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View className="gap-1">
                      <Text className="text-xs font-bold text-slate-500">
                        Mois cible (AAAA-MM)
                      </Text>
                      <Input
                        value={targetMonthInput}
                        onChangeText={onTargetMonthChange}
                        placeholder={currentMonthStr}
                        placeholderTextColor={colors.textMuted}
                        maxLength={7}
                        className="bg-white border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 min-h-[40px]"
                      />
                    </View>

                    {/* Aperçu statut planification */}
                    <View className="bg-white rounded-2xl p-3 border border-slate-200/80 gap-1.5 shadow-2xs">
                      <View className="flex-row justify-between items-center">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 rounded-full ${
                            targetMonthPreviewStatus.isCounted
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-indigo-50 border-indigo-200'
                          }`}>
                          <Text
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              targetMonthPreviewStatus.isCounted
                                ? 'text-accentDark'
                                : 'text-lavender'
                            }`}>
                            {targetMonthPreviewStatus.label}
                          </Text>
                        </Badge>
                        <Text className="text-xs font-bold text-slate-500">
                          {formatMonthYearFull(targetMonthInput)}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        {targetMonthPreviewStatus.description}
                      </Text>
                    </View>
                  </View>
                )}
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
                  {isSaving ? 'Enregistrement...' : editingItem ? 'Enregistrer' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

