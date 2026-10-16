import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { AppDialog } from '@/components/confirm-dialog';
import { HomeSkeleton } from '@/components/ui/loading-state';
import { useHomeSummary } from '@/hooks/use-home-summary';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const {
    budget,
    isLoading,
    isPrivate,
    incomeInput,
    resteAVivre,
    epargneAmount,
    checkingAmount,
    totalFixedExpenses,
    infoDialog,
    setInfoDialog,
    setLocalIncome,
    handleBlurIncome,
    togglePrivate,
    renderMoney,
    renderMoneyRound,
  } = useHomeSummary();

  // Date actuelle
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL ÉPURÉ — KLYRO */}
      <NavigationHeader
        title="Klyro"
        subtitle={`VUE D'ENSEMBLE • ${formattedMonth.toUpperCase()}`}
        actionButton={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={togglePrivate}
            style={styles.iconHeaderButton}
            accessibilityLabel="Masquer ou afficher les montants">
            <Ionicons
              name={isPrivate ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>

          {/* 1. CARTE HERO : RESTE À VIVRE */}
          <Card style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>Reste à Vivre</Text>
              </View>
              <Text style={styles.heroFormulaHint}>Revenu - Charges Fixes</Text>
            </View>

            <View style={styles.heroAmountRow}>
              <Text style={styles.heroAmount}>
                {renderMoney(resteAVivre)}
              </Text>
              <View style={styles.heroRoundBadge}>
                <Text style={styles.heroRoundBadgeText}>
                  ≈ {renderMoneyRound(resteAVivre)}
                </Text>
              </View>
            </View>

            {/* Formule explicative cliquable */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setInfoDialog({
                  visible: true,
                  title: 'Formule du Reste à Vivre',
                  message:
                    'Le Reste à Vivre représente la somme dont vous disposez réellement après avoir honoré toutes vos charges incompressibles du mois.',
                  subtext:
                    'Calcul : Revenu mensuel net (' +
                    renderMoney(budget.income) +
                    ') − Total des charges fixes (' +
                    renderMoney(totalFixedExpenses) +
                    ') = ' +
                    renderMoney(resteAVivre) +
                    '.',
                })
              }
              style={styles.formulaRow}>
              <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
              <Text style={styles.formulaText}>
                Disponible pour épargner & vivre après charges
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* 2. REVENU MENSUEL (MODIFIABLE DIRECTEMENT) */}
          <Card style={styles.inputCard}>
            <View style={styles.inputCardHeader}>
              <View style={[styles.iconWrap, styles.iconGreen]}>
                <Ionicons name="wallet-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputCardLabel}>Revenu Mensuel</Text>
                <Text style={styles.inputCardSub}>
                  Base salaires, primes ou aides nettes
                </Text>
              </View>
              <Text style={styles.directInputBadge}>MODIFIABLE</Text>
            </View>

            <View style={styles.directInputRow}>
              <TextInput
                value={incomeInput}
                onChangeText={setLocalIncome}
                onBlur={handleBlurIncome}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.directTextInput}
              />
              <Text style={styles.euroUnitText}>€ / mois</Text>
            </View>
          </Card>

          {/* 3. CHARGES FIXES MENSUELLES (LIEN VERS PAGE DÉDIÉE) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/fixed-expenses')}>
            <Card style={styles.fixedExpenseCard}>
              <View style={styles.fixedCardLeft}>
                <View style={[styles.iconWrap, styles.iconPurple]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.lavender} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fixedLabel}>Charges Fixes</Text>
                  <Text style={styles.fixedSub}>
                    Loyer, abonnements, assurances, crédits...
                  </Text>
                </View>
              </View>
              <View style={styles.fixedCardRight}>
                <Text style={styles.fixedAmount}>
                  - {renderMoney(totalFixedExpenses)}
                </Text>
                <View style={styles.fixedLinkRow}>
                  <Text style={styles.fixedLinkText}>Gérer le détail</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.lavender} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* 4. COMPTE COURANT & ÉPARGNE */}
          <View style={styles.accountsRow}>
            {/* COMPTE COURANT (NÉCESSAIRE + FACULTATIF) */}
            <Card style={[styles.accountCard, styles.checkingCard]}>
              <View style={styles.accountHeader}>
                <Ionicons name="card-outline" size={18} color={colors.accent} />
                <Text style={styles.accountLabel}>Compte Courant</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setInfoDialog({
                      visible: true,
                      title: 'Montant pour Compte Courant',
                      message:
                        'Ce montant couvre vos dépenses de vie quotidienne (alimentation, transport, sorties et facultatif).',
                      subtext:
                        'Formule tableur : Reste à vivre (' +
                        renderMoney(resteAVivre) +
                        ') − Montant pour Épargne (' +
                        renderMoney(epargneAmount) +
                        ') = ' +
                        renderMoney(checkingAmount) +
                        '.',
                    })
                  }>
                  <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.accountDisplayRow}>
                <Text style={styles.accountDisplayAmount}>
                  {renderMoney(checkingAmount)}
                </Text>
                <View style={styles.inlineRoundBadge}>
                  <Text style={styles.inlineRoundBadgeText}>
                    ≈ {renderMoneyRound(checkingAmount)}
                  </Text>
                </View>
              </View>

              <Text style={styles.accountFormulaTitle}>Dépenses courantes</Text>
              <Text style={styles.accountFormulaDetail}>
                Reste à vivre − Épargne
              </Text>
            </Card>

            {/* COMPTE ÉPARGNE (FORMULE RACINE CARRÉE) */}
            <Card style={[styles.accountCard, styles.savingsCard]}>
              <View style={styles.accountHeader}>
                <Ionicons name="trending-up" size={18} color={colors.lavender} />
                <Text style={styles.accountLabel}>Pour Épargne</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setInfoDialog({
                      visible: true,
                      title: 'Formule d’Épargne Klyro',
                      message:
                        'L’épargne est calculée selon la formule mathématique optimale du tableur :',
                      subtext:
                        'Épargne = Reste à Vivre − √(Reste à Vivre × Total Nécessaire). Avec un seuil nécessaire fixé à ' +
                        renderMoney(budget.targetNecessary || 123) +
                        ', le montant calculé est de ' +
                        renderMoney(epargneAmount) +
                        '.',
                    })
                  }>
                  <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.accountDisplayRow}>
                <Text style={styles.accountDisplayAmount}>
                  {renderMoney(epargneAmount)}
                </Text>
                <View style={styles.inlineRoundBadge}>
                  <Text style={styles.inlineRoundBadgeText}>
                    ≈ {renderMoneyRound(epargneAmount)}
                  </Text>
                </View>
              </View>

              <Text style={styles.accountFormulaTitle}>Épargne optimisée</Text>
              <Text style={styles.accountFormulaDetail}>
                B4 − √(B4 × Nécessaire)
              </Text>
            </Card>
          </View>

          {/* 5. LIENS DE GESTION DIRECTS */}
          <View style={styles.navLinksCard}>
            <TouchableOpacity
              onPress={() => router.push('/variable-expenses')}
              activeOpacity={0.8}
              style={styles.navLinkItem}>
              <View style={[styles.navLinkIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="pie-chart-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navLinkTitle}>Charges Variables & Lissage</Text>
                <Text style={styles.navLinkSub}>
                  Courses, shopping, santé et impact mensuel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.navLinkDivider} />

            <TouchableOpacity
              onPress={() => router.push('/details')}
              activeOpacity={0.8}
              style={styles.navLinkItem}>
              <View style={[styles.navLinkIcon, { backgroundColor: '#EEF2FF' }]}>
                <MaterialCommunityIcons name="calculator-variant-outline" size={20} color={colors.lavender} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navLinkTitle}>Simulation & Calculs Avancés</Text>
                <Text style={styles.navLinkSub}>
                  Ventilation 49/37/14 et revenus ponctuels
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* POP-UP PÉDAGOGIQUE UNIVERSELLE */}
      {infoDialog && (
        <AppDialog
          visible={infoDialog.visible}
          type="info"
          title={infoDialog.title}
          message={infoDialog.message}
          subtext={infoDialog.subtext}
          confirmLabel="J'ai compris"
          onConfirm={() => setInfoDialog(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  iconHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* 1. CARTE HERO : RESTE À VIVRE */
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
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
    backgroundColor: '#ECFDF5',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroFormulaHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  heroRoundBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroRoundBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentDark,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  formulaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },

  /* 2. REVENUE (INPUT DIRECT) */
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    borderLeftColor: colors.accent,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  inputCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGreen: {
    backgroundColor: '#ECFDF5',
  },
  iconPurple: {
    backgroundColor: '#EEF2FF',
  },
  inputCardLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  inputCardSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  directInputBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentDark,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    letterSpacing: 0.3,
  },
  directInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 8,
  },
  directTextInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: colors.accentDark,
    height: '100%',
  },
  euroUnitText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMuted,
  },

  /* 3. CHARGE FIXE */
  fixedExpenseCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    borderLeftColor: colors.lavender,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  fixedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fixedLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  fixedSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  fixedCardRight: {
    alignItems: 'flex-end',
  },
  fixedAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.danger,
  },
  fixedLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  fixedLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.lavender,
  },

  /* 4. COMPTE COURANT & ÉPARGNE */
  accountsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  accountCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  checkingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  savingsCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.lavender,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  accountDisplayRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  accountDisplayAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  inlineRoundBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineRoundBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  accountFormulaTitle: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
  accountFormulaDetail: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  /* 5. NAVIGATION DIRECTE */
  navLinksCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  navLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  navLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLinkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  navLinkSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  navLinkDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
});
