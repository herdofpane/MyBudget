import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';

import { useBudget } from '@/hooks/use-budget';
import { formatEuro, formatPercent } from '@/constants/formatters';

export default function DetailsScreen() {
  const {
    budget,
    fixedExpensesList,
    variableCategories,
    totalBalance,
    totalFixedExpenses,
    totalEstimatedVariable,
    totalSpentVariable,
    remainingAllowance,
    projectedSavings,
    actualRemainingAllowance,
    fixedExpenseRatio,
    variableExpenseRatio,
    savingsCapacityRatio,
  } = useBudget();

  // Simulateur d'épargne
  const [savingsSimInput, setSavingsSimInput] = useState(
    Math.max(0, Math.round(projectedSavings)).toString()
  );
  const [interestRate, setInterestRate] = useState('3.0'); // 3% Livret A

  const monthlySim = Math.max(0, parseFloat(savingsSimInput) || 0);
  const rate = Math.max(0, parseFloat(interestRate) || 0) / 100;

  // Calculs de projection avec intérêts composés annuels
  const calcProjection = (months: number) => {
    let total = 0;
    const monthlyRate = rate / 12;
    for (let i = 0; i < months; i++) {
      total = (total + monthlySim) * (1 + monthlyRate);
    }
    return total;
  };

  const proj6m = calcProjection(6);
  const proj1y = calcProjection(12);
  const proj3y = calcProjection(36);
  const proj5y = calcProjection(60);

  // Diagnostic 50/30/20
  const isFixedOk = fixedExpenseRatio <= 50;
  const isVariableOk = variableExpenseRatio <= 30;
  const isSavingsOk = savingsCapacityRatio >= 20;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE DE NAVIGATION AVEC PILLS */}
      <NavigationHeader
        currentRoute="details"
        title="Calcul & Détail"
        subtitle="ANALYSE & BILAN"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>
        {/* 1. GRAND BILAN DE CALCUL FORMULE SYNTHÉTIQUE */}
        <Card style={styles.calcCard}>
          <Text style={styles.calcCardTitle}>Formule du bilan mensuel prévisionnel</Text>

          <View style={styles.formulaRows}>
            {/* 1. REVENU */}
            <View style={styles.formulaItem}>
              <View style={styles.formulaItemLeft}>
                <View style={[styles.circleBadge, { backgroundColor: 'rgba(27, 153, 99, 0.12)' }]}>
                  <Text style={[styles.circleBadgeText, { color: '#1b9963' }]}>+</Text>
                </View>
                <View>
                  <Text style={styles.formulaLabel}>Revenu mensuel net</Text>
                  <Text style={styles.formulaSub}>Total des entrées</Text>
                </View>
              </View>
              <Text style={styles.formulaPositive}>+{formatEuro(budget.income)}</Text>
            </View>

            {/* 2. CHARGES FIXES */}
            <View style={styles.formulaItem}>
              <View style={styles.formulaItemLeft}>
                <View style={[styles.circleBadge, { backgroundColor: 'rgba(212, 63, 94, 0.12)' }]}>
                  <Text style={[styles.circleBadgeText, { color: '#d43f5e' }]}>-</Text>
                </View>
                <View>
                  <Text style={styles.formulaLabel}>Charges fixes réelles</Text>
                  <Text style={styles.formulaSub}>{fixedExpensesList.length} postes obligatoires</Text>
                </View>
              </View>
              <Text style={styles.formulaNegative}>-{formatEuro(totalFixedExpenses)}</Text>
            </View>

            {/* SÉPARATEUR INTERMÉDIAIRE : RESTE À VIVRE */}
            <View style={styles.subtotalBanner}>
              <Text style={styles.subtotalLabel}>= Reste à vivre après charges fixes</Text>
              <Text style={styles.subtotalValue}>{formatEuro(remainingAllowance)}</Text>
            </View>

            {/* 3. VARIABLES ESTIMÉES */}
            <View style={styles.formulaItem}>
              <View style={styles.formulaItemLeft}>
                <View style={[styles.circleBadge, { backgroundColor: 'rgba(217, 130, 43, 0.12)' }]}>
                  <Text style={[styles.circleBadgeText, { color: '#d9822b' }]}>-</Text>
                </View>
                <View>
                  <Text style={styles.formulaLabel}>Charges variables estimées</Text>
                  <Text style={styles.formulaSub}>{variableCategories.length} charges variables prévues</Text>
                </View>
              </View>
              <Text style={styles.formulaNegative}>-{formatEuro(totalEstimatedVariable)}</Text>
            </View>

            <View style={styles.divider} />

            {/* 4. RÉSULTAT FINAL : CAPACITÉ D'ÉPARGNE NETTE */}
            <View style={styles.finalResultRow}>
              <View>
                <Text style={styles.finalResultLabel}>{"Capacité d'épargne nette projetée"}</Text>
                <Text style={styles.finalResultSub}>
                  {formatPercent(savingsCapacityRatio)} de vos revenus disponibles pour épargner
                </Text>
              </View>
              <Text
                style={[
                  styles.finalResultAmount,
                  { color: projectedSavings >= 0 ? '#1b9963' : '#d43f5e' },
                ]}>
                {projectedSavings >= 0 ? '+' : ''}
                {formatEuro(projectedSavings)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. RESTE EN TEMPS RÉEL (ACTUEL SELON DÉPENSES EFFECTIVES) */}
        <Card style={styles.realtimeCard}>
          <View style={styles.realtimeHeader}>
            <Ionicons name="flash-outline" size={20} color="#9b6fba" />
            <Text style={styles.realtimeTitle}>Situation réelle à ce jour</Text>
          </View>
          <View style={styles.realtimeRow}>
            <View>
              <Text style={styles.realtimeLabel}>Dépensé à ce jour (variables)</Text>
              <Text style={styles.realtimeValueRed}>-{formatEuro(totalSpentVariable)}</Text>
            </View>
            <View style={styles.verticalSep} />
            <View style={styles.alignRight}>
              <Text style={styles.realtimeLabel}>Reste disponible réel</Text>
              <Text style={styles.realtimeValueGreen}>
                {formatEuro(actualRemainingAllowance)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. AUDIT BUDGÉTAIRE RÈGLE DES 50 / 30 / 20 */}
        <Card style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <MaterialCommunityIcons name="scale-balance" size={22} color="#9b6fba" />
            <Text style={styles.ruleTitle}>Analyse Règle 50 / 30 / 20</Text>
          </View>
          <Text style={styles.ruleDescription}>
            Standard de gestion financière : 50% besoins essentiels, 30% envies et confort, 20% épargne & projets.
          </Text>

          {/* BARRE TRICOLORE VISUELLE */}
          <View style={styles.triBarContainer}>
            <View
              style={[
                styles.triBarSegment,
                { width: `${Math.min(100, fixedExpenseRatio)}%`, backgroundColor: '#9b6fba' },
              ]}
            />
            <View
              style={[
                styles.triBarSegment,
                { width: `${Math.min(100, variableExpenseRatio)}%`, backgroundColor: '#d9822b' },
              ]}
            />
            <View
              style={[
                styles.triBarSegment,
                {
                  width: `${Math.min(100, Math.max(0, 100 - fixedExpenseRatio - variableExpenseRatio))}%`,
                  backgroundColor: '#1b9963',
                },
              ]}
            />
          </View>

          {/* 3 LIGNES D'AUDIT */}
          <View style={styles.ruleItemsList}>
            {/* 50% BESOINS */}
            <View style={styles.ruleItem}>
              <View style={styles.ruleItemTop}>
                <View style={styles.ruleDotRow}>
                  <View style={[styles.ruleDot, { backgroundColor: '#9b6fba' }]} />
                  <Text style={styles.ruleItemName}>Besoins fixes (Max 50%)</Text>
                </View>
                <Badge variant={isFixedOk ? 'default' : 'destructive'} style={styles.ruleBadge}>
                  <Text style={styles.ruleBadgeText}>
                    {isFixedOk ? '✓ Optimal' : '⚠️ Attention'}
                  </Text>
                </Badge>
              </View>
              <Text style={styles.ruleItemScore}>
                Actuel : {formatPercent(fixedExpenseRatio)} ({formatEuro(totalFixedExpenses)}) • Cible max : 50% ({formatEuro(budget.income * 0.5)})
              </Text>
            </View>

            {/* 30% ENVIES */}
            <View style={styles.ruleItem}>
              <View style={styles.ruleItemTop}>
                <View style={styles.ruleDotRow}>
                  <View style={[styles.ruleDot, { backgroundColor: '#d9822b' }]} />
                  <Text style={styles.ruleItemName}>Charges variables (Max 30%)</Text>
                </View>
                <Badge variant={isVariableOk ? 'default' : 'secondary'} style={styles.ruleBadge}>
                  <Text style={styles.ruleBadgeText}>
                    {isVariableOk ? '✓ Optimal' : 'Modéré'}
                  </Text>
                </Badge>
              </View>
              <Text style={styles.ruleItemScore}>
                Actuel : {formatPercent(variableExpenseRatio)} ({formatEuro(totalEstimatedVariable)}) • Cible max : 30% ({formatEuro(budget.income * 0.3)})
              </Text>
            </View>

            {/* 20% ÉPARGNE */}
            <View style={styles.ruleItem}>
              <View style={styles.ruleItemTop}>
                <View style={styles.ruleDotRow}>
                  <View style={[styles.ruleDot, { backgroundColor: '#1b9963' }]} />
                  <Text style={styles.ruleItemName}>Épargne & Projets (Min 20%)</Text>
                </View>
                <Badge variant={isSavingsOk ? 'default' : 'secondary'} style={styles.ruleBadge}>
                  <Text style={styles.ruleBadgeText}>
                    {isSavingsOk ? '✓ Bravo' : 'À améliorer'}
                  </Text>
                </Badge>
              </View>
              <Text style={styles.ruleItemScore}>
                Actuel : {formatPercent(savingsCapacityRatio)} ({formatEuro(projectedSavings)}) • Cible min : 20% ({formatEuro(budget.income * 0.2)})
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. SIMULATEUR D'ÉPARGNE ET DE PATRIMOINE */}
        <Card style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <Ionicons name="trending-up" size={22} color="#1b9963" />
            <Text style={styles.simulatorTitle}>{"Simulateur de projection d'épargne"}</Text>
          </View>
          <Text style={styles.simulatorDesc}>
            Estimez la constitution de votre patrimoine avec un versement mensuel régulier.
          </Text>

          {/* INPUTS DE SIMULATION */}
          <View style={styles.simInputsRow}>
            <View style={styles.simInputGroup}>
              <Text style={styles.simInputLabel}>Épargne par mois (€)</Text>
              <Input
                value={savingsSimInput}
                onChangeText={setSavingsSimInput}
                keyboardType="numeric"
                style={styles.simInput}
              />
            </View>
            <View style={styles.simInputGroup}>
              <Text style={styles.simInputLabel}>Rendement annuel (%)</Text>
              <Input
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                style={styles.simInput}
              />
            </View>
          </View>

          {/* GRILLE DE PROJECTION */}
          <View style={styles.projectionGrid}>
            <View style={styles.projCard}>
              <Text style={styles.projPeriod}>6 mois</Text>
              <Text style={styles.projAmount}>{formatEuro(proj6m)}</Text>
            </View>
            <View style={styles.projCard}>
              <Text style={styles.projPeriod}>1 an</Text>
              <Text style={styles.projAmount}>{formatEuro(proj1y)}</Text>
            </View>
            <View style={styles.projCard}>
              <Text style={styles.projPeriod}>3 ans</Text>
              <Text style={styles.projAmount}>{formatEuro(proj3y)}</Text>
            </View>
            <View style={styles.projCard}>
              <Text style={styles.projPeriod}>5 ans</Text>
              <Text style={styles.projAmountHigh}>{formatEuro(proj5y)}</Text>
            </View>
          </View>

          <Text style={styles.simNote}>
            Patrimoine total actuel (Comptes + Épargne) : {formatEuro(totalBalance)}.
          </Text>
        </Card>

        {/* 5. TABLEAU RÉCAPITULATIF LIGNE PAR LIGNE */}
        <View style={styles.tableSection}>
          <Text style={styles.tableSectionTitle}>Tableau récapitulatif des flux</Text>
          <Card style={styles.tableCard}>
            {/* Ligne Revenu */}
            <View style={styles.tableRow}>
              <View>
                <Text style={styles.tableItemName}>Revenu mensuel</Text>
                <Text style={styles.tableItemType}>Entrée régulière</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.tableItemAmountGreen}>+{formatEuro(budget.income)}</Text>
                <Text style={styles.tableItemPct}>100.0%</Text>
              </View>
            </View>

            {/* Ligne Charges fixes */}
            <View style={styles.tableRow}>
              <View>
                <Text style={styles.tableItemName}>Charges fixes ({fixedExpensesList.length} postes)</Text>
                <Text style={styles.tableItemType}>Sorties contraintes</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.tableItemAmountRed}>-{formatEuro(totalFixedExpenses)}</Text>
                <Text style={styles.tableItemPct}>{formatPercent(fixedExpenseRatio)}</Text>
              </View>
            </View>

            {/* Ligne Charges variables */}
            <View style={styles.tableRow}>
              <View>
                <Text style={styles.tableItemName}>Charges variables ({variableCategories.length} postes)</Text>
                <Text style={styles.tableItemType}>Budget estimé</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.tableItemAmountOrange}>-{formatEuro(totalEstimatedVariable)}</Text>
                <Text style={styles.tableItemPct}>{formatPercent(variableExpenseRatio)}</Text>
              </View>
            </View>

            {/* Ligne Capacité nette */}
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <View>
                <Text style={styles.tableItemNameBold}>{"Capacité d'épargne projetée"}</Text>
                <Text style={styles.tableItemType}>Surplus théorique</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.tableItemAmountGreenBold}>
                  +{formatEuro(projectedSavings)}
                </Text>
                <Text style={styles.tableItemPctBold}>
                  {formatPercent(savingsCapacityRatio)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ACTIONS DE NAVIGATION RAPIDE */}
        <View style={{ gap: 10, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/fixed-expenses')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: '#e6dfd3',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#231c2b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 5,
                elevation: 2,
              }}>
              <Ionicons name="calendar-outline" size={17} color="#9b6fba" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#231c2b' }}>
                Ajuster les fixes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/variable-expenses')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: '#e6dfd3',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#231c2b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 5,
                elevation: 2,
              }}>
              <Ionicons name="pie-chart-outline" size={17} color="#d9822b" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#231c2b' }}>
                Ajuster les variables
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: '#e6dfd3',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#231c2b',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 5,
              elevation: 2,
            }}>
            <Ionicons name="home-outline" size={17} color="#7c6f85" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c6f85' }}>
              Retour au tableau de bord
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f0e8',
  },
  header: {
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  calcCard: {
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
  calcCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  formulaRows: {
    gap: 12,
  },
  formulaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formulaItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  formulaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#231c2b',
  },
  formulaSub: {
    fontSize: 11,
    color: '#7c6f85',
  },
  formulaPositive: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b9963',
  },
  formulaNegative: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d43f5e',
  },
  subtotalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 4,
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#6e6277',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9b6fba',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0eae0',
    marginVertical: 4,
  },
  finalResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 153, 99, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 153, 99, 0.25)',
  },
  finalResultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#231c2b',
  },
  finalResultSub: {
    fontSize: 11,
    color: '#6e6277',
    marginTop: 2,
  },
  finalResultAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  realtimeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  realtimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  realtimeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9b6fba',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  realtimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  realtimeLabel: {
    fontSize: 11,
    color: '#7c6f85',
    marginBottom: 2,
  },
  realtimeValueRed: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d9822b',
  },
  realtimeValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b9963',
  },
  verticalSep: {
    width: 1,
    height: 28,
    backgroundColor: '#f0eae0',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  ruleCard: {
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
    gap: 12,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
  },
  ruleDescription: {
    fontSize: 12,
    color: '#6e6277',
    lineHeight: 18,
  },
  triBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0eae0',
    marginVertical: 4,
  },
  triBarSegment: {
    height: '100%',
  },
  ruleItemsList: {
    gap: 12,
    marginTop: 4,
  },
  ruleItem: {
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e6dfd3',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  ruleItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ruleItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#231c2b',
  },
  ruleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ruleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ruleItemScore: {
    fontSize: 11,
    color: '#7c6f85',
  },
  simulatorCard: {
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
    gap: 12,
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simulatorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#231c2b',
  },
  simulatorDesc: {
    fontSize: 12,
    color: '#6e6277',
    lineHeight: 18,
  },
  simInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  simInputGroup: {
    flex: 1,
  },
  simInputLabel: {
    fontSize: 11,
    color: '#231c2b',
    marginBottom: 4,
    fontWeight: '700',
  },
  simInput: {
    backgroundColor: '#faf7f2',
    borderColor: '#e6dfd3',
    color: '#231c2b',
    borderRadius: 10,
  },
  projectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  projCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#faf7f2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6dfd3',
  },
  projPeriod: {
    fontSize: 11,
    color: '#7c6f85',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  projAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 4,
  },
  projAmountHigh: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1b9963',
    marginTop: 4,
  },
  simNote: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 4,
  },
  tableSection: {
    gap: 8,
  },
  tableSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7c6f85',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#231c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eae0',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  tableItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#231c2b',
  },
  tableItemNameBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#231c2b',
  },
  tableItemType: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 2,
  },
  tableItemAmountGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b9963',
  },
  tableItemAmountRed: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d43f5e',
  },
  tableItemAmountOrange: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d9822b',
  },
  tableItemAmountGreenBold: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1b9963',
  },
  tableItemPct: {
    fontSize: 11,
    color: '#7c6f85',
    marginTop: 2,
  },
  tableItemPctBold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1b9963',
    marginTop: 2,
  },
});
