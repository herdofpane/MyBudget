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
import { FixedExpenseItem, FixedCategoryType } from '@/types';
import { CATEGORY_CONFIG } from '@/data';
import { formatEuro, formatEuroRound, formatPercent } from '@/constants/formatters';

export default function FixedExpensesScreen() {

  const {
    fixedExpensesList,
    totalFixedExpenses,
    fixedExpenseRatio,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  } = useBudget();

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // État du modal d'ajout / modification
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedExpenseItem | null>(null);

  const [labelInput, setLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<FixedCategoryType>('logement');

  const openAddModal = () => {
    setEditingItem(null);
    setLabelInput('');
    setAmountInput('');
    setCategoryInput('logement');
    setIsModalVisible(true);
  };

  const openEditModal = (item: FixedExpenseItem) => {
    setEditingItem(item);
    setLabelInput(item.label);
    setAmountInput(item.amount.toString());
    setCategoryInput(item.category);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(amountInput.replace(',', '.'));
    if (!labelInput.trim() || isNaN(amount) || amount <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez saisir un nom et un montant valide supérieur à 0.');
      } else {
        Alert.alert('Champs incomplets', 'Veuillez saisir un nom et un montant valide.');
      }
      return;
    }

    const catConfig = CATEGORY_CONFIG[categoryInput] || CATEGORY_CONFIG.autre;

    if (editingItem) {
      await updateFixedExpense({
        ...editingItem,
        label: labelInput.trim(),
        amount,
        category: categoryInput,
        icon: catConfig.icon,
      });
    } else {
      await addFixedExpense({
        label: labelInput.trim(),
        amount,
        category: categoryInput,
        icon: catConfig.icon,
      });
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteFixedExpense(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const averageExpense =
    fixedExpensesList.length > 0 ? totalFixedExpenses / fixedExpensesList.length : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ */}
      <NavigationHeader
        title="Charges Fixes"
        subtitle="BUDGET RÉCURRENT"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        
        {/* 1. CARTE DU TOTAL DES CHARGES FIXES */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.summaryLabelRow}>
                <Text style={styles.summaryLabel}>Total des charges fixes</Text>
                <Badge variant="outline" style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>Arrondi à l&apos;unité</Text>
                </Badge>
              </View>
              <Text style={styles.summaryTotal}>{formatEuroRound(totalFixedExpenses)}</Text>
              <Text style={styles.summaryExact}>
                Montant exact : {formatEuro(totalFixedExpenses)}
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Ionicons name="layers-outline" size={16} color="#9b6fba" />
              <Text style={styles.countBadgeText}>
                {fixedExpensesList.length} charge{fixedExpensesList.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* PETIT RÉCAPITULATIF STATISTIQUE */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moyenne par charge</Text>
              <Text style={styles.statValue}>~{formatEuroRound(averageExpense)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Part des revenus</Text>
              <Text style={styles.statValue}>{formatPercent(fixedExpenseRatio)}</Text>
            </View>
          </View>
        </Card>

        {/* 2. LE TABLEAU DES CHARGES FIXES ÉPURÉ */}
        <View style={styles.tableCard}>
          {/* EN-TÊTE DU TABLEAU */}
          <View style={styles.tableTopHeader}>
            <View>
              <Text style={styles.tableTitle}>Tableau des charges</Text>
              <Text style={styles.tableSubtitle}>
                {fixedExpensesList.length} poste{fixedExpensesList.length > 1 ? 's' : ''} obligatoire{fixedExpensesList.length > 1 ? 's' : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={openAddModal}
              activeOpacity={0.7}
              style={styles.addInlineBtn}>
              <Ionicons name="add-circle" size={16} color="#9b6fba" />
              <Text style={styles.addInlineBtnText}>Nouvelle charge</Text>
            </TouchableOpacity>
          </View>

          {fixedExpensesList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={42} color="#9b6fba" />
              <Text style={styles.emptyTitle}>Aucune charge fixe enregistrée</Text>
              <Text style={styles.emptyText}>
                Ajoutez vos charges récurrentes (loyer, abonnements, assurances...) pour calculer votre budget.
              </Text>
              <Button variant="default" size="sm" onPress={openAddModal} style={{ marginTop: 12 }}>
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginLeft: 4 }}>
                  Ajouter ma première charge
                </Text>
              </Button>
            </View>
          ) : (
            <View style={styles.tableInner}>
              {/* LIGNE DES COLONNES DU TABLEAU */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, styles.colCharge]}>Charge</Text>
                <Text style={[styles.tableColHeader, styles.colAmount]}>Montant mensuel</Text>
                <Text style={[styles.tableColHeader, styles.colActions]}>Action</Text>
              </View>

              {/* LIGNES DES CHARGES */}
              {fixedExpensesList.map((item, index) => {
                const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.autre;
                const isEven = index % 2 === 0;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      isEven ? styles.tableRowEven : styles.tableRowOdd,
                      index === fixedExpensesList.length - 1 && styles.tableRowLast,
                    ]}>
                    {/* COLONNE 1 : CHARGE & CATÉGORIE */}
                    <View style={styles.colCharge}>
                      <View style={styles.tableChargeWrap}>
                        <View style={[styles.tableCatIconSmall, { backgroundColor: cat.bg }]}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tableItemTitle} numberOfLines={1}>
                            {item.label}
                          </Text>
                          <Text style={[styles.tableCatBadge, { color: cat.color }]}>
                            {cat.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* COLONNE 2 : MONTANT */}
                    <View style={styles.colAmount}>
                      <Text style={styles.tableAmountText}>
                        -{formatEuro(item.amount)}
                      </Text>
                    </View>

                    {/* COLONNE 3 : ACTIONS (MODIFIER / SUPPRIMER) */}
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

              {/* PIED DU TABLEAU : TOTAL ARRONDI À L'UNITÉ */}
              <View style={styles.tableTotalFooter}>
                <View style={styles.tableTotalLeft}>
                  <Text style={styles.tableTotalTitle}>TOTAL DES CHARGES</Text>
                  <Text style={styles.tableTotalSub}>
                    Arrondi à l&apos;unité • {fixedExpensesList.length} charges
                  </Text>
                </View>
                <View style={styles.tableTotalRight}>
                  <Text style={styles.tableTotalAmount}>
                    {formatEuroRound(totalFixedExpenses)}
                  </Text>
                  <Text style={styles.tableTotalExact}>
                    Exact : {formatEuro(totalFixedExpenses)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FORMULAIRE MODAL D'AJOUT / ÉDITION REDESSINÉ */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* EN-TÊTE DU FORMULAIRE */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalIconWrap}>
                  <Ionicons
                    name={editingItem ? 'create-outline' : 'add-circle-outline'}
                    size={20}
                    color="#9b6fba"
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingItem ? 'Modifier la charge' : 'Nouvelle charge fixe'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Poste de dépense mensuelle récurrente
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
              
              {/* CHAMP 1 : NOM DE LA CHARGE */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Nom de la charge</Text>
                <Input
                  value={labelInput}
                  onChangeText={setLabelInput}
                  placeholder="Ex: Loyer, EDF, Forfait internet..."
                  placeholderTextColor="#95899e"
                  style={styles.input}
                  autoFocus={!editingItem}
                />
              </View>

              {/* CHAMP 2 : MONTANT MENSUEL */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Montant mensuel (€)</Text>
                <Input
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 85.00"
                  placeholderTextColor="#95899e"
                  style={styles.input}
                />
              </View>

              {/* CHAMP 3 : SÉLECTION DE LA CATÉGORIE */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <View style={styles.categoryPicker}>
                  {(Object.keys(CATEGORY_CONFIG) as FixedCategoryType[]).map((catKey) => {
                    const isSelected = categoryInput === catKey;
                    const c = CATEGORY_CONFIG[catKey];
                    return (
                      <TouchableOpacity
                        key={catKey}
                        onPress={() => setCategoryInput(catKey)}
                        activeOpacity={0.7}
                        style={[
                          styles.catOption,
                          isSelected && {
                            borderColor: c.color,
                            backgroundColor: c.bg,
                          },
                        ]}>
                        <Ionicons
                          name={c.icon as any}
                          size={15}
                          color={isSelected ? c.color : '#7c6f85'}
                        />
                        <Text
                          style={[
                            styles.catOptionText,
                            isSelected && { color: c.color, fontWeight: '700' },
                          ]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* BOUTONS D'ACTION DU FORMULAIRE FIXÉS EN BAS AVEC RESPIRATION */}
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
                  {editingItem ? 'Enregistrer' : 'Ajouter la charge'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* POPUP DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer la charge fixe"
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
    backgroundColor: 'rgba(155, 111, 186, 0.12)',
    borderColor: 'rgba(155, 111, 186, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9b6fba',
    letterSpacing: 0.3,
  },
  summaryTotal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#d43f5e',
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
    backgroundColor: 'rgba(155, 111, 186, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155, 111, 186, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9b6fba',
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
    backgroundColor: 'rgba(155, 111, 186, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155, 111, 186, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  addInlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9b6fba',
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

  /* STRUCTURE DU TABLEAU */
  tableInner: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#faf7f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eae0',
    alignItems: 'center',
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colCharge: {
    flex: 1,
  },
  colAmount: {
    width: 120,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  colActions: {
    width: 68,
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
  tableCatBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  tableAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d43f5e',
  },
  tableActionBtn: {
    padding: 4,
    borderRadius: 6,
  },
  tableTotalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f6f0fa',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: '#e9dfef',
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
    color: '#6b3f8f',
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
    color: '#6b3f8f',
  },
  tableTotalExact: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 1,
  },

  /* MODAL REDESSINÉ ET TOTALEMENT RESPONSIVE */
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
    backgroundColor: 'rgba(155, 111, 186, 0.12)',
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
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  catOptionText: {
    fontSize: 12,
    color: '#65576f',
    fontWeight: '600',
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
    backgroundColor: '#9b6fba',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#9b6fba',
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
