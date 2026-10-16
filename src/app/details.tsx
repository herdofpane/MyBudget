import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { NavigationHeader } from '@/components/navigation-header';
import { AppDialog } from '@/components/confirm-dialog';
import { DetailsSkeleton } from '@/components/ui/loading-state';

import { useBudget } from '@/hooks/use-budget';
import { formatEuro, formatPercent } from '@/constants/formatters';
import { computeSavings } from '@/constants/breakdown';
import { colors } from '@/theme/colors';

export default function DetailsScreen() {
  const {
    budget,
    totalFixedExpenses,
    saveBudget,
    isLoading,
  } = useBudget();

  // Indicateur de sauvegarde en cours
  const [isSaving, setIsSaving] = useState(false);

  // Mode actif : 'monthly' (Mensuelle) ou 'onetime' (Revenu Ponctuel)
  const [activeTab, setActiveTab] = useState<'monthly' | 'onetime'>('monthly');

  // --- ÉTATS DES POP-UPS ---
  const [feedbackDialog, setFeedbackDialog] = useState<{
    visible: boolean;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    subtext?: string;
  } | null>(null);

  const [showResetDialog, setShowResetDialog] = useState(false);

  // --- VALEURS DE SIMULATION (Overrides) ---
  const [overrideMonthlyIncome, setOverrideMonthlyIncome] = useState<string | null>(null);
  const [overrideMonthlyFixed, setOverrideMonthlyFixed] = useState<string | null>(null);
  const [overrideMonthlyNecessary, setOverrideMonthlyNecessary] = useState<string | null>(null);

  const [overrideOneTimeAmount, setOverrideOneTimeAmount] = useState<string | null>(null);
  const [overrideOneTimeNecessary, setOverrideOneTimeNecessary] = useState<string | null>(null);

  const monthlyIncomeInput = overrideMonthlyIncome ?? budget.income.toString();
  const monthlyFixedInput = overrideMonthlyFixed ?? totalFixedExpenses.toString();
  const monthlyNecessaryInput = overrideMonthlyNecessary ?? (budget.targetNecessary || 123).toString();

  const oneTimeAmountInput = overrideOneTimeAmount ?? (budget.oneTimeIncome?.amount || 566.17).toString();
  const oneTimeNecessaryInput = overrideOneTimeNecessary ?? (budget.oneTimeIncome?.necessary || 198.16).toString();

  // --- CALCULS MENSUELS ---
  const parsedMonthlyIncome = Math.max(0, parseFloat(monthlyIncomeInput.replace(',', '.')) || 0);
  const parsedMonthlyFixed = Math.max(0, parseFloat(monthlyFixedInput.replace(',', '.')) || 0);
  const parsedMonthlyNecessary = Math.max(0, parseFloat(monthlyNecessaryInput.replace(',', '.')) || 0);

  // Reste à vivre = Revenu - Charges fixes
  const monthlyResteAVivre = parsedMonthlyIncome - parsedMonthlyFixed;
  // Épargne calculée : Reste à vivre - √(Reste à vivre × Nécessaire)
  const monthlyEpargne = computeSavings(monthlyResteAVivre, parsedMonthlyNecessary);

  // --- CALCULS PONCTUELS ---
  const parsedOneTimeAmount = Math.max(0, parseFloat(oneTimeAmountInput.replace(',', '.')) || 0);
  const parsedOneTimeNecessary = Math.max(0, parseFloat(oneTimeNecessaryInput.replace(',', '.')) || 0);

  // Épargne ponctuelle : Montant ponctuel - √(Montant ponctuel × Nécessaire)
  const oneTimeEpargne = computeSavings(parsedOneTimeAmount, parsedOneTimeNecessary);

  // Sélection des valeurs affichées selon l'onglet actif
  const isMonthly = activeTab === 'monthly';
  const currentIncome = isMonthly ? parsedMonthlyIncome : parsedOneTimeAmount;
  const currentNecessary = isMonthly ? parsedMonthlyNecessary : parsedOneTimeNecessary;
  const currentEpargne = isMonthly ? monthlyEpargne : oneTimeEpargne;
  const currentBaseResteAVivre = isMonthly ? monthlyResteAVivre : parsedOneTimeAmount;

  // Enregistrer les montants personnalisés
  const handleApplyBudget = async () => {
    setIsSaving(true);
    try {
      if (isMonthly) {
        if (parsedMonthlyIncome <= 0) {
          setFeedbackDialog({
            visible: true,
            type: 'warning',
            title: 'Revenu manquant',
            message: 'Veuillez saisir un revenu mensuel valide supérieur à 0 €.',
          });
          return;
        }

        await saveBudget({
          ...budget,
          income: parsedMonthlyIncome,
          fixedExpenses: parsedMonthlyFixed,
          targetNecessary: parsedMonthlyNecessary,
          savingsAccount: monthlyEpargne,
        });
      } else {
        if (parsedOneTimeAmount <= 0) {
          setFeedbackDialog({
            visible: true,
            type: 'warning',
            title: 'Montant manquant',
            message: 'Veuillez saisir un montant de revenu ponctuel supérieur à 0 €.',
          });
          return;
        }

        await saveBudget({
          ...budget,
          oneTimeIncome: {
            amount: parsedOneTimeAmount,
            necessary: parsedOneTimeNecessary,
            savings: oneTimeEpargne,
          },
        });
      }

      if (isMonthly) {
        setOverrideMonthlyIncome(null);
        setOverrideMonthlyFixed(null);
        setOverrideMonthlyNecessary(null);
      } else {
        setOverrideOneTimeAmount(null);
        setOverrideOneTimeNecessary(null);
      }

      setFeedbackDialog({
        visible: true,
        type: 'success',
        title: isMonthly ? 'Budget officiel mis à jour' : 'Revenu ponctuel enregistré',
        message: isMonthly
          ? `Revenu : ${formatEuro(parsedMonthlyIncome)} • Épargne calculée : ${formatEuro(monthlyEpargne)}`
          : `Montant ponctuel : ${formatEuro(parsedOneTimeAmount)} • Épargne : ${formatEuro(oneTimeEpargne)}`,
        subtext: 'Vos préférences ont été sauvegardées et répercutées sur l’accueil.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Exécution de la réinitialisation confirmée
  const executeReset = () => {
    if (isMonthly) {
      setOverrideMonthlyIncome('977');
      setOverrideMonthlyFixed('61.73');
      setOverrideMonthlyNecessary('123');
    } else {
      setOverrideOneTimeAmount('566.17');
      setOverrideOneTimeNecessary('198.16');
    }
    setShowResetDialog(false);
    setFeedbackDialog({
      visible: true,
      type: 'info',
      title: 'Valeurs restaurées',
      message: 'Les paramètres du tableur standard ont été réappliqués dans les champs.',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* EN-TÊTE PRINCIPAL */}
      <NavigationHeader
        title="Calcul & Détails"
        subtitle="RÉPARTITION NÉCESSAIRE, FACULTATIF & ÉPARGNE"
      />

      {isLoading ? (
        <DetailsSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}>

        {/* 1. SÉLECTEUR D'ONGLET : MENSUELLE vs REVENU PONCTUEL */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            onPress={() => setActiveTab('monthly')}
            activeOpacity={0.8}
            style={[styles.tabButton, isMonthly && styles.tabButtonActive]}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={isMonthly ? '#ffffff' : '#7c6f85'}
            />
            <Text style={[styles.tabButtonText, isMonthly && styles.tabButtonTextActive]}>
              Mensuelle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('onetime')}
            activeOpacity={0.8}
            style={[styles.tabButton, !isMonthly && styles.tabButtonActive]}>
            <Ionicons
              name="flash-outline"
              size={16}
              color={!isMonthly ? '#ffffff' : '#7c6f85'}
            />
            <Text style={[styles.tabButtonText, !isMonthly && styles.tabButtonTextActive]}>
              Revenu Ponctuel
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. RÉSULTAT DU CALCUL (BILAN DE SYNTHÈSE DU TABLEUR) */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>
                {isMonthly ? 'Bilan Mensuel Calculé' : 'Bilan du Revenu Ponctuel'}
              </Text>
              <Text style={styles.summarySubtitle}>
                {isMonthly
                  ? `Revenu (${formatEuro(currentIncome)}) − Charges fixes (${formatEuro(parsedMonthlyFixed)}) = Reste à vivre (${formatEuro(monthlyResteAVivre)})`
                  : `Montant total ponctuel reçu : ${formatEuro(currentIncome)}`}
              </Text>
            </View>
          </View>

          {/* LES 2 RÉSULTATS CLÉS (NÉCESSAIRE | ÉPARGNE) */}
          <View style={styles.twoPillarsRow}>
            {/* Pilier 1 : Total Nécessaire */}
            <View style={[styles.pillarBox, styles.pillarNecessary]}>
              <View style={styles.pillarTag}>
                <Ionicons name="cart-outline" size={13} color="#059669" />
                <Text style={[styles.pillarTagText, { color: '#059669' }]}>Total Nécessaire</Text>
              </View>
              <Text style={[styles.pillarAmount, { color: '#059669' }]}>
                {formatEuro(currentNecessary)}
              </Text>
              <Text style={styles.pillarSub}>Seuil de survie</Text>
            </View>

            {/* Pilier 2 : Épargne */}
            <View style={[styles.pillarBox, styles.pillarSavings]}>
              <View style={styles.pillarTag}>
                <Ionicons name="wallet-outline" size={13} color="#9b6fba" />
                <Text style={[styles.pillarTagText, { color: '#9b6fba' }]}>Épargne</Text>
              </View>
              <Text style={[styles.pillarAmount, { color: currentEpargne >= 0 ? '#9b6fba' : '#dc2626' }]}>
                {currentEpargne >= 0 ? '+' : ''}{formatEuro(currentEpargne)}
              </Text>
              <Text style={styles.pillarSub}>
                {currentIncome > 0 ? formatPercent((currentEpargne / currentIncome) * 100) : '0%'} du total
              </Text>
            </View>
          </View>

          {/* BANDEAU FORMULE EN TOUTES LETTRES */}
          <View style={styles.formulaBanner}>
            <Ionicons name="calculator-outline" size={16} color="#9b6fba" />
            <View style={{ flex: 1 }}>
              <Text style={styles.formulaBannerTitle}>
                Calcul de l’Épargne :{' '}
                <Text style={styles.formulaBannerFormula}>
                  {isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} − √({isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} × Nécessaire)
                </Text>
              </Text>
              <Text style={styles.formulaBannerDetail}>
                = {formatEuro(currentBaseResteAVivre)} − √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}) = <Text style={styles.formulaBannerResult}>{formatEuro(currentEpargne)}</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. ZONE POUR MODIFIER LE CALCUL (CHAMPS INTERACTIFS) */}
        <Card style={styles.editSectionCard}>
          <View style={styles.editSectionHeader}>
            <View style={styles.editIconWrap}>
              <Ionicons name="create-outline" size={20} color="#9b6fba" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.editSectionTitle}>Zone pour modifier le calcul</Text>
              <Text style={styles.editSectionSubtitle}>
                {isMonthly
                  ? 'Ajustez le Revenu, les Charges fixes et le Nécessaire pour recalculer l’Épargne'
                  : 'Ajustez le montant ponctuel et le Nécessaire pour recalculer l’Épargne'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowResetDialog(true)}
              activeOpacity={0.7}
              style={styles.resetBtn}>
              <Ionicons name="refresh-outline" size={14} color="#5C5264" />
              <Text style={styles.resetBtnText}>Tableur standard</Text>
            </TouchableOpacity>
          </View>

          {/* CHAMPS SELON LE MODE */}
          <View style={styles.editFieldsGrid}>
            {isMonthly ? (
              <>
                {/* 1. REVENU MENSUEL */}
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Revenu mensuel (€)</Text>
                  <TextInput
                    value={monthlyIncomeInput}
                    onChangeText={(v) => setOverrideMonthlyIncome(v.replace(/[^0-9.,]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="977"
                    placeholderTextColor="#95899e"
                    style={styles.fieldInput}
                  />
                </View>

                {/* 2. CHARGES FIXES */}
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Charges fixes (€)</Text>
                  <TextInput
                    value={monthlyFixedInput}
                    onChangeText={(v) => setOverrideMonthlyFixed(v.replace(/[^0-9.,]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="61.73"
                    placeholderTextColor="#95899e"
                    style={styles.fieldInput}
                  />
                </View>

                {/* 3. TOTAL NÉCESSAIRE */}
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Total Nécessaire (Seuil survie) (€)</Text>
                  <TextInput
                    value={monthlyNecessaryInput}
                    onChangeText={(v) => setOverrideMonthlyNecessary(v.replace(/[^0-9.,]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="123"
                    placeholderTextColor="#95899e"
                    style={styles.fieldInput}
                  />
                </View>
              </>
            ) : (
              <>
                {/* REVENU PONCTUEL */}
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Montant du revenu ponctuel (€)</Text>
                  <TextInput
                    value={oneTimeAmountInput}
                    onChangeText={(v) => setOverrideOneTimeAmount(v.replace(/[^0-9.,]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="566.17"
                    placeholderTextColor="#95899e"
                    style={styles.fieldInput}
                  />
                </View>

                {/* NÉCESSAIRE SUR REVENU PONCTUEL */}
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Part Nécessaire (Seuil survie) (€)</Text>
                  <TextInput
                    value={oneTimeNecessaryInput}
                    onChangeText={(v) => setOverrideOneTimeNecessary(v.replace(/[^0-9.,]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="198.16"
                    placeholderTextColor="#95899e"
                    style={styles.fieldInput}
                  />
                </View>
              </>
            )}
          </View>

          {/* BOUTON ENREGISTRER */}
          <TouchableOpacity
            onPress={handleApplyBudget}
            disabled={isSaving}
            activeOpacity={0.85}
            style={[styles.applyBtn, isSaving && { opacity: 0.8 }]}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
            )}
            <Text style={styles.applyBtnText}>
              {isSaving
                ? 'Enregistrement...'
                : isMonthly
                ? 'Appliquer comme budget officiel'
                : 'Enregistrer ce calcul de revenu ponctuel'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* 6. LIENS DE GESTION DIRECTS */}
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            onPress={() => router.push('/fixed-expenses')}
            activeOpacity={0.8}
            style={styles.bottomNavBtn}>
            <Ionicons name="calendar-outline" size={18} color="#9b6fba" />
            <Text style={styles.bottomNavBtnText}>Gérer mes charges fixes</Text>
            <Ionicons name="chevron-forward" size={14} color="#9b6fba" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}

      {/* POP-UP CONFIRMATION DE RÉINITIALISATION */}
      <AppDialog
        visible={showResetDialog}
        type="warning"
        title="Restaurer le tableur standard ?"
        message={
          isMonthly
            ? 'Cela réinitialisera le Revenu (977 €), les Charges fixes (61,73 €) et le Seuil nécessaire (123 €).'
            : 'Cela réinitialisera le Revenu ponctuel (566,17 €) et le Seuil nécessaire (198,16 €).'
        }
        subtext="Vos modifications non appliquées seront perdues."
        confirmLabel="Restaurer"
        cancelLabel="Annuler"
        onConfirm={executeReset}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* POP-UP DE RÉSULTAT / FEEDBACK (SUCCÈS, INFO OU ERREUR) */}
      {feedbackDialog && (
        <AppDialog
          visible={feedbackDialog.visible}
          type={feedbackDialog.type}
          title={feedbackDialog.title}
          message={feedbackDialog.message}
          subtext={feedbackDialog.subtext}
          confirmLabel="Parfait"
          onConfirm={() => setFeedbackDialog(null)}
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

  /* SÉLECTEUR MENSUEL / PONCTUEL */
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* CARTE DU BILAN */
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  summarySubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  twoPillarsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillarBox: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
  },
  pillarNecessary: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  pillarSavings: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  pillarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  pillarTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pillarAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pillarSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  /* ZONE POUR MODIFIER LE CALCUL */
  editSectionCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  editIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  editSectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  editFieldsGrid: {
    gap: 12,
  },
  editField: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '800',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* LIENS DU BAS */
  bottomNavRow: {
    marginTop: 4,
  },
  bottomNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  bottomNavBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginLeft: 10,
  },

  /* BANDEAU DU CALCUL EN TOUTES LETTRES */
  formulaBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  formulaBannerTitle: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '800',
  },
  formulaBannerFormula: {
    fontWeight: '800',
    color: colors.accent,
  },
  formulaBannerDetail: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  formulaBannerResult: {
    fontWeight: '900',
    color: colors.accentDark,
  },
});
