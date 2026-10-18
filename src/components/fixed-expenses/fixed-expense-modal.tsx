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
import { Button } from '@/components/ui/button';
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
        className="flex-1 bg-primary/50 justify-center items-center p-3.5 sm:p-4"
        onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-w-[500px]">
          <Pressable
            className="bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-lg w-full gap-3.5 sm:gap-4 max-h-[90vh]"
            onPress={(e) => e.stopPropagation()}>
            
            {/* EN-TÊTE DU FORMULAIRE */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2.5 sm:gap-3 flex-1 pr-2">
                <View
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl justify-center items-center shrink-0 border"
                  style={{
                    backgroundColor: currentCategory.bg,
                    borderColor: `${currentCategory.color}40`,
                  }}>
                  <Ionicons
                    name={(iconInput || (editingItem ? 'create-outline' : 'add-circle-outline')) as any}
                    size={18}
                    color={currentCategory.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base sm:text-lg font-black text-foreground">
                    {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                    Poste de dépense mensuelle récurrente
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
              
              {/* CHAMP 1 : NOM */}
              <View className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-foreground">Nom de la charge</Text>
                  {iconInput && (
                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50/70 px-1.5 py-0.5 rounded-full flex-row items-center gap-1">
                      <Ionicons name={iconInput as any} size={11} color={colors.lavender} />
                      <Text className="text-[10px] font-semibold text-lavender">Auto</Text>
                    </Badge>
                  )}
                </View>
                <Input
                  value={labelInput}
                  onChangeText={onLabelChange}
                  placeholder="Ex: Loyer, EDF, Forfait internet, Netflix..."
                  placeholderTextColor={colors.textMuted}
                  className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                  autoFocus={!editingItem}
                />
              </View>

              {/* CHAMP 2 : MONTANT */}
              <View className="gap-1">
                <Text className="text-xs font-bold text-foreground">Montant mensuel (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 85.00"
                  placeholderTextColor={colors.textMuted}
                  className="bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground h-10"
                />
              </View>

              {/* APERÇU CATÉGORIE & ICÔNE AUTOMATIQUES */}
              <View className="flex-row items-center bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200/80 gap-3">
                <View
                  className="w-10 h-10 rounded-xl justify-center items-center shrink-0 border"
                  style={{
                    backgroundColor: currentCategory.bg,
                    borderColor: `${currentCategory.color}40`,
                  }}>
                  <Ionicons
                    name={(iconInput || currentCategory.icon || 'receipt-outline') as any}
                    size={18}
                    color={currentCategory.color}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold text-foreground">
                      {currentCategory.label}
                    </Text>
                    <Badge variant="outline" className="border-indigo-300 bg-white px-1.5 py-0.2 rounded-full">
                      <Text className="text-[9px] font-bold text-lavender">Auto</Text>
                    </Badge>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Catégorie et icône choisies automatiquement selon le nom saisi.
                  </Text>
                </View>
              </View>

              {/* OPTION CRÉDIT */}
              <View className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-4 gap-2.5">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg justify-center items-center ${
                        isCreditInput ? 'bg-emerald-100' : 'bg-muted'
                      }`}>
                      <Ionicons
                        name={isCreditInput ? 'time' : 'time-outline'}
                        size={16}
                        color={isCreditInput ? colors.accent : colors.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-foreground">
                        Crédit sur durée limitée
                      </Text>
                      <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
                        S&apos;enlève automatiquement une fois soldé
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onToggleCredit}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isCreditInput }}
                    className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                      isCreditInput ? 'bg-accent items-end' : 'bg-slate-300 items-start'
                    }`}>
                    <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </TouchableOpacity>
                </View>

                {isCreditInput && (
                  <View className="gap-2.5 pt-2 border-t border-border">
                    <Text className="text-[11px] font-bold text-foreground">
                      Durée de remboursement
                    </Text>
                    <View className="flex-row flex-wrap gap-1">
                      {CREDIT_PRESETS.map((preset) => {
                        const isSelected = durationInput === preset.months;
                        return (
                          <Button
                            key={preset.months}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onPress={() => onDurationChange(preset.months)}
                            className={`px-2 py-0.5 rounded-lg h-7 ${
                              isSelected ? 'bg-primary' : 'border-border bg-card'
                            }`}>
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-white' : 'text-muted-foreground'
                              }`}>
                              {preset.label}
                            </Text>
                          </Button>
                        );
                      })}
                    </View>

                    <View className="flex-row gap-2.5">
                      <View className="flex-1 gap-1">
                        <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                          Mois totaux
                        </Text>
                        <Input
                          value={durationInput}
                          onChangeText={onDurationChange}
                          keyboardType="number-pad"
                          placeholder="12"
                          placeholderTextColor={colors.textMuted}
                          className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                        />
                      </View>

                      <View className="flex-1 gap-1">
                        <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                          Mois déjà payés
                        </Text>
                        <Input
                          value={paidMonthsInput}
                          onChangeText={onPaidMonthsChange}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                          className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                        />
                      </View>
                    </View>

                    {/* Aperçu direct */}
                    <View className="bg-card rounded-xl p-2.5 border border-border gap-1">
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] text-muted-foreground">Mensualité :</Text>
                        <Text className="text-[11px] font-bold text-foreground">
                          {formatEuro(parsedAmountForCredit)} / mois
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] text-muted-foreground">Restantes :</Text>
                        <Text className="text-[11px] font-bold text-foreground">
                          {remainingMonthsPreview} sur {parsedDurationForCredit} mois
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] text-muted-foreground">Solde dû :</Text>
                        <Text className="text-[11px] font-extrabold text-danger">
                          {formatEuro(remainingCostCreditPreview)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] text-muted-foreground">Fin estimée :</Text>
                        <Text className="text-[11px] font-extrabold text-accentDark">
                          {remainingMonthsPreview === 0 ? 'Soldé' : estimatedEndDatePreview}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* OPTION PLANIFICATION */}
              <View className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-4 gap-2.5">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg justify-center items-center ${
                        isScheduledInput ? 'bg-indigo-100' : 'bg-muted'
                      }`}>
                      <Ionicons
                        name={isScheduledInput ? 'calendar' : 'calendar-outline'}
                        size={16}
                        color={isScheduledInput ? colors.lavender : colors.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-foreground">
                        Planifier l&apos;activation
                      </Text>
                      <Text className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Démarrer plus tard ou pour un mois donné
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onToggleScheduled}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isScheduledInput }}
                    className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                      isScheduledInput ? 'bg-lavender items-end' : 'bg-slate-300 items-start'
                    }`}>
                    <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </TouchableOpacity>
                </View>

                {isScheduledInput && (
                  <View className="gap-2.5 pt-2 border-t border-border">
                    <Text className="text-[11px] font-bold text-foreground">Mode d&apos;application</Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onActivationTypeChange('starting_from')}
                        className={`flex-1 p-2 rounded-xl border ${
                          activationTypeInput === 'starting_from'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-border bg-card'
                        }`}>
                        <View className="flex-row items-center gap-1.5 mb-0.5">
                          <Ionicons
                            name="arrow-forward-circle-outline"
                            size={14}
                            color={activationTypeInput === 'starting_from' ? colors.lavender : colors.textMuted}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              activationTypeInput === 'starting_from'
                                ? 'text-lavender'
                                : 'text-foreground'
                            }`}>
                            À partir de
                          </Text>
                        </View>
                        <Text className="text-[10px] text-muted-foreground">
                          Démarre et continue
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onActivationTypeChange('only_month')}
                        className={`flex-1 p-2 rounded-xl border ${
                          activationTypeInput === 'only_month'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-border bg-card'
                        }`}>
                        <View className="flex-row items-center gap-1.5 mb-0.5">
                          <Ionicons
                            name="stopwatch-outline"
                            size={14}
                            color={activationTypeInput === 'only_month' ? colors.lavender : colors.textMuted}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              activationTypeInput === 'only_month'
                                ? 'text-lavender'
                                : 'text-foreground'
                            }`}>
                            Uniquement
                          </Text>
                        </View>
                        <Text className="text-[10px] text-muted-foreground">
                          Ce mois spécifique
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Présélections mois */}
                    <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                      Sélection rapide
                    </Text>
                    <View className="flex-row flex-wrap gap-1">
                      {monthPresets.map((preset) => {
                        const isSelected = targetMonthInput === preset.value;
                        return (
                          <Button
                            key={preset.value}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onPress={() => onTargetMonthChange(preset.value)}
                            className={`px-2 py-0.5 rounded-lg h-7 ${
                              isSelected ? 'bg-primary' : 'border-border bg-card'
                            }`}>
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-white' : 'text-muted-foreground'
                              }`}>
                              {preset.label}
                            </Text>
                          </Button>
                        );
                      })}
                    </View>

                    <View className="gap-1">
                      <Text className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                        Mois cible (AAAA-MM)
                      </Text>
                      <Input
                        value={targetMonthInput}
                        onChangeText={onTargetMonthChange}
                        placeholder={currentMonthStr}
                        placeholderTextColor={colors.textMuted}
                        maxLength={7}
                        className="bg-card border-border rounded-xl px-2.5 py-1.5 text-sm font-bold text-foreground h-9"
                      />
                    </View>

                    {/* Aperçu statut planification */}
                    <View className="bg-card rounded-xl p-2.5 border border-border gap-1">
                      <View className="flex-row justify-between items-center">
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0.5 rounded ${
                            targetMonthPreviewStatus.isCounted
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-indigo-50 border-indigo-200'
                          }`}>
                          <Text
                            className={`text-[10px] font-black ${
                              targetMonthPreviewStatus.isCounted
                                ? 'text-accentDark'
                                : 'text-lavender'
                            }`}>
                            {targetMonthPreviewStatus.label}
                          </Text>
                        </Badge>
                        <Text className="text-[11px] font-bold text-muted-foreground">
                          {formatMonthYearFull(targetMonthInput)}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-muted-foreground mt-0.5">
                        {targetMonthPreviewStatus.description}
                      </Text>
                    </View>
                  </View>
                )}
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
                  {isSaving ? 'Enregistrement...' : editingItem ? 'Enregistrer' : 'Ajouter'}
                </Text>
              </Button>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
