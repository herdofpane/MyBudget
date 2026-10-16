import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
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
import { ConfirmDialog } from '@/components/confirm-dialog';

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
  } = useBudget();

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // État du modal de création / modification
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VariableCategory | null>(null);
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
      if (Platform.OS === 'web') {
        window.alert('Veuillez saisir un titre et un montant valide supérieur à 0.');
      } else {
        Alert.alert('Champs incomplets', 'Veuillez saisir un titre et un montant valide supérieur à 0.');
      }
      return;
    }

    const monthly = Math.round((total / duration) * 100) / 100;

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
  };

  const handleDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteVariableCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const averageExpense =
    variableCategories.length > 0 ? totalEstimatedVariable / variableCategories.length : 0;

  // Calculs dynamiques pour le modal
  const modalParsedAmount = parseFloat(amountInput.replace(',', '.')) || 0;
  const modalParsedDuration = Math.max(0.01, parseFloat(durationInput.replace(',', '.')) || 1);
  const modalMonthlyImpact = modalParsedAmount > 0 ? modalParsedAmount / modalParsedDuration : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ */}
      <NavigationHeader
        title="Charges Variables"
        subtitle="BUDGET COURANT"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        
        {/* 1. CARTE DU TOTAL DES CHARGES VARIABLES (IMPACT MENSUEL LISSÉ) */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.summaryLabelRow}>
                <Text style={styles.summaryLabel}>Total des charges variables (mensuel)</Text>
                <Badge variant="outline" style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>Arrondi à l&apos;unité</Text>
                </Badge>
              </View>
              <Text style={styles.summaryTotal}>{formatEuroRound(totalEstimatedVariable)}</Text>
              <Text style={styles.summaryExact}>
                Montant mensuel exact : {formatEuro(totalEstimatedVariable)}
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Ionicons name="pie-chart-outline" size={16} color="#d9822b" />
              <Text style={styles.countBadgeText}>
                {variableCategories.length} charge{variableCategories.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* RÉCAPITULATIF STATISTIQUE */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moyenne mensuelle</Text>
              <Text style={styles.statValue}>~{formatEuroRound(averageExpense)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Part des revenus</Text>
              <Text style={styles.statValue}>{formatPercent(variableExpenseRatio)}</Text>
            </View>
          </View>
        </Card>

        {/* 2. LE TABLEAU DES CHARGES VARIABLES : TITRE | MONTANT | DURÉE DE VIE SUR X MOIS */}
        <View style={styles.tableCard}>
          {/* EN-TÊTE DE LA CARTE TABLEAU */}
          <View style={styles.tableTopHeader}>
            <View>
              <Text style={styles.tableTitle}>Tableau des charges variables</Text>
              <Text style={styles.tableSubtitle}>
                {variableCategories.length} poste{variableCategories.length > 1 ? 's' : ''} de dépense avec lissage mensuel
              </Text>
            </View>

            <TouchableOpacity
              onPress={openAddModal}
              activeOpacity={0.7}
              style={styles.addInlineBtn}>
              <Ionicons name="add-circle" size={16} color="#d9822b" />
              <Text style={styles.addInlineBtnText}>Nouvelle charge</Text>
            </TouchableOpacity>
          </View>

          {variableCategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={42} color="#d9822b" />
              <Text style={styles.emptyTitle}>Aucune charge variable enregistrée</Text>
              <Text style={styles.emptyText}>
                Ajoutez vos charges variables avec leur montant et leur durée de vie sur X mois pour calculer automatiquement l&apos;impact mensuel.
              </Text>
              <Button variant="default" size="sm" onPress={openAddModal} style={{ marginTop: 12 }}>
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginLeft: 4 }}>
                  Ajouter ma première charge variable
                </Text>
              </Button>
            </View>
          ) : (
            <View style={styles.tableInner}>
              {/* LIGNE DES COLONNES DU TABLEAU (CONFORME À L'IMAGE DEMANDÉE) */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.colTitre]}>Titre</Text>
                <Text style={[styles.tableColHeader, styles.colMontant]}>Montant</Text>
                <Text style={[styles.tableColHeader, styles.colDuration]}>Durée de vie Sur x Mois</Text>
                <Text style={[styles.tableColHeader, styles.colActions]}>Action</Text>
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
                    style={[
                      styles.tableRow,
                      isEven ? styles.tableRowEven : styles.tableRowOdd,
                      index === variableCategories.length - 1 && styles.tableRowLast,
                    ]}>
                    {/* COLONNE 1 : TITRE */}
                    <View style={styles.colTitre}>
                      <View style={styles.tableChargeWrap}>
                        <View style={[styles.tableCatIconSmall, { backgroundColor: `${item.color}15` }]}>
                          <Ionicons name={item.icon as any} size={16} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tableItemTitle} numberOfLines={1}>
                            {item.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* COLONNE 2 : MONTANT */}
                    <View style={styles.colMontant}>
                      <Text style={styles.tableAmountText}>
                        -{formatEuro(total)}
                      </Text>
                      {duration !== 1 && (
                        <Text style={styles.tableMonthlySubText}>
                          soit {formatEuro(monthly)}/mois
                        </Text>
                      )}
                    </View>

                    {/* COLONNE 3 : DURÉE DE VIE SUR X MOIS */}
                    <View style={styles.colDuration}>
                      <View style={styles.durationBadge}>
                        <Ionicons name="calendar-outline" size={13} color="#92400e" />
                        <Text style={styles.durationBadgeText}>
                          {formattedDuration}
                        </Text>
                      </View>
                    </View>

                    {/* COLONNE 4 : ACTIONS (MODIFIER / SUPPRIMER) */}
                    <View style={styles.colActions}>
                      <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        style={styles.tableActionBtn}
                        accessibilityLabel={`Modifier ${item.label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="pencil-outline" size={16} color="#7c6f85" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.label)}
                        style={styles.tableActionBtn}
                        accessibilityLabel={`Supprimer ${item.label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={16} color="#d43f5e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* PIED DU TABLEAU : TOTAL MENSUEL LISSÉ */}
              <View style={styles.tableTotalFooter}>
                <View style={styles.tableTotalLeft}>
                  <Text style={styles.tableTotalTitle}>TOTAL MENSUEL LISSÉ</Text>
                  <Text style={styles.tableTotalSub}>
                    Arrondi à l&apos;unité • {variableCategories.length} charges
                  </Text>
                </View>
                <View style={styles.tableTotalRight}>
                  <Text style={styles.tableTotalAmount}>
                    {formatEuroRound(totalEstimatedVariable)}
                  </Text>
                  <Text style={styles.tableTotalExact}>
                    Exact : {formatEuro(totalEstimatedVariable)} / mois
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION D'UNE CHARGE VARIABLE */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalIconWrap}>
                  <Ionicons
                    name={editingCategory ? 'create-outline' : 'add-circle-outline'}
                    size={20}
                    color="#d9822b"
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingCategory ? 'Modifier la charge variable' : 'Nouvelle charge variable'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Lissage automatique : Montant ÷ Durée en mois
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeBtn}
                accessibilityLabel="Fermer la boîte de dialogue">
                <Ionicons name="close" size={20} color="#7c6f85" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
              bounces={false}>
              
              {/* CHAMP 1 : TITRE */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Titre</Text>
                <Input
                  value={labelInput}
                  onChangeText={setLabelInput}
                  placeholder="Ex: Entretien voiture, Vacances, Alimentation..."
                  placeholderTextColor="#95899e"
                  style={styles.input}
                  autoFocus={!editingCategory}
                />
              </View>

              {/* CHAMP 2 : MONTANT */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Montant (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 600.00"
                  placeholderTextColor="#95899e"
                  style={styles.input}
                />
              </View>

              {/* CHAMP 3 : DURÉE DE VIE SUR X MOIS */}
              <View style={styles.formGroup}>
                <View style={styles.durationHeaderRow}>
                  <Text style={styles.inputLabel}>Durée de vie Sur x Mois</Text>
                  <Text style={styles.durationHint}>Nombre de mois pour le lissage</Text>
                </View>

                <View style={styles.durationInputRow}>
                  <Input
                    value={durationInput}
                    onChangeText={(val) => {
                      // Autorise les chiffres, la virgule et le point décimal
                      const sanitized = val.replace(/[^0-9.,]/g, '');
                      setDurationInput(sanitized);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor="#95899e"
                    style={[styles.input, styles.durationNumericInput]}
                  />
                  <Text style={styles.durationUnitText}>mois</Text>

                  {/* BOUTONS PRÉRÉGLAGES RAPIDES */}
                  <View style={styles.durationPillsWrap}>
                    {DURATION_PRESETS.map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setDurationInput(m.toString())}
                        activeOpacity={0.7}
                        style={[
                          styles.durationPill,
                          durationInput === m.toString() && styles.durationPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.durationPillText,
                            durationInput === m.toString() && styles.durationPillTextActive,
                          ]}>
                          {m}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* ENCART EN DIRECT DU CALCUL DE LISSAGE */}
                {modalParsedAmount > 0 && (
                  <View style={styles.monthlySmoothingBox}>
                    <Ionicons name="calculator-outline" size={18} color="#d9822b" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.monthlySmoothingText}>
                        Impact mensuel calculé :{' '}
                        <Text style={styles.monthlySmoothingHighlight}>
                          {formatEuro(modalMonthlyImpact)} / mois
                        </Text>
                      </Text>
                      <Text style={styles.monthlySmoothingSub}>
                        {formatEuro(modalParsedAmount)} lissés sur {modalParsedDuration.toString().replace('.', ',')} mois
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* CHAMP 4 : ICÔNE */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Icône illustrative</Text>
                <View style={styles.presetIconsRow}>
                  {PRESET_ICONS.map((item) => (
                    <TouchableOpacity
                      key={item.icon}
                      onPress={() => setIconInput(item.icon)}
                      activeOpacity={0.7}
                      style={[
                        styles.iconPresetBtn,
                        iconInput === item.icon && styles.iconPresetBtnSelected,
                      ]}>
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={iconInput === item.icon ? '#d9822b' : '#7c6f85'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* CHAMP 5 : COULEUR */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Couleur distinctive</Text>
                <View style={styles.presetColorsRow}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setColorInput(color)}
                      activeOpacity={0.7}
                      style={[
                        styles.colorPresetBtn,
                        { backgroundColor: color },
                        colorInput === color && styles.colorPresetBtnSelected,
                      ]}>
                      {colorInput === color && (
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* BOUTONS D'ACTION FIXÉS EN BAS AVEC RESPIRATION */}
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
                style={styles.cancelActionBtn}>
                <Text style={styles.cancelActionBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                style={styles.saveActionBtn}>
                <Ionicons name="checkmark" size={18} color="#ffffff" />
                <Text style={styles.saveActionBtnText}>
                  {editingCategory ? 'Enregistrer' : 'Ajouter la charge'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
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
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f0e8',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9822b',
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },

  /* CARTE DU TOTAL */
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  unitBadge: {
    backgroundColor: 'rgba(217, 130, 43, 0.12)',
    borderColor: 'rgba(217, 130, 43, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d9822b',
    letterSpacing: 0.3,
  },
  summaryTotal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#d9822b',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  summaryExact: {
    fontSize: 13,
    color: '#7c6f85',
    fontWeight: '600',
    marginTop: 4,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 130, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 130, 43, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d9822b',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e8e1d5',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#e6dfd3',
    marginHorizontal: 14,
  },

  /* CARTE DU TABLEAU */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    overflow: 'hidden',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tableTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eae0',
    backgroundColor: '#ffffff',
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
    letterSpacing: 0.2,
  },
  tableSubtitle: {
    fontSize: 11,
    color: '#7c6f85',
    fontWeight: '600',
    marginTop: 2,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217, 130, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 130, 43, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  addInlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d9822b',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#7c6f85',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },

  /* STRUCTURE DU TABLEAU ET COLONNES */
  tableInner: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#fcd9b8', // Couleur beige/orangée douce conforme à l'image
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0c69d',
    alignItems: 'center',
  },
  tableColHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0e2646', // Texte sombre bien lisible
    letterSpacing: 0.2,
  },
  colTitre: {
    flex: 1.2,
  },
  colMontant: {
    width: 120,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  colDuration: {
    width: 140,
    alignItems: 'center',
    textAlign: 'center',
  },
  colActions: {
    width: 64,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2ede4',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#fbf9f6',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableChargeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableCatIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#231c2b',
  },
  tableAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d9822b',
  },
  tableMonthlySubText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7c6f85',
    marginTop: 2,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 130, 43, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 130, 43, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  tableActionBtn: {
    padding: 4,
    borderRadius: 6,
  },
  tableTotalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdf6ee',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: '#f5e3d0',
  },
  tableTotalLeft: {
    flex: 1,
  },
  tableTotalRight: {
    alignItems: 'flex-end',
  },
  tableTotalTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b06518',
    letterSpacing: 0.5,
  },
  tableTotalSub: {
    fontSize: 10,
    color: '#7c6f85',
    marginTop: 2,
  },
  tableTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b06518',
  },
  tableTotalExact: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 1,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 20, 36, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#1b1424',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eae0',
    backgroundColor: '#ffffff',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 130, 43, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#231c2b',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#faf7f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e1d5',
  },
  modalScrollBody: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34293f',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#faf7f2',
    borderColor: '#ded6c7',
    borderWidth: 1,
    color: '#231c2b',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  durationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationHint: {
    fontSize: 11,
    color: '#7c6f85',
    fontWeight: '600',
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationNumericInput: {
    width: 85,
    textAlign: 'center',
  },
  durationUnitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#65576f',
    marginRight: 6,
  },
  durationPillsWrap: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  durationPill: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#ded6c7',
  },
  durationPillActive: {
    backgroundColor: 'rgba(217, 130, 43, 0.15)',
    borderColor: '#d9822b',
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c6f85',
  },
  durationPillTextActive: {
    color: '#d9822b',
  },
  monthlySmoothingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 130, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 130, 43, 0.25)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  monthlySmoothingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34293f',
  },
  monthlySmoothingHighlight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#d9822b',
  },
  monthlySmoothingSub: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 2,
  },
  presetIconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  iconPresetBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPresetBtnSelected: {
    borderColor: '#d9822b',
    backgroundColor: 'rgba(217, 130, 43, 0.15)',
  },
  presetColorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  colorPresetBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPresetBtnSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#f0eae0',
    backgroundColor: '#ffffff',
  },
  cancelActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dcd4c6',
    backgroundColor: '#faf7f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#65576f',
  },
  saveActionBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#d9822b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#d9822b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
