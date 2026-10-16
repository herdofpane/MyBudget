import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
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
import { formatEuro, formatPercent } from '@/constants/formatters';
import { homeStyles as styles } from '@/styles/home.styles';

export default function HomeScreen() {
  const {
    budget,
    fixedExpensesList,
    variableCategories,
    expenseHistory,
    totalBalance,
    totalFixedExpenses,
    totalPaidFixedExpenses,
    totalSpentVariable,
    totalEstimatedVariable,
    actualRemainingAllowance,
    projectedSavings,
    fixedExpenseRatio,
    variableExpenseRatio,
    savingsCapacityRatio,
    saveBudget,
    toggleFixedExpensePaid,
    addExpenseToCategory,
  } = useBudget();

  // Mode privé (masquer les soldes)
  const [isPrivate, setIsPrivate] = useState(false);

  // Vue carte principale : 'global' (patrimoine) ou 'allowance' (reste à vivre)
  const [heroView, setHeroView] = useState<'global' | 'allowance'>('global');

  // Modal d'ajustement global
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    income: budget.income.toString(),
    checkingAccount: budget.checkingAccount.toString(),
    savingsAccount: budget.savingsAccount.toString(),
  });

  // Modal d'ajout rapide de dépense
  const [isAddExpenseVisible, setIsAddExpenseVisible] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>(
    variableCategories[0]?.id || ''
  );
  const [quickAmount, setQuickAmount] = useState('');
  const [quickLabel, setQuickLabel] = useState('');

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
      income: parseFloat(formValues.income) || 0,
      fixedExpenses: totalFixedExpenses,
      checkingAccount: parseFloat(formValues.checkingAccount) || 0,
      savingsAccount: parseFloat(formValues.savingsAccount) || 0,
    });
    setIsEditModalVisible(false);
  };

  const handleQuickAddExpense = () => {
    const parsedAmount = parseFloat(quickAmount.replace(',', '.'));
    if (!parsedAmount || parsedAmount <= 0) return;

    const targetCat = variableCategories.find((c) => c.id === selectedCatId);
    const label = quickLabel.trim() || targetCat?.label || 'Dépense';

    addExpenseToCategory(selectedCatId, parsedAmount, label);
    setQuickAmount('');
    setQuickLabel('');
    setIsAddExpenseVisible(false);
  };

  // Formattage avec prise en compte du mode privé
  const renderMoney = (amount: number, prefix: string = '') => {
    if (isPrivate) return '•••• €';
    return `${prefix}${formatEuro(amount)}`;
  };

  // Date actuelle et jours restants
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
  const dailyAllowance = Math.max(0, actualRemainingAllowance / daysRemaining);

  // Tri des charges fixes
  const sortedFixedExpenses = [...fixedExpensesList].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return (a.dueDay ?? 0) - (b.dueDay ?? 0);
  });

  // Calcul pour la barre de répartition
  const totalRatio = fixedExpenseRatio + variableExpenseRatio + savingsCapacityRatio;
  const safeFixedPercent = totalRatio > 0 ? (fixedExpenseRatio / totalRatio) * 100 : 33;
  const safeVarPercent = totalRatio > 0 ? (variableExpenseRatio / totalRatio) * 100 : 33;
  const safeSavingsPercent = totalRatio > 0 ? (savingsCapacityRatio / totalRatio) * 100 : 34;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE DE NAVIGATION AVEC PILLS */}
      <NavigationHeader
        currentRoute="index"
        title="Mon Budget"
        subtitle={`TABLEAU DE BORD • ${formattedMonth.toUpperCase()}`}
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
              style={styles.iconHeaderButton}
              accessibilityLabel="Ajuster mes paramètres financiers">
              <Ionicons name="options-outline" size={18} color="#9b6fba" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>

        {/* 1. CARTE HERO LUXE (PATRIMOINE OU DISPONIBLE CE MOIS) */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>
                {heroView === 'global' ? 'Patrimoine Net' : 'Reste à vivre'}
              </Text>
            </View>

            {/* Switch Global / Reste à vivre */}
            <View style={styles.heroTabs}>
              <TouchableOpacity
                onPress={() => setHeroView('global')}
                style={[
                  styles.heroTab,
                  heroView === 'global' && styles.heroTabActive,
                ]}>
                <Text
                  style={[
                    styles.heroTabText,
                    heroView === 'global' && styles.heroTabTextActive,
                  ]}>
                  Global
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHeroView('allowance')}
                style={[
                  styles.heroTab,
                  heroView === 'allowance' && styles.heroTabActive,
                ]}>
                <Text
                  style={[
                    styles.heroTabText,
                    heroView === 'allowance' && styles.heroTabTextActive,
                  ]}>
                  Ce mois
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroAmountRow}>
            <Text style={styles.heroMainAmount}>
              {heroView === 'global'
                ? renderMoney(totalBalance)
                : renderMoney(actualRemainingAllowance)}
            </Text>
          </View>
          <Text style={styles.heroSubLabel}>
            {heroView === 'global'
              ? 'Cumul compte courant et épargne bancaire'
              : `Budget libre après charges et dépenses réelles (${daysRemaining}j restants)`}
          </Text>

          <View style={styles.heroDivider} />

          {/* DÉCOMPOSITION : COMPTE COURANT & ÉPARGNE */}
          <View style={styles.heroAccountsRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={openEditModal}
              style={styles.heroAccountCol}>
              <View style={styles.heroAccountIconBg}>
                <Ionicons name="card-outline" size={18} color="#d8b4fe" />
              </View>
              <View>
                <Text style={styles.heroAccountLabel}>Compte courant</Text>
                <Text style={styles.heroAccountValue}>
                  {renderMoney(budget.checkingAccount)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.heroVerticalSep} />

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={openEditModal}
              style={styles.heroAccountCol}>
              <View style={[styles.heroAccountIconBg, styles.heroSavingsIconBg]}>
                <MaterialCommunityIcons
                  name="piggy-bank-outline"
                  size={19}
                  color="#34d399"
                />
              </View>
              <View>
                <Text style={styles.heroAccountLabel}>Épargne sécurisée</Text>
                <Text style={[styles.heroAccountValue, styles.heroSavingsValue]}>
                  {renderMoney(budget.savingsAccount)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* PILULE DE SANTÉ FINANCIÈRE */}
          <View style={styles.heroSavingsPill}>
            <Text style={styles.heroSavingsPillText}>
              {"Capacité d'épargne mensuelle"}
            </Text>
            <Text style={styles.heroSavingsPillValue}>
              {formatPercent(savingsCapacityRatio)} ({renderMoney(projectedSavings, '+')})
            </Text>
          </View>
        </View>

        {/* 2. DOCK D'ACTIONS RAPIDES */}
        <View style={styles.quickActionsDock}>
          {/* Action 1 : + Dépense rapide */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAddExpenseVisible(true)}
            style={styles.quickActionItem}>
            <View style={[styles.quickActionCircle, styles.quickActionPrimaryCircle]}>
              <Ionicons name="add" size={26} color="#ffffff" />
            </View>
            <Text style={styles.quickActionLabel}>+ Dépense</Text>
          </TouchableOpacity>

          {/* Action 2 : Charges Fixes */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/fixed-expenses')}
            style={styles.quickActionItem}>
            <View style={styles.quickActionCircle}>
              <Ionicons name="calendar-outline" size={22} color="#9b6fba" />
            </View>
            <Text style={styles.quickActionLabel}>Charges</Text>
          </TouchableOpacity>

          {/* Action 3 : Enveloppes Variables */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/variable-expenses')}
            style={styles.quickActionItem}>
            <View style={styles.quickActionCircle}>
              <Ionicons name="pie-chart-outline" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.quickActionLabel}>Enveloppes</Text>
          </TouchableOpacity>

          {/* Action 4 : Calcul & Détails */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/details')}
            style={styles.quickActionItem}>
            <View style={styles.quickActionCircle}>
              <Ionicons name="calculator-outline" size={22} color="#10b981" />
            </View>
            <Text style={styles.quickActionLabel}>Détails</Text>
          </TouchableOpacity>
        </View>

        {/* 3. FLUX MENSUEL : ENTRÉES & SORTIES PRÉVUES */}
        <View style={styles.cashflowRow}>
          {/* CARTE REVENUS */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openEditModal}
            style={[styles.cashflowCard, styles.incomeCardBorder]}>
            <View style={styles.cashflowTop}>
              <View style={[styles.cashflowIconWrap, styles.incomeIconWrap]}>
                <Ionicons name="arrow-up" size={16} color="#059669" />
              </View>
              <Text style={[styles.cashflowTag, styles.incomeTag]}>Entrées</Text>
            </View>
            <Text style={styles.cashflowLabel}>Revenu mensuel</Text>
            <Text style={styles.incomeValue}>
              {renderMoney(budget.income, '+')}
            </Text>
            <Text style={styles.cashflowHint}>Salaires & rentrées</Text>
          </TouchableOpacity>

          {/* CARTE SORTIES TOTALES */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/details')}
            style={[styles.cashflowCard, styles.expenseCardBorder]}>
            <View style={styles.cashflowTop}>
              <View style={[styles.cashflowIconWrap, styles.expenseIconWrap]}>
                <Ionicons name="arrow-down" size={16} color="#e11d48" />
              </View>
              <Text style={[styles.cashflowTag, styles.expenseTag]}>Sorties</Text>
            </View>
            <Text style={styles.cashflowLabel}>Charges fixes</Text>
            <Text style={styles.expenseValue}>
              {renderMoney(totalFixedExpenses, '-')}
            </Text>
            <Text style={styles.cashflowHint}>
              {renderMoney(totalPaidFixedExpenses)} réglés
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. RÉPARTITION DU BUDGET DU MOIS (JAUGE MULTI-SEGMENT) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="analytics-outline" size={18} color="#9b6fba" />
              <Text style={styles.sectionTitle}>Allocation du mois</Text>
            </View>
            <Badge variant="outline">
              <Text style={styles.sectionBadge}>
                {formatPercent(100 - fixedExpenseRatio)} disponible
              </Text>
            </Badge>
          </View>

          {/* BARRE MULTI-SEGMENTS MODERNE */}
          <View style={styles.multiBarTrack}>
            <View style={[styles.barFixed, { width: `${safeFixedPercent}%` }]} />
            <View style={[styles.barVariable, { width: `${safeVarPercent}%` }]} />
            <View style={[styles.barSavings, { width: `${safeSavingsPercent}%` }]} />
          </View>

          {/* LÉGENDE 3 COLONNES */}
          <View style={styles.matrixRow}>
            {/* Colonne 1 : Charges fixes */}
            <View style={styles.matrixCol}>
              <View style={styles.matrixDotRow}>
                <View style={[styles.matrixDot, { backgroundColor: '#9b6fba' }]} />
                <Text style={styles.matrixLabel}>Fixes</Text>
              </View>
              <Text style={styles.matrixValue}>{renderMoney(totalFixedExpenses)}</Text>
              <Text style={styles.matrixSubtext}>{formatPercent(fixedExpenseRatio)}</Text>
            </View>

            {/* Colonne 2 : Variables */}
            <View style={[styles.matrixCol, styles.matrixColCenter]}>
              <View style={styles.matrixDotRow}>
                <View style={[styles.matrixDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.matrixLabel}>Variables</Text>
              </View>
              <Text style={styles.matrixValue}>{renderMoney(totalEstimatedVariable)}</Text>
              <Text style={styles.matrixSubtext}>
                {renderMoney(totalSpentVariable)} dépensé
              </Text>
            </View>

            {/* Colonne 3 : Épargne */}
            <View style={[styles.matrixCol, styles.matrixColRight]}>
              <View style={styles.matrixDotRow}>
                <View style={[styles.matrixDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.matrixLabel}>Épargne</Text>
              </View>
              <Text style={[styles.matrixValue, { color: '#059669' }]}>
                {renderMoney(projectedSavings, '+')}
              </Text>
              <Text style={styles.matrixSubtext}>
                {formatPercent(savingsCapacityRatio)}
              </Text>
            </View>
          </View>

          {/* RYTHME CONSEILLÉ JOURNALIER */}
          <View style={styles.burnRateBanner}>
            <Text style={styles.burnRateText}>
              Rythme conseillé :{' '}
              <Text style={styles.burnRateBold}>
                ~{renderMoney(dailyAllowance)} / jour
              </Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/details')}>
              <Ionicons name="chevron-forward" size={16} color="#9b6fba" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* 5. CHARGES FIXES : ÉCHÉANCES & VALIDATION EN 1 TAP */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Prélèvements du mois</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            onPress={() => router.push('/fixed-expenses')}>
            <Text style={styles.sectionLinkText}>
              Voir tout ({fixedExpensesList.length})
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#9b6fba" />
          </TouchableOpacity>
        </View>

        <View style={styles.fixedItemsList}>
          {sortedFixedExpenses.slice(0, 4).map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.fixedItemRow,
                index === Math.min(3, sortedFixedExpenses.length - 1) &&
                  styles.noBorderBottom,
              ]}>
              <View style={styles.fixedItemLeft}>
                <View style={styles.fixedItemIcon}>
                  <Ionicons name={item.icon as any} size={18} color="#65576f" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fixedItemLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.fixedItemDue}>
                    {item.isPaid
                      ? '✓ Prélèvement validé'
                      : item.dueDay
                      ? `Échéance le ${item.dueDay} du mois`
                      : 'Charge fixe mensuelle'}
                  </Text>
                </View>
              </View>

              <View style={styles.fixedItemRight}>
                <Text
                  style={[
                    styles.fixedItemAmount,
                    item.isPaid && styles.fixedItemAmountPaid,
                  ]}>
                  {renderMoney(item.amount, '-')}
                </Text>

                {/* BOUTON CHECKMARK INTERACTIF 1-TAP */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => toggleFixedExpensePaid(item.id)}
                  style={styles.fixedCheckBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={
                      item.isPaid
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={22}
                    color={item.isPaid ? '#10b981' : '#b8adc2'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 6. SUIVI DES ENVELOPPES (TOP CATÉGORIES VARIABLES) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Enveloppes de dépenses</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            onPress={() => router.push('/variable-expenses')}>
            <Text style={styles.sectionLinkText}>Gérer</Text>
            <Ionicons name="chevron-forward" size={14} color="#9b6fba" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/variable-expenses')}
          style={styles.envelopeCard}>
          {variableCategories.slice(0, 3).map((cat, idx) => {
            const ratio = cat.estimatedBudget > 0
              ? Math.min(100, Math.round((cat.spent / cat.estimatedBudget) * 100))
              : 0;

            return (
              <View
                key={cat.id}
                style={[
                  styles.envelopeItem,
                  idx === 2 && styles.envelopeItemLast,
                ]}>
                <View style={styles.envelopeTopRow}>
                  <View style={styles.envelopeNameRow}>
                    <View
                      style={[
                        styles.envelopeIconBg,
                        { backgroundColor: `${cat.color}20` },
                      ]}>
                      <Ionicons
                        name={cat.icon as any}
                        size={15}
                        color={cat.color}
                      />
                    </View>
                    <Text style={styles.envelopeName}>{cat.label}</Text>
                  </View>
                  <Text style={styles.envelopeAmounts}>
                    {renderMoney(cat.spent)} / {renderMoney(cat.estimatedBudget)}
                  </Text>
                </View>

                <View style={styles.envelopeTrack}>
                  <View
                    style={[
                      styles.envelopeFill,
                      {
                        width: `${ratio}%`,
                        backgroundColor: cat.color || '#9b6fba',
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* 7. DERNIÈRES DÉPENSES DU MOIS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Dernières dépenses</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            onPress={() => setIsAddExpenseVisible(true)}>
            <Text style={styles.sectionLinkText}>+ Ajouter</Text>
            <Ionicons name="add-circle-outline" size={15} color="#9b6fba" />
          </TouchableOpacity>
        </View>

        <View style={styles.recentTxContainer}>
          {expenseHistory && expenseHistory.length > 0 ? (
            expenseHistory.slice(0, 3).map((tx, index) => {
              const cat = variableCategories.find((c) => c.id === tx.categoryId);
              return (
                <View
                  key={tx.id || index}
                  style={[
                    styles.recentTxItem,
                    index === Math.min(2, expenseHistory.length - 1) &&
                      styles.noBorderBottom,
                  ]}>
                  <View style={styles.recentTxLeft}>
                    <View
                      style={[
                        styles.recentTxIcon,
                        cat && { backgroundColor: `${cat.color}15` },
                      ]}>
                      <Ionicons
                        name={(cat?.icon || 'receipt-outline') as any}
                        size={16}
                        color={cat?.color || '#9b6fba'}
                      />
                    </View>
                    <View>
                      <Text style={styles.recentTxLabel}>{tx.label}</Text>
                      <Text style={styles.recentTxDate}>
                        {cat?.label || 'Dépense'} • {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recentTxAmount}>
                    {renderMoney(tx.amount, '-')}
                  </Text>
                </View>
              );
            })
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAddExpenseVisible(true)}
              style={styles.emptyTxBox}>
              <Ionicons name="sparkles-outline" size={24} color="#9b6fba" />
              <Text style={styles.emptyTxText}>
                Aucune dépense récente enregistrée
              </Text>
              <Text style={[styles.sectionLinkText, { marginTop: 2 }]}>
                Toucher ici pour enregistrer un achat rapide →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* MODAL 1 : AJOUT RAPIDE D'UNE DÉPENSE */}
      <Modal
        visible={isAddExpenseVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddExpenseVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsAddExpenseVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une dépense</Text>
              <TouchableOpacity
                onPress={() => setIsAddExpenseVisible(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#65576f" />
              </TouchableOpacity>
            </View>

            {/* CHOIX DE LA CATÉGORIE / ENVELOPPE */}
            <Text style={styles.inputLabel}>{"Choisir l'enveloppe"}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipScroll}>
              {variableCategories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCatId(cat.id)}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}>
                    <Ionicons
                      name={cat.icon as any}
                      size={15}
                      color={isSelected ? '#ffffff' : cat.color}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* CHAMP MONTANT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Montant (€)</Text>
              <TextInput
                value={quickAmount}
                onChangeText={setQuickAmount}
                keyboardType="decimal-pad"
                placeholder="Ex: 42.50"
                placeholderTextColor="#95899e"
                style={styles.textInput}
                autoFocus
              />
            </View>

            {/* CHAMP INTITULÉ */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description / Lieu (optionnel)</Text>
              <TextInput
                value={quickLabel}
                onChangeText={setQuickLabel}
                placeholder="Ex: Courses Carrefour, Restaurant..."
                placeholderTextColor="#95899e"
                style={styles.textInput}
              />
            </View>

            {/* ACTIONS */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setIsAddExpenseVisible(false)}
                style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleQuickAddExpense}
                style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Valider la dépense</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2 : AJUSTER REVENUS & COMPTES */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsEditModalVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajuster mes finances</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#65576f" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* REVENU NET */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Revenu mensuel net (€)</Text>
                <TextInput
                  value={formValues.income}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, income: val }))
                  }
                  keyboardType="numeric"
                  placeholder="Ex: 2850"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                />
              </View>

              {/* COMPTE COURANT */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Solde Compte Courant (€)</Text>
                <TextInput
                  value={formValues.checkingAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, checkingAccount: val }))
                  }
                  keyboardType="numeric"
                  placeholder="Ex: 2430.50"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                />
              </View>

              {/* ÉPARGNE */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant Épargne (€)</Text>
                <TextInput
                  value={formValues.savingsAccount}
                  onChangeText={(val) =>
                    setFormValues((prev) => ({ ...prev, savingsAccount: val }))
                  }
                  keyboardType="numeric"
                  placeholder="Ex: 12500"
                  placeholderTextColor="#95899e"
                  style={styles.textInput}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveBudget}
                style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
