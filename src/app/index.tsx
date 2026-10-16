import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useBudget, BudgetData } from '@/hooks/use-budget';
import { formatEuro, formatPercent } from '@/constants/formatters';
import { homeStyles as styles } from '@/styles/home.styles';

export default function HomeScreen() {
  const {
    budget,
    fixedExpensesList,
    totalBalance,
    remainingAllowance,
    fixedExpenseRatio,
    saveBudget,
  } = useBudget();

  // État du modal d'édition
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof BudgetData | null>(null);
  const [formValues, setFormValues] = useState({
    income: budget.income.toString(),
    fixedExpenses: budget.fixedExpenses.toString(),
    checkingAccount: budget.checkingAccount.toString(),
    savingsAccount: budget.savingsAccount.toString(),
  });

  const openEditModal = (targetField?: keyof BudgetData) => {
    setFormValues({
      income: budget.income.toString(),
      fixedExpenses: budget.fixedExpenses.toString(),
      checkingAccount: budget.checkingAccount.toString(),
      savingsAccount: budget.savingsAccount.toString(),
    });
    setEditingField(targetField || null);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    saveBudget({
      income: parseFloat(formValues.income) || 0,
      fixedExpenses: parseFloat(formValues.fixedExpenses) || 0,
      checkingAccount: parseFloat(formValues.checkingAccount) || 0,
      savingsAccount: parseFloat(formValues.savingsAccount) || 0,
    });
    setIsModalVisible(false);
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonth = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* HEADER PRINCIPAL */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>TABLEAU DE BORD • {formattedMonth}</Text>
          <Text style={styles.headerTitle}>Mon Budget</Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          onPress={() => openEditModal()}
          style={styles.editHeaderButton}>
          <Ionicons name="options-outline" size={18} color="#38bdf8" />
          <Text style={styles.editHeaderText}>Ajuster</Text>
        </Button>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* 1. CARTE RÉSUMÉ : SOLDE TOTAL & PATRIMOINE */}
        <Card style={styles.patrimonyCard}>
          <View style={styles.patrimonyHeader}>
            <Badge variant="outline" style={styles.badgeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.badgeText}>Patrimoine disponible</Text>
            </Badge>
            <TouchableOpacity
              onPress={() => openEditModal()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil-sharp" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.patrimonyAmount}>{formatEuro(totalBalance)}</Text>

          <View style={styles.patrimonyDivider} />

          {/* DÉCOMPOSITION : COMPTE COURANT & ÉPARGNE */}
          <View style={styles.accountsRow}>
            {/* COMPTE COURANT */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEditModal('checkingAccount')}
              style={[styles.accountItem, styles.accountItemLeft]}>
              <View style={styles.accountIconWrapper}>
                <Ionicons name="card-outline" size={18} color="#38bdf8" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Compte courant</Text>
                <Text style={styles.accountAmount}>{formatEuro(budget.checkingAccount)}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.verticalSeparator} />

            {/* ÉPARGNE */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEditModal('savingsAccount')}
              style={[styles.accountItem, styles.accountItemRight]}>
              <View style={[styles.accountIconWrapper, styles.savingsIconWrapper]}>
                <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Montant épargne</Text>
                <Text style={[styles.accountAmount, styles.savingsAmountText]}>
                  {formatEuro(budget.savingsAccount)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 2. SECTION FLUX MENSUEL : REVENU & CHARGE FIXE */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Flux mensuel</Text>
          <Text style={styles.sectionHint}>Revenus vs Charges fixes</Text>
        </View>

        <View style={styles.cashflowRow}>
          {/* CARTE REVENU */}
          <Card style={[styles.cashflowCard, styles.incomeCard]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEditModal('income')}>
              <View style={styles.cashflowCardTop}>
                <View style={[styles.cashflowIconWrapper, styles.incomeIconBg]}>
                  <Ionicons name="arrow-up-circle" size={20} color="#10b981" />
                </View>
                <Text style={styles.cashflowTagIncome}>Entrées</Text>
              </View>
              <Text style={styles.cashflowLabel}>Revenu mensuel</Text>
              <Text style={styles.incomeAmount}>+{formatEuro(budget.income)}</Text>
              <Text style={styles.cashflowSubtext}>Salaire & rentrées régulières</Text>
            </TouchableOpacity>
          </Card>

          {/* CARTE CHARGE FIXE */}
          <Card style={[styles.cashflowCard, styles.expenseCard]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEditModal('fixedExpenses')}>
              <View style={styles.cashflowCardTop}>
                <View style={[styles.cashflowIconWrapper, styles.expenseIconBg]}>
                  <Ionicons name="arrow-down-circle" size={20} color="#f43f5e" />
                </View>
                <Text style={styles.cashflowTagExpense}>Sorties fixes</Text>
              </View>
              <Text style={styles.cashflowLabel}>Charges fixes</Text>
              <Text style={styles.expenseAmount}>-{formatEuro(budget.fixedExpenses)}</Text>
              <Text style={styles.cashflowSubtext}>Loyer, factures & crédits</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 3. CAPACITÉ DE RESTE À VIVRE (REVENU - CHARGES FIXES) */}
        <Card style={styles.allowanceCard}>
          <View style={styles.allowanceHeader}>
            <View style={styles.allowanceTitleRow}>
              <Ionicons name="wallet-outline" size={20} color="#a78bfa" />
              <Text style={styles.allowanceTitle}>Reste à vivre & épargne possible</Text>
            </View>
            <Badge variant="secondary">
              <Text style={styles.allowanceRatio}>
                {formatPercent(100 - fixedExpenseRatio)} libre
              </Text>
            </Badge>
          </View>

          <View style={styles.allowanceBody}>
            <Text style={styles.allowanceAmount}>{formatEuro(remainingAllowance)}</Text>
            <Text style={styles.allowanceDescription}>
              Disponible après déduction de vos charges fixes mensuelles.
            </Text>
          </View>

          {/* Jauge visuelle */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeBackground}>
              <View
                style={[
                  styles.gaugeFilled,
                  { width: `${Math.min(100, Math.max(0, fixedExpenseRatio))}%` },
                ]}
              />
            </View>
            <View style={styles.gaugeLegendRow}>
              <Text style={styles.gaugeLegendText}>
                Charges fixes ({formatPercent(fixedExpenseRatio)})
              </Text>
              <Text style={styles.gaugeLegendText}>
                Disponible ({formatPercent(100 - fixedExpenseRatio)})
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. DÉTAIL DES CHARGES FIXES COURANTES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Détail des charges fixes</Text>
          <Badge variant="secondary">
            <Text style={styles.sectionBadge}>{fixedExpensesList.length} postes</Text>
          </Badge>
        </View>

        <Card style={styles.expenseListContainer}>
          {fixedExpensesList.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.expenseListItem,
                index === fixedExpensesList.length - 1 && styles.noBorderBottom,
              ]}>
              <View style={styles.expenseListLeft}>
                <View style={styles.expenseItemIconBg}>
                  <Ionicons name={item.icon as any} size={18} color="#94a3b8" />
                </View>
                <View>
                  <Text style={styles.expenseItemLabel}>{item.label}</Text>
                  <Text style={styles.expenseItemCategory}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.expenseItemAmount}>-{formatEuro(item.amount)}</Text>
            </View>
          ))}
        </Card>

        {/* BOUTON D'ACTION PRINCIPAL */}
        <Button
          size="lg"
          onPress={() => openEditModal()}
          style={styles.primaryActionButton}>
          <Ionicons name="create-outline" size={20} color="#ffffff" />
          <Text style={styles.primaryActionButtonText}>Mettre à jour mes montants</Text>
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE MODIFICATION DES MONTANTS */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Modifier mes données</Text>
                <Text style={styles.modalSubtitle}>
                  Ajustez vos montants pour mettre à jour vos prévisions
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* CHAMP 1 : REVENU */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="arrow-up-circle-outline" size={16} color="#10b981" />
                  <Text style={styles.inputLabel}>Revenu mensuel (€)</Text>
                </View>
                <Input
                  style={[
                    styles.textInput,
                    editingField === 'income' && styles.textInputFocused,
                  ]}
                  value={formValues.income}
                  onChangeText={(val) => setFormValues((prev) => ({ ...prev, income: val }))}
                  keyboardType="numeric"
                  placeholder="ex: 2800"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* CHAMP 2 : CHARGE FIXE */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="arrow-down-circle-outline" size={16} color="#f43f5e" />
                  <Text style={styles.inputLabel}>Charges fixes (€)</Text>
                </View>
                <Input
                  style={[
                    styles.textInput,
                    editingField === 'fixedExpenses' && styles.textInputFocused,
                  ]}
                  value={formValues.fixedExpenses}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, fixedExpenses: val }))
                  }
                  keyboardType="numeric"
                  placeholder="ex: 1100"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* CHAMP 3 : COMPTE COURANT */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="card-outline" size={16} color="#38bdf8" />
                  <Text style={styles.inputLabel}>Montant compte courant (€)</Text>
                </View>
                <Input
                  style={[
                    styles.textInput,
                    editingField === 'checkingAccount' && styles.textInputFocused,
                  ]}
                  value={formValues.checkingAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, checkingAccount: val }))
                  }
                  keyboardType="numeric"
                  placeholder="ex: 2400"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* CHAMP 4 : ÉPARGNE */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <MaterialCommunityIcons name="piggy-bank-outline" size={16} color="#34d399" />
                  <Text style={styles.inputLabel}>Montant épargne (€)</Text>
                </View>
                <Input
                  style={[
                    styles.textInput,
                    editingField === 'savingsAccount' && styles.textInputFocused,
                  ]}
                  value={formValues.savingsAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, savingsAccount: val }))
                  }
                  keyboardType="numeric"
                  placeholder="ex: 12000"
                  placeholderTextColor="#64748b"
                />
              </View>
            </ScrollView>

            {/* BOUTONS DU MODAL */}
            <View style={styles.modalFooter}>
              <Button
                variant="outline"
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Button>

              <Button
                onPress={handleSave}
                style={styles.modalSubmitButton}>
                <Text style={styles.modalSubmitText}>Enregistrer</Text>
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
