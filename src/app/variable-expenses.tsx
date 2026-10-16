import React, { useState, useEffect } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { ConfirmDialog, AppDialog } from '@/components/confirm-dialog';
import { ListSkeleton } from '@/components/ui/loading-state';

import { useBudget } from '@/hooks/use-budget';
import { VariableCategory } from '@/types';
import { PRESET_ICONS, PRESET_COLORS } from '@/data';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

const DURATION_PRESETS = [1, 3, 6, 12, 24];

export default function VariableExpensesScreen() {
  const {
    variableCategories,
    totalEstimatedVariable,
    variableExpenseRatio,
    addVariableCategory,
    updateVariableCategory,
    deleteVariableCategory,
    isLoading,
  } = useBudget();

  // États de chargement des actions asynchrones
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // État du modal de création / modification
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VariableCategory | null>(null);

  // État des pop-ups d'alerte / validation
  const [feedbackDialog, setFeedbackDialog] = useState<{
    visible: boolean;
    type: 'warning' | 'error' | 'success';
    title: string;
    message: string;
  } | null>(null);

  // Support touche Échap sur le Web pour fermer le modal de formulaire
  useEffect(() => {
    if (Platform.OS !== 'web' || !isModalVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [durationInput, setDurationInput] = useState('1');
  const [iconInput, setIconInput] = useState('cart-outline');
  const [colorInput, setColorInput] = useState('#9b6fba');

  // Ouvrir modal ajout
  const openAddModal = () => {
    setEditingCategory(null);
    setLabelInput('');
    setAmountInput('');
    setDurationInput('1');
    setIconInput('cart-outline');
    setColorInput('#9b6fba');
    setIsModalVisible(true);
  };

  // Ouvrir modal modification
  const openEditModal = (cat: VariableCategory) => {
    setEditingCategory(cat);
    setLabelInput(cat.label);
    const total = cat.totalAmount !== undefined ? cat.totalAmount : cat.estimatedBudget;
    const duration = cat.durationMonths || 1;
    setAmountInput(total.toString());
    setDurationInput(duration.toString());
    setIconInput(cat.icon);
    setColorInput(cat.color);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const total = parseFloat(amountInput.replace(',', '.'));
    const duration = Math.max(0.01, parseFloat(durationInput.replace(',', '.')) || 1);

    if (!labelInput.trim() || isNaN(total) || total <= 0) {
      setFeedbackDialog({
        visible: true,
        type: 'warning',
        title: 'Champs incomplets',
        message: 'Veuillez saisir un titre et un montant prévisionnel valide supérieur à 0 €.',
      });
      return;
    }

    const monthly = Math.round((total / duration) * 100) / 100;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateVariableCategory({
          ...editingCategory,
          label: labelInput.trim(),
          totalAmount: total,
          durationMonths: duration,
          estimatedBudget: monthly,
          icon: iconInput,
          color: colorInput,
        });
      } else {
        await addVariableCategory({
          label: labelInput.trim(),
          totalAmount: total,
          durationMonths: duration,
          estimatedBudget: monthly,
          spent: 0,
          icon: iconInput,
          color: colorInput,
        });
      }
      setIsModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await deleteVariableCategory(deleteTarget.id);
        setDeleteTarget(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const averageExpense =
    variableCategories.length > 0 ? totalEstimatedVariable / variableCategories.length : 0;

  // Calculs dynamiques pour le modal
  const modalParsedAmount = parseFloat(amountInput.replace(',', '.')) || 0;
  const modalParsedDuration = Math.max(0.01, parseFloat(durationInput.replace(',', '.')) || 1);
  const modalMonthlyImpact = modalParsedAmount > 0 ? modalParsedAmount / modalParsedDuration : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ */}
      <NavigationHeader
        title="Charges Variables"
        subtitle="BUDGET COURANT"
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2.5 pb-[110px] gap-4 w-full max-w-[860px] self-center">

          {/* 1. CARTE DU TOTAL DES CHARGES VARIABLES (IMPACT MENSUEL LISSÉ) */}
          <Card className="bg-card rounded-3xl p-5 border border-border shadow-xs gap-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total des charges variables (mensuel)
                  </Text>
                  <Badge variant="outline" className="border-border bg-muted/30 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] text-muted-foreground font-semibold">
                      Arrondi à l&apos;unité
                    </Text>
                  </Badge>
                </View>
                <Text className="text-3xl font-black text-foreground tracking-tight">
                  {formatEuroRound(totalEstimatedVariable)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Montant mensuel exact : {formatEuro(totalEstimatedVariable)}
                </Text>
              </View>

              <Badge variant="outline" className="bg-amber-50 border-amber-200 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="pie-chart-outline" size={14} color="#D97706" />
                <Text className="text-xs font-bold text-amber-800">
                  {variableCategories.length} charge{variableCategories.length > 1 ? 's' : ''}
                </Text>
              </Badge>
            </View>

            {/* RÉCAPITULATIF STATISTIQUE */}
            <View className="flex-row items-center bg-muted/30 rounded-2xl p-3 border border-border">
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Moyenne mensuelle</Text>
                <Text className="text-sm font-bold text-foreground mt-0.5">
                  ~{formatEuroRound(averageExpense)}
                </Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="flex-1 items-center">
                <Text className="text-[11px] text-muted-foreground font-medium">Part des revenus</Text>
                <Text className="text-sm font-bold text-foreground mt-0.5">
                  {formatPercent(variableExpenseRatio)}
                </Text>
              </View>
            </View>
          </Card>

          {/* 2. LE TABLEAU DES CHARGES VARIABLES */}
          <Card className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* EN-TÊTE DE LA CARTE TABLEAU */}
            <View className="flex-row justify-between items-center p-5 border-b border-border">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 justify-center items-center">
                  <Ionicons name="pie-chart-outline" size={18} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">
                    Charges variables & amortissements
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {variableCategories.length} poste{variableCategories.length > 1 ? 's' : ''} lissé{variableCategories.length > 1 ? 's' : ''} sur la durée
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={openAddModal}
                className="border-amber-300 bg-amber-50 gap-1.5 rounded-xl h-9 px-3">
                <Ionicons name="add-circle" size={16} color="#D97706" />
                <Text className="text-xs font-bold text-amber-800">Nouvelle charge</Text>
              </Button>
            </View>

            {variableCategories.length === 0 ? (
              <View className="p-8 items-center justify-center gap-3">
                <Ionicons name="folder-open-outline" size={42} color="#D97706" />
                <Text className="text-base font-bold text-foreground text-center">
                  Aucune charge variable enregistrée
                </Text>
                <Text className="text-xs text-muted-foreground text-center max-w-[420px]">
                  Ajoutez vos charges variables avec leur montant et leur durée de vie sur X mois pour calculer automatiquement l&apos;impact mensuel.
                </Text>
                <Button
                  onPress={openAddModal}
                  className="bg-primary rounded-xl px-4 py-2 mt-2 gap-1.5 h-auto">
                  <Ionicons name="add" size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-white">
                    Ajouter ma première charge variable
                  </Text>
                </Button>
              </View>
            ) : (
              <View>
                {/* LIGNE DES COLONNES DU TABLEAU */}
                <View className="flex-row items-center px-4 py-3 bg-muted/40 border-b border-border">
                  <Text className="flex-[2] text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    POSTE DE CHARGE
                  </Text>
                  <Text className="flex-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    MONTANT TOTAL
                  </Text>
                  <Text className="flex-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                    DURÉE / LISSAGE
                  </Text>
                  <Text className="w-16 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    ACTIONS
                  </Text>
                </View>

                {/* LIGNES DES CHARGES VARIABLES */}
                {variableCategories.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const total = item.totalAmount !== undefined ? item.totalAmount : item.estimatedBudget;
                  const duration = Math.max(0.01, item.durationMonths || 1);
                  const monthly = item.estimatedBudget || Math.round((total / duration) * 100) / 100;
                  const formattedDuration = Number.isInteger(duration)
                    ? `${duration} mois`
                    : `${duration.toString().replace('.', ',')} mois`;

                  return (
                    <View
                      key={item.id}
                      className={`flex-row items-center px-4 py-3.5 border-b border-border/60 ${
                        isEven ? 'bg-card' : 'bg-muted/10'
                      }`}>
                      {/* COLONNE 1 : TITRE */}
                      <View className="flex-[2] flex-row items-center gap-2.5 pr-2">
                        <View
                          className="w-8 h-8 rounded-lg justify-center items-center"
                          style={{ backgroundColor: `${item.color}15` }}>
                          <Ionicons name={item.icon as any} size={16} color={item.color} />
                        </View>
                        <Text className="text-sm font-bold text-foreground flex-1" numberOfLines={1}>
                          {item.label}
                        </Text>
                      </View>

                      {/* COLONNE 2 : MONTANT */}
                      <View className="flex-1 items-end">
                        <Text className="text-sm font-black text-foreground">
                          -{formatEuro(total)}
                        </Text>
                        {duration !== 1 && (
                          <Text className="text-[11px] text-muted-foreground">
                            soit {formatEuro(monthly)}/mois
                          </Text>
                        )}
                      </View>

                      {/* COLONNE 3 : DURÉE DE VIE SUR X MOIS */}
                      <View className="flex-1 items-center">
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 gap-1 px-2 py-0.5 rounded-full">
                          <Ionicons name="calendar-outline" size={12} color="#D97706" />
                          <Text className="text-[11px] font-semibold text-amber-800">
                            {formattedDuration}
                          </Text>
                        </Badge>
                      </View>

                      {/* COLONNE 4 : ACTIONS (MODIFIER / SUPPRIMER) */}
                      <View className="w-16 flex-row items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => openEditModal(item)}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Modifier ${item.label}`}>
                          <Ionicons name="pencil-outline" size={15} color="#64748B" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => handleDelete(item.id, item.label)}
                          className="w-7 h-7 rounded-lg"
                          accessibilityLabel={`Supprimer ${item.label}`}>
                          <Ionicons name="trash-outline" size={15} color="#F87171" />
                        </Button>
                      </View>
                    </View>
                  );
                })}

                {/* PIED DU TABLEAU : TOTAL MENSUEL LISSÉ */}
                <View className="flex-row justify-between items-center px-5 py-4 bg-muted/30 border-t border-border">
                  <View>
                    <Text className="text-xs font-black text-foreground uppercase tracking-wider">
                      TOTAL MENSUEL LISSÉ
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Arrondi à l&apos;unité • {variableCategories.length} charges
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-black text-foreground">
                      {formatEuroRound(totalEstimatedVariable)}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Exact : {formatEuro(totalEstimatedVariable)} / mois
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </ScrollView>
      )}

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION D'UNE CHARGE VARIABLE */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={() => setIsModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full max-w-[500px]">
            <Pressable
              className="bg-card rounded-3xl p-6 border border-border shadow-lg w-full gap-4 max-h-[90vh]"
              onPress={(e) => e.stopPropagation()}>
              
              {/* EN-TÊTE MODAL */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 justify-center items-center">
                    <Ionicons
                      name={editingCategory ? 'create-outline' : 'add-circle-outline'}
                      size={20}
                      color="#D97706"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-black text-foreground">
                      {editingCategory ? 'Modifier la charge variable' : 'Nouvelle charge variable'}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Lissage automatique : Montant ÷ Durée en mois
                    </Text>
                  </View>
                </View>

                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => setIsModalVisible(false)}
                  className="w-8 h-8 rounded-full"
                  accessibilityLabel="Fermer la boîte de dialogue">
                  <Ionicons name="close" size={20} color="#64748B" />
                </Button>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-4 pb-2"
                bounces={false}>
                
                {/* CHAMP 1 : TITRE */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Titre</Text>
                  <Input
                    value={labelInput}
                    onChangeText={setLabelInput}
                    placeholder="Ex: Entretien voiture, Vacances, Alimentation..."
                    placeholderTextColor="#64748B"
                    className="bg-muted/40 border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground h-11"
                    autoFocus={!editingCategory}
                  />
                </View>

                {/* CHAMP 2 : MONTANT */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Montant (€)</Text>
                  <Input
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="decimal-pad"
                    placeholder="Ex: 600.00"
                    placeholderTextColor="#64748B"
                    className="bg-muted/40 border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground h-11"
                  />
                </View>

                {/* CHAMP 3 : DURÉE DE VIE SUR X MOIS */}
                <View className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-foreground">Durée de vie Sur x Mois</Text>
                    <Text className="text-[11px] text-muted-foreground">Nombre de mois pour le lissage</Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Input
                      value={durationInput}
                      onChangeText={(val) => {
                        const sanitized = val.replace(/[^0-9.,]/g, '');
                        setDurationInput(sanitized);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="1"
                      placeholderTextColor="#64748B"
                      className="w-20 bg-muted/40 border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground h-11 text-center"
                    />
                    <Text className="text-xs font-bold text-muted-foreground">mois</Text>

                    {/* BOUTONS PRÉRÉGLAGES RAPIDES */}
                    <View className="flex-row gap-1.5 flex-1 justify-end flex-wrap">
                      {DURATION_PRESETS.map((m) => {
                        const isActive = durationInput === m.toString();
                        return (
                          <Button
                            key={m}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onPress={() => setDurationInput(m.toString())}
                            className={`px-2.5 py-1 rounded-lg h-9 ${
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
                    <View className="flex-row items-center bg-amber-50 p-3 rounded-xl border border-amber-200 gap-2.5 mt-2">
                      <Ionicons name="calculator-outline" size={18} color="#D97706" />
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">
                          Impact mensuel calculé :{' '}
                          <Text className="text-amber-800 font-extrabold">
                            {formatEuro(modalMonthlyImpact)} / mois
                          </Text>
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">
                          {formatEuro(modalParsedAmount)} lissés sur {modalParsedDuration.toString().replace('.', ',')} mois
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* CHAMP 4 : ICÔNE */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Icône illustrative</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {PRESET_ICONS.map((item) => {
                      const isSelected = iconInput === item.icon;
                      return (
                        <Button
                          key={item.icon}
                          variant="outline"
                          size="icon"
                          onPress={() => setIconInput(item.icon)}
                          className={`w-10 h-10 rounded-xl ${
                            isSelected ? 'border-amber-500 bg-amber-50' : 'border-border bg-muted/30'
                          }`}>
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={isSelected ? '#D97706' : '#64748B'}
                          />
                        </Button>
                      );
                    })}
                  </View>
                </View>

                {/* CHAMP 5 : COULEUR */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-foreground">Couleur distinctive</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setColorInput(color)}
                        activeOpacity={0.7}
                        className={`w-9 h-9 rounded-full justify-center items-center ${
                          colorInput === color ? 'border-2 border-foreground' : ''
                        }`}
                        style={{ backgroundColor: color }}>
                        {colorInput === color && (
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* BOUTONS D'ACTION DU MODAL */}
              <View className="flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onPress={() => setIsModalVisible(false)}
                  className="rounded-xl px-4 py-2.5 h-auto">
                  <Text className="text-xs font-bold text-foreground">Annuler</Text>
                </Button>

                <Button
                  onPress={handleSave}
                  disabled={isSaving}
                  className={`bg-primary rounded-xl px-4 py-2.5 gap-1.5 h-auto ${
                    isSaving ? 'opacity-80' : ''
                  }`}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" className="mr-1.5" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  )}
                  <Text className="text-xs font-bold text-white">
                    {isSaving ? 'Enregistrement...' : editingCategory ? 'Enregistrer' : 'Ajouter la charge'}
                  </Text>
                </Button>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* POPUP DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer la charge variable"
        message="Êtes-vous sûr de vouloir supprimer la charge"
        highlightText={deleteTarget?.label}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* POPUP DE VALIDATION ET D'ERREUR */}
      {feedbackDialog && (
        <AppDialog
          visible={feedbackDialog.visible}
          type={feedbackDialog.type}
          title={feedbackDialog.title}
          message={feedbackDialog.message}
          confirmLabel="Compris"
          onConfirm={() => setFeedbackDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}
