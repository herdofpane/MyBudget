import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
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
import { router } from 'expo-router';

import { useBudget } from '@/hooks/use-budget';
import { VariableCategory } from '@/types';
import { PRESET_ICONS, PRESET_COLORS } from '@/data';
import { formatEuro, formatPercent } from '@/constants/formatters';

export default function VariableExpensesScreen() {
  const {
    variableCategories,
    totalEstimatedVariable,
    totalSpentVariable,
    remainingAllowance,
    projectedSavings,
    addVariableCategory,
    updateVariableCategory,
    deleteVariableCategory,
    addExpenseToCategory,
  } = useBudget();

  // État du modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // Modal d'ajout de dépense rapide
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [selectedCatForExpense, setSelectedCatForExpense] = useState<VariableCategory | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseLabel, setExpenseLabel] = useState('');

  // Modal d'enveloppe (création / modification)
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VariableCategory | null>(null);
  const [catLabel, setCatLabel] = useState('');
  const [catBudget, setCatBudget] = useState('');
  const [catIcon, setCatIcon] = useState('cart-outline');
  const [catColor, setCatColor] = useState('#9b6fba');

  // Ouvrir modal ajout de dépense
  const openAddExpenseModal = (category: VariableCategory) => {
    setSelectedCatForExpense(category);
    setExpenseAmount('');
    setExpenseLabel('');
    setIsExpenseModalVisible(true);
  };

  const handleSaveExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (!selectedCatForExpense || isNaN(amount) || amount <= 0) return;

    await addExpenseToCategory(
      selectedCatForExpense.id,
      amount,
      expenseLabel.trim() || selectedCatForExpense.label
    );
    setIsExpenseModalVisible(false);
  };

  // Ouvrir modal création / édition d'enveloppe
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatLabel('');
    setCatBudget('');
    setCatIcon('cart-outline');
    setCatColor('#9b6fba');
    setIsCategoryModalVisible(true);
  };

  const openEditCategoryModal = (cat: VariableCategory) => {
    setEditingCategory(cat);
    setCatLabel(cat.label);
    setCatBudget(cat.estimatedBudget.toString());
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setIsCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    const budget = parseFloat(catBudget);
    if (!catLabel.trim() || isNaN(budget) || budget < 0) return;

    if (editingCategory) {
      await updateVariableCategory({
        ...editingCategory,
        label: catLabel.trim(),
        estimatedBudget: budget,
        icon: catIcon,
        color: catColor,
      });
    } else {
      await addVariableCategory({
        label: catLabel.trim(),
        estimatedBudget: budget,
        spent: 0,
        icon: catIcon,
        color: catColor,
      });
    }
    setIsCategoryModalVisible(false);
  };

  const handleDeleteCategory = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDeleteCategory = async () => {
    if (deleteTarget) {
      await deleteVariableCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const remainingInEnvelopes = Math.max(0, totalEstimatedVariable - totalSpentVariable);
  const globalConsumptionRatio =
    totalEstimatedVariable > 0 ? (totalSpentVariable / totalEstimatedVariable) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE DE NAVIGATION AVEC PILLS */}
      <NavigationHeader
        currentRoute="variable-expenses"
        title="Charges Variables"
        subtitle="BUDGET & ENVELOPPES"
        actionButton={
          <Button variant="default" size="sm" onPress={openNewCategoryModal} style={styles.addButton}>
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.addButtonText}>Enveloppe</Text>
          </Button>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        {/* CARTE SYNTHÈSE GLOBALE */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Estimation globale des variables</Text>
            <Badge variant="secondary">
              <Text style={styles.summaryBadgeText}>{variableCategories.length} catégories</Text>
            </Badge>
          </View>

          <View style={styles.amountsRow}>
            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Budget alloué</Text>
              <Text style={styles.amountValueEstimated}>{formatEuro(totalEstimatedVariable)}</Text>
            </View>
            <View style={styles.verticalSep} />
            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Dépensé à ce jour</Text>
              <Text style={styles.amountValueSpent}>{formatEuro(totalSpentVariable)}</Text>
            </View>
            <View style={styles.verticalSep} />
            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Reste enveloppe</Text>
              <Text style={styles.amountValueLeft}>{formatEuro(remainingInEnvelopes)}</Text>
            </View>
          </View>

          {/* Jauge globale */}
          <View style={styles.gaugeSection}>
            <View style={styles.gaugeBackground}>
              <View
                style={[
                  styles.gaugeFilled,
                  {
                    width: `${Math.min(100, Math.max(0, globalConsumptionRatio))}%`,
                    backgroundColor:
                      globalConsumptionRatio > 100
                        ? '#d43f5e'
                        : globalConsumptionRatio > 80
                        ? '#d9822b'
                        : '#9b6fba',
                  },
                ]}
              />
            </View>
            <View style={styles.gaugeLegendRow}>
              <Text style={styles.gaugeLegendText}>
                {formatPercent(globalConsumptionRatio)} consommé
              </Text>
              <Text style={styles.gaugeLegendText}>
                {globalConsumptionRatio > 100
                  ? `Dépassement de ${formatEuro(totalSpentVariable - totalEstimatedVariable)}`
                  : `${formatEuro(remainingInEnvelopes)} restant`}
              </Text>
            </View>
          </View>
        </Card>

        {/* ENCART ÉPARGNE PRÉVISIONNELLE RÉSULTANTE */}
        <Card style={styles.savingsImpactCard}>
          <View style={styles.savingsImpactRow}>
            <View style={styles.savingsIconWrapper}>
              <Ionicons name="sparkles-outline" size={20} color="#1b9963" />
            </View>
            <View style={styles.savingsImpactTextGroup}>
              <Text style={styles.savingsImpactLabel}>Épargne nette prévisionnelle ce mois</Text>
              <Text style={styles.savingsImpactAmount}>{formatEuro(projectedSavings)}</Text>
              <Text style={styles.savingsImpactSubtext}>
                Reste disponible ({formatEuro(remainingAllowance)}) - Variables estimées ({formatEuro(totalEstimatedVariable)})
              </Text>
            </View>
          </View>
        </Card>

        {/* LISTE DES ENVELOPPES BUDGÉTAIRES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Enveloppes & estimations par poste</Text>
        </View>

        <View style={styles.cardsGrid}>
          {variableCategories.map((cat) => {
            const ratio = cat.estimatedBudget > 0 ? (cat.spent / cat.estimatedBudget) * 100 : 0;
            const isOver = cat.spent > cat.estimatedBudget;
            const remaining = cat.estimatedBudget - cat.spent;

            return (
              <Card key={cat.id} style={styles.catCard}>
                <View style={styles.catCardTop}>
                  <View style={styles.catCardHeaderLeft}>
                    <View style={[styles.catIconBox, { backgroundColor: `${cat.color}15` }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <View>
                      <Text style={styles.catCardTitle}>{cat.label}</Text>
                      <Text style={styles.catCardSubtitle}>
                        Estimé : {formatEuro(cat.estimatedBudget)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.catActions}>
                    <TouchableOpacity
                      onPress={() => openEditCategoryModal(cat)}
                      style={styles.iconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="pencil-outline" size={15} color="#7c6f85" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(cat.id, cat.label)}
                      style={styles.iconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={15} color="#d43f5e" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* MONTANTS & PROGRESSION */}
                <View style={styles.catAmountsRow}>
                  <View>
                    <Text style={styles.catSpentLabel}>Dépensé</Text>
                    <Text style={[styles.catSpentAmount, isOver && styles.catSpentAmountOver]}>
                      {formatEuro(cat.spent)}
                    </Text>
                  </View>
                  <View style={styles.alignRight}>
                    <Text style={styles.catRemainingLabel}>
                      {isOver ? 'Dépassement' : 'Disponible'}
                    </Text>
                    <Text style={[styles.catRemainingAmount, isOver && styles.catSpentAmountOver]}>
                      {isOver ? `+${formatEuro(Math.abs(remaining))}` : formatEuro(remaining)}
                    </Text>
                  </View>
                </View>

                {/* BARRE DE PROGRESSION CATÉGORIE */}
                <View style={styles.catProgressBarBg}>
                  <View
                    style={[
                      styles.catProgressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, ratio))}%`,
                        backgroundColor: isOver ? '#d43f5e' : ratio > 80 ? '#d9822b' : cat.color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.catCardBottomRow}>
                  <Badge variant={isOver ? 'destructive' : 'secondary'} style={styles.badgeSmall}>
                    <Text style={styles.badgeSmallText}>{formatPercent(ratio)} utilisé</Text>
                  </Badge>

                  <TouchableOpacity
                    style={styles.addExpenseBtn}
                    onPress={() => openAddExpenseModal(cat)}
                    activeOpacity={0.7}>
                    <Ionicons name="add-circle" size={16} color="#9b6fba" />
                    <Text style={styles.addExpenseBtnText}>+ Saisir dépense</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>

        {/* BANNIÈRE NAVIGATION SUIVANTE : CALCUL ET DÉTAIL */}
        <TouchableOpacity
          onPress={() => router.push('/details')}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#e6dfd3',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
            shadowColor: '#231c2b',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(27, 153, 99, 0.12)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons name="calculator-outline" size={19} color="#1b9963" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#231c2b' }}>
                Étape suivante : Bilan & Calcul 50/30/20
              </Text>
              <Text style={{ fontSize: 11, color: '#7c6f85' }}>
                Consultez l&apos;analyse budgétaire et le simulateur d&apos;épargne
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9b6fba" />
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL 1 : SAISIR UNE DÉPENSE */}
      <Modal visible={isExpenseModalVisible} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsExpenseModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Ajouter une dépense</Text>
                {selectedCatForExpense && (
                  <Text style={styles.modalSubtitle}>Enveloppe : {selectedCatForExpense.label}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setIsExpenseModalVisible(false)}>
                <Ionicons name="close" size={22} color="#7c6f85" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Montant dépensé (€)</Text>
              <Input
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="numeric"
                placeholder="Ex: 35.50"
                placeholderTextColor="#95899e"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Description (optionnelle)</Text>
              <Input
                value={expenseLabel}
                onChangeText={setExpenseLabel}
                placeholder="Ex: Supermarché du samedi"
                placeholderTextColor="#95899e"
                style={styles.input}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                variant="outline"
                onPress={() => setIsExpenseModalVisible(false)}
                style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </Button>
              <Button variant="default" onPress={handleSaveExpense} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Valider la dépense</Text>
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2 : CRÉER / MODIFIER ENVELOPPE */}
      <Modal visible={isCategoryModalVisible} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsCategoryModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Modifier l'enveloppe" : 'Nouvelle enveloppe variable'}
              </Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                <Ionicons name="close" size={22} color="#7c6f85" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>{"Nom de l'enveloppe"}</Text>
                <Input
                  value={catLabel}
                  onChangeText={setCatLabel}
                  placeholder="Ex: Sorties & Loisirs"
                  placeholderTextColor="#95899e"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Budget mensuel estimé (€)</Text>
                <Input
                  value={catBudget}
                  onChangeText={setCatBudget}
                  keyboardType="numeric"
                  placeholder="Ex: 250"
                  placeholderTextColor="#95899e"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Icône</Text>
                <View style={styles.iconPickerRow}>
                  {PRESET_ICONS.map((item) => (
                    <TouchableOpacity
                      key={item.icon}
                      onPress={() => setCatIcon(item.icon)}
                      style={[
                        styles.iconPickerItem,
                        catIcon === item.icon && styles.iconPickerItemActive,
                      ]}>
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={catIcon === item.icon ? '#9b6fba' : '#7c6f85'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Couleur</Text>
                <View style={styles.colorPickerRow}>
                  {PRESET_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCatColor(c)}
                      style={[
                        styles.colorPickerCircle,
                        { backgroundColor: c },
                        catColor === c && styles.colorPickerCircleActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => setIsCategoryModalVisible(false)}
                  style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </Button>
                <Button variant="default" onPress={handleSaveCategory} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Enregistrer</Text>
                </Button>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* POPUP DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer l'enveloppe"
        message="Êtes-vous sûr de vouloir supprimer l'enveloppe"
        highlightText={deleteTarget?.label}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive
        onConfirm={handleConfirmDeleteCategory}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c6f85',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9b6fba',
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6e6277',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: '#7c6f85',
    marginBottom: 4,
  },
  amountValueEstimated: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9b6fba',
  },
  amountValueSpent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d9822b',
  },
  amountValueLeft: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1b9963',
  },
  verticalSep: {
    width: 1,
    height: 34,
    backgroundColor: '#f0eae0',
  },
  gaugeSection: {
    marginTop: 18,
    gap: 6,
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: '#f0eae0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFilled: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLegendText: {
    fontSize: 11,
    color: '#7c6f85',
  },
  savingsImpactCard: {
    backgroundColor: 'rgba(27, 153, 99, 0.08)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 153, 99, 0.25)',
  },
  savingsImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savingsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 153, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsImpactTextGroup: {
    flex: 1,
  },
  savingsImpactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1b9963',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsImpactAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#231c2b',
    marginVertical: 2,
  },
  savingsImpactSubtext: {
    fontSize: 11,
    color: '#6e6277',
  },
  sectionHeaderRow: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardsGrid: {
    gap: 14,
  },
  catCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  catCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#231c2b',
  },
  catCardSubtitle: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 2,
  },
  catActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  catAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catSpentLabel: {
    fontSize: 11,
    color: '#7c6f85',
  },
  catSpentAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#231c2b',
  },
  catSpentAmountOver: {
    color: '#d43f5e',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  catRemainingLabel: {
    fontSize: 11,
    color: '#7c6f85',
  },
  catRemainingAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b9963',
  },
  catProgressBarBg: {
    height: 6,
    backgroundColor: '#f0eae0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#faf7f2',
    borderColor: '#e6dfd3',
  },
  badgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6e6277',
  },
  addExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(155, 111, 186, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  addExpenseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9b6fba',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(35, 28, 43, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#231c2b',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#9b6fba',
    marginTop: 2,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#231c2b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#faf7f2',
    borderColor: '#e6dfd3',
    color: '#231c2b',
    borderRadius: 12,
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconPickerItem: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPickerItemActive: {
    borderColor: '#9b6fba',
    backgroundColor: 'rgba(155, 111, 186, 0.14)',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorPickerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorPickerCircleActive: {
    borderWidth: 3,
    borderColor: '#231c2b',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#e6dfd3',
    backgroundColor: '#faf7f2',
  },
  cancelBtnText: {
    color: '#7c6f85',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#9b6fba',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
