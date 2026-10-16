import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';

import { useBudget } from '@/hooks/use-budget';
import { formatEuro } from '@/constants/formatters';

export default function HomeScreen() {
  const {
    budget,
    fixedExpensesList,
    totalFixedExpenses,
    remainingAllowance,
    saveBudget,
  } = useBudget();

  // Mode privé (masquer les soldes si besoin)
  const [isPrivate, setIsPrivate] = useState(false);

  // Modal d'ajustement des finances (revenus, compte courant, épargne)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    income: budget.income.toString(),
    checkingAccount: budget.checkingAccount.toString(),
    savingsAccount: budget.savingsAccount.toString(),
  });

  const openEditModal = () => {
    setFormValues({
      income: budget.income.toString(),
      checkingAccount: budget.checkingAccount.toString(),
      savingsAccount: budget.savingsAccount.toString(),
    });
    setIsEditModalVisible(true);
  };

  const handleSaveBudget = () => {
    saveBudget({
      income: parseFloat(formValues.income.replace(',', '.')) || 0,
      fixedExpenses: totalFixedExpenses,
      checkingAccount: parseFloat(formValues.checkingAccount.replace(',', '.')) || 0,
      savingsAccount: parseFloat(formValues.savingsAccount.replace(',', '.')) || 0,
    });
    setIsEditModalVisible(false);
  };

  // Formattage avec prise en compte du mode privé
  const renderMoney = (amount: number, prefix: string = '') => {
    if (isPrivate) return '•••• €';
    return `${prefix}${formatEuro(amount)}`;
  };

  // Date et rythme indicatif
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const totalDaysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - now.getDate() + 1);
  const dailyAllowance = Math.max(0, remainingAllowance / daysRemaining);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL */}
      <NavigationHeader
        title="Mon Budget"
        subtitle={`VUE D'ENSEMBLE • ${formattedMonth.toUpperCase()}`}
        actionButton={
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsPrivate(!isPrivate)}
              style={styles.iconHeaderButton}
              accessibilityLabel="Masquer ou afficher les montants">
              <Ionicons
                name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#65576f"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openEditModal}
              style={[styles.iconHeaderButton, styles.editHeaderBtn]}
              accessibilityLabel="Modifier mes montants">
              <Ionicons name="pencil-outline" size={17} color="#ffffff" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        
        {/* 1. CARTE HERO : LE RESTE À VIVRE (MONTANT CENTRAL) */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>Reste à vivre mensuel</Text>
            </View>

            <Badge variant="outline" style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>{daysRemaining} jours restants</Text>
            </Badge>
          </View>

          {/* MONTANT GÉANT DU RESTE À VIVRE */}
          <Text style={styles.heroAmount}>{renderMoney(remainingAllowance)}</Text>

          {/* FORMULE EXPLICITE DU RESTE À VIVRE */}
          <View style={styles.formulaRow}>
            <Ionicons name="calculator-outline" size={15} color="#d9822b" />
            <Text style={styles.formulaText}>
              Calcul : <Text style={styles.formulaHighlight}>{renderMoney(budget.income)}</Text> (Revenus) −{' '}
              <Text style={styles.formulaHighlight}>{renderMoney(totalFixedExpenses)}</Text> (Charges fixes)
            </Text>
          </View>

          {/* ESTIMATION JOURNALIÈRE DU RESTE À VIVRE */}
          <View style={styles.heroFooter}>
            <View style={styles.dailyItem}>
              <Text style={styles.dailyLabel}>Rythme quotidien conseillé</Text>
              <Text style={styles.dailyAmount}>~{renderMoney(dailyAllowance)} / jour</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/details')}
              style={styles.heroDetailBtn}>
              <Text style={styles.heroDetailBtnText}>Voir le calcul complet</Text>
              <Ionicons name="chevron-forward" size={14} color="#d9822b" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* 2. LES 4 MONTANTS CLÉS DU BUDGET (GRILLE RESPONSIVE 2x2) */}
        <View style={styles.gridSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Mes 4 montants clés</Text>
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.7}>
              <Text style={styles.sectionEditLink}>Ajuster</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.kpiGrid}>
            {/* 1. MONTANT DES REVENUS */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openEditModal}
              style={[styles.kpiCard, styles.incomeCard]}>
              <View style={styles.kpiHeaderRow}>
                <View style={[styles.kpiIconWrap, styles.incomeIconBg]}>
                  <Ionicons name="trending-up-outline" size={18} color="#059669" />
                </View>
                <Badge variant="outline" style={styles.kpiBadge}>
                  <Text style={[styles.kpiBadgeText, { color: '#059669' }]}>Entrées</Text>
                </Badge>
              </View>

              <Text style={styles.kpiLabel}>Mes revenus</Text>
              <Text style={[styles.kpiAmount, { color: '#059669' }]}>
                {renderMoney(budget.income, '+')}
              </Text>
              <Text style={styles.kpiSubtitle}>Revenu mensuel net</Text>
            </TouchableOpacity>

            {/* 2. MONTANT DES CHARGES FIXES */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/fixed-expenses')}
              style={[styles.kpiCard, styles.fixedCard]}>
              <View style={styles.kpiHeaderRow}>
                <View style={[styles.kpiIconWrap, styles.fixedIconBg]}>
                  <Ionicons name="repeat-outline" size={18} color="#9b6fba" />
                </View>
                <Badge variant="outline" style={styles.kpiBadge}>
                  <Text style={[styles.kpiBadgeText, { color: '#9b6fba' }]}>Prélèvements</Text>
                </Badge>
              </View>

              <Text style={styles.kpiLabel}>Charges fixes</Text>
              <Text style={[styles.kpiAmount, { color: '#dc2626' }]}>
                -{renderMoney(totalFixedExpenses)}
              </Text>
              <Text style={styles.kpiSubtitle}>
                {fixedExpensesList.length} charges récurrentes
              </Text>
            </TouchableOpacity>

            {/* 3. MONTANT DU COMPTE COURANT */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openEditModal}
              style={[styles.kpiCard, styles.checkingCard]}>
              <View style={styles.kpiHeaderRow}>
                <View style={[styles.kpiIconWrap, styles.checkingIconBg]}>
                  <Ionicons name="card-outline" size={18} color="#2563eb" />
                </View>
                <Badge variant="outline" style={styles.kpiBadge}>
                  <Text style={[styles.kpiBadgeText, { color: '#2563eb' }]}>Disponible</Text>
                </Badge>
              </View>

              <Text style={styles.kpiLabel}>Compte courant</Text>
              <Text style={[styles.kpiAmount, { color: '#231c2b' }]}>
                {renderMoney(budget.checkingAccount)}
              </Text>
              <Text style={styles.kpiSubtitle}>Solde bancaire actuel</Text>
            </TouchableOpacity>

            {/* 4. MONTANT DE L'ÉPARGNE */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openEditModal}
              style={[styles.kpiCard, styles.savingsCard]}>
              <View style={styles.kpiHeaderRow}>
                <View style={[styles.kpiIconWrap, styles.savingsIconBg]}>
                  <MaterialCommunityIcons name="piggy-bank-outline" size={19} color="#0d9488" />
                </View>
                <Badge variant="outline" style={styles.kpiBadge}>
                  <Text style={[styles.kpiBadgeText, { color: '#0d9488' }]}>Réserves</Text>
                </Badge>
              </View>

              <Text style={styles.kpiLabel}>Mon épargne</Text>
              <Text style={[styles.kpiAmount, { color: '#0d9488' }]}>
                {renderMoney(budget.savingsAccount)}
              </Text>
              <Text style={styles.kpiSubtitle}>Total épargne sécurisée</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. RACCOURCIS RAPIDES VERS LES TABLEAUX ET CALCULS */}
        <View style={styles.shortcutsCard}>
          <Text style={styles.shortcutsTitle}>Accès direct aux rubriques</Text>
          <View style={styles.shortcutsRow}>
            {/* Raccourci 1 : Charges Fixes */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/fixed-expenses')}
              style={styles.shortcutBtn}>
              <View style={[styles.shortcutIconBg, { backgroundColor: 'rgba(155, 111, 186, 0.12)' }]}>
                <Ionicons name="calendar-outline" size={20} color="#9b6fba" />
              </View>
              <Text style={styles.shortcutLabel}>Charges Fixes</Text>
              <Text style={styles.shortcutSub}>{fixedExpensesList.length} charges</Text>
            </TouchableOpacity>

            {/* Raccourci 2 : Charges Variables */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/variable-expenses')}
              style={styles.shortcutBtn}>
              <View style={[styles.shortcutIconBg, { backgroundColor: 'rgba(217, 130, 43, 0.12)' }]}>
                <Ionicons name="pie-chart-outline" size={20} color="#d9822b" />
              </View>
              <Text style={styles.shortcutLabel}>Charges Variables</Text>
              <Text style={styles.shortcutSub}>Lissage mensuel</Text>
            </TouchableOpacity>

            {/* Raccourci 3 : Calcul & Détails */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/details')}
              style={styles.shortcutBtn}>
              <View style={[styles.shortcutIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="calculator-outline" size={20} color="#10b981" />
              </View>
              <Text style={styles.shortcutLabel}>Calcul & Épargne</Text>
              <Text style={styles.shortcutSub}>Bilan complet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL : MODIFIER MES REVENUS, COMPTE COURANT ET ÉPARGNE */}
      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsEditModalVisible(false)}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalHeaderIconWrap}>
                  <Ionicons name="wallet-outline" size={20} color="#9b6fba" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Ajuster mes montants</Text>
                  <Text style={styles.modalSubtitle}>Revenus, compte courant et épargne</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Fermer la boîte de dialogue">
                <Ionicons name="close" size={20} color="#7c6f85" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
              bounces={false}>
              {/* CHAMP 1 : REVENU NET */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Revenu mensuel net (€)</Text>
                <TextInput
                  value={formValues.income}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, income: val }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="Ex: 2850"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                  autoFocus
                />
              </View>

              {/* CHAMP 2 : COMPTE COURANT */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Solde Compte Courant (€)</Text>
                <TextInput
                  value={formValues.checkingAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, checkingAccount: val }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="Ex: 2430.50"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                />
              </View>

              {/* CHAMP 3 : ÉPARGNE */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant Épargne totale (€)</Text>
                <TextInput
                  value={formValues.savingsAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, savingsAccount: val }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="Ex: 12500"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
                style={styles.cancelActionBtn}>
                <Text style={styles.cancelActionBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveBudget}
                activeOpacity={0.85}
                style={styles.saveActionBtn}>
                <Ionicons name="checkmark" size={18} color="#ffffff" />
                <Text style={styles.saveActionBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f3ed',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e1d5',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editHeaderBtn: {
    backgroundColor: '#9b6fba',
    borderColor: '#8557a5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },

  /* CARTE DU RESTE À VIVRE (HERO) */
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e8e1d5',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217, 130, 43, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d9822b',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b46314',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  daysBadge: {
    backgroundColor: '#faf7f2',
    borderColor: '#e8e1d5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c6f85',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#d9822b',
    marginTop: 10,
    letterSpacing: -1,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fbf9f6',
    borderWidth: 1,
    borderColor: '#f0eae0',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  formulaText: {
    fontSize: 12,
    color: '#65576f',
    fontWeight: '600',
    flex: 1,
  },
  formulaHighlight: {
    fontWeight: '800',
    color: '#231c2b',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0eae0',
    paddingTop: 14,
    marginTop: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  dailyItem: {
    flex: 1,
  },
  dailyLabel: {
    fontSize: 11,
    color: '#7c6f85',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dailyAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 2,
  },
  heroDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(217, 130, 43, 0.08)',
    borderRadius: 10,
  },
  heroDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d9822b',
  },

  /* GRILLE DES 4 MONTANTS CLÉS */
  gridSection: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
    letterSpacing: 0.2,
  },
  sectionEditLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9b6fba',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 155,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e1d5',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  fixedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9b6fba',
  },
  checkingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  savingsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeIconBg: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
  },
  fixedIconBg: {
    backgroundColor: 'rgba(155, 111, 186, 0.12)',
  },
  checkingIconBg: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  savingsIconBg: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  kpiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kpiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  kpiAmount: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  kpiSubtitle: {
    fontSize: 11,
    color: '#95899e',
    fontWeight: '600',
    marginTop: 4,
  },

  /* RACCOURCIS DE GESTION RAPIDE */
  shortcutsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e1d5',
    gap: 12,
  },
  shortcutsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#231c2b',
    letterSpacing: 0.2,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e8e1d5',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  shortcutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  shortcutLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#231c2b',
    textAlign: 'center',
  },
  shortcutSub: {
    fontSize: 10,
    color: '#7c6f85',
    fontWeight: '600',
    textAlign: 'center',
  },

  /* MODAL D'AJUSTEMENT DU BUDGET */
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
    maxWidth: 480,
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
  modalHeaderIconWrap: {
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
  modalCloseBtn: {
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
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34293f',
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: '#faf7f2',
    borderColor: '#ded6c7',
    borderWidth: 1,
    color: '#231c2b',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
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
