import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NavigationHeader } from '@/components/navigation-header';
import { AppDialog } from '@/components/confirm-dialog';
import { DetailsSkeleton } from '@/components/ui/loading-state';
import { colors } from '@/theme/colors';

import { useDetailsSimulation } from '@/hooks/use-details-simulation';
import { formatEuro, formatPercent } from '@/constants/formatters';

export default function DetailsScreen() {
  const {
    isLoading,
    isSaving,
    setActiveTab,
    feedbackDialog,
    setFeedbackDialog,
    showResetDialog,
    setShowResetDialog,
    setOverrideMonthlyIncome,
    setOverrideMonthlyFixed,
    setOverrideMonthlyNecessary,
    setOverrideOneTimeAmount,
    setOverrideOneTimeNecessary,
    monthlyIncomeInput,
    monthlyFixedInput,
    monthlyNecessaryInput,
    oneTimeAmountInput,
    oneTimeNecessaryInput,
    parsedMonthlyFixed,
    monthlyResteAVivre,
    isMonthly,
    currentIncome,
    currentNecessary,
    currentEpargne,
    currentBaseResteAVivre,
    handleApplyBudget,
    executeReset,
  } = useDetailsSimulation();


  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
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
          contentContainerClassName="px-3.5 sm:px-4 pt-1.5 pb-[115px] gap-3.5 sm:gap-4 w-full max-w-[860px] self-center">

          {/* 1. SÉLECTEUR D'ONGLET : MENSUELLE vs REVENU PONCTUEL */}
          <View className="flex-row bg-slate-100 p-1 rounded-2xl gap-1">
            <TouchableOpacity
              onPress={() => setActiveTab('monthly')}
              activeOpacity={0.8}
              className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-xl ${
                isMonthly ? 'bg-primary shadow-xs' : ''
              }`}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={isMonthly ? '#ffffff' : colors.textMuted}
              />
              <Text
                className={`text-xs ${
                  isMonthly ? 'text-white font-extrabold' : 'text-muted-foreground font-bold'
                }`}>
                Mensuelle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('onetime')}
              activeOpacity={0.8}
              className={`flex-1 flex-row justify-center items-center gap-1.5 py-2.5 rounded-xl ${
                !isMonthly ? 'bg-primary shadow-xs' : ''
              }`}>
              <Ionicons
                name="flash-outline"
                size={16}
                color={!isMonthly ? '#ffffff' : colors.textMuted}
              />
              <Text
                className={`text-xs ${
                  !isMonthly ? 'text-white font-extrabold' : 'text-muted-foreground font-bold'
                }`}>
                Revenu Ponctuel
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. RÉSULTAT DU CALCUL (BILAN DE SYNTHÈSE DU TABLEUR) */}
          <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
            <View>
              <Text className="text-base sm:text-lg font-black text-foreground">
                {isMonthly ? 'Bilan Mensuel Calculé' : 'Bilan du Revenu Ponctuel'}
              </Text>
              <Text className="text-xs text-muted-foreground font-semibold mt-0.5">
                {isMonthly
                  ? `Revenu (${formatEuro(currentIncome)}) − Charges (${formatEuro(parsedMonthlyFixed)}) = Reste à vivre (${formatEuro(monthlyResteAVivre)})`
                  : `Montant total ponctuel reçu : ${formatEuro(currentIncome)}`}
              </Text>
            </View>

            {/* LES 2 RÉSULTATS CLÉS (NÉCESSAIRE | ÉPARGNE) */}
            <View className="flex-row gap-2.5 sm:gap-3">
              {/* Pilier 1 : Total Nécessaire */}
              <View className="flex-1 rounded-2xl p-3 sm:p-3.5 border border-emerald-200 bg-emerald-50">
                <Badge variant="outline" className="border-emerald-300 bg-emerald-100/60 self-start gap-1 px-1.5 py-0.5 mb-1 rounded-md">
                  <Ionicons name="cart-outline" size={12} color={colors.accentDark} />
                  <Text className="text-[10px] sm:text-[11px] font-bold text-accentDark">Total Nécessaire</Text>
                </Badge>
                <Text
                  className="text-lg sm:text-xl font-black text-accentDark my-1"
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {formatEuro(currentNecessary)}
                </Text>
                <Text className="text-[10px] sm:text-[11px] text-emerald-700/80 font-medium">Seuil de survie</Text>
              </View>

              {/* Pilier 2 : Épargne */}
              <View className="flex-1 rounded-2xl p-3 sm:p-3.5 border border-indigo-200 bg-indigo-50">
                <Badge variant="outline" className="border-indigo-300 bg-indigo-100/60 self-start gap-1 px-1.5 py-0.5 mb-1 rounded-md">
                  <Ionicons name="wallet-outline" size={12} color={colors.lavender} />
                  <Text className="text-[10px] sm:text-[11px] font-bold text-lavender">Épargne</Text>
                </Badge>
                <Text
                  className={`text-lg sm:text-xl font-black my-1 ${
                    currentEpargne >= 0 ? 'text-lavender' : 'text-danger'
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {currentEpargne >= 0 ? '+' : ''}{formatEuro(currentEpargne)}
                </Text>
                <Badge variant="secondary" className="bg-indigo-100/70 border-0 self-start px-1.5 py-0.5 rounded">
                  <Text className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold">
                    {currentIncome > 0 ? formatPercent((currentEpargne / currentIncome) * 100) : '0%'} du total
                  </Text>
                </Badge>
              </View>
            </View>

            {/* BANDEAU FORMULE EN TOUTES LETTRES */}
            <View className="flex-row items-start bg-indigo-50/70 p-3 sm:p-3.5 rounded-2xl border border-indigo-100 gap-2.5">
              <Ionicons name="calculator-outline" size={18} color={colors.lavender} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-xs font-bold text-foreground">
                  Calcul de l’Épargne :{' '}
                  <Text className="font-semibold text-lavender">
                    {isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} − √({isMonthly ? 'Reste à vivre' : 'Montant ponctuel'} × Nécessaire)
                  </Text>
                </Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5">
                  = {formatEuro(currentBaseResteAVivre)} − √({formatEuro(currentBaseResteAVivre)} × {formatEuro(currentNecessary)}) ={' '}
                  <Text className="font-bold text-foreground">{formatEuro(currentEpargne)}</Text>
                </Text>
              </View>
            </View>
          </Card>

          {/* 3. ZONE POUR MODIFIER LE CALCUL (CHAMPS INTERACTIFS) */}
          <Card className="bg-card rounded-3xl p-4 sm:p-5 border border-border shadow-xs gap-3.5 sm:gap-4">
            <View className="flex-row items-center gap-2.5 sm:gap-3 justify-between">
              <View className="flex-row items-center gap-2.5 flex-1 pr-1">
                <View className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center shrink-0">
                  <Ionicons name="create-outline" size={18} color={colors.lavender} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm sm:text-base font-bold text-foreground">Zone pour modifier le calcul</Text>
                  <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                    {isMonthly
                      ? 'Revenu, Charges et Nécessaire'
                      : 'Montant ponctuel et Nécessaire'}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowResetDialog(true)}
                className="gap-1 px-2.5 py-1.5 rounded-lg border-border bg-muted/40 h-auto shrink-0">
                <Ionicons name="refresh-outline" size={13} color={colors.textMuted} />
                <Text className="text-[11px] font-semibold text-muted-foreground">Standard</Text>
              </Button>
            </View>

            {/* CHAMPS SELON LE MODE */}
            <View className="gap-2.5 sm:gap-3">
              {isMonthly ? (
                <>
                  {/* 1. REVENU MENSUEL */}
                  <View>
                    <Text className="text-xs font-bold text-foreground mb-1">Revenu mensuel (€)</Text>
                    <Input
                      value={monthlyIncomeInput}
                      onChangeText={(v) => setOverrideMonthlyIncome(v.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="977"
                      placeholderTextColor={colors.textMuted}
                      className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
                    />
                  </View>

                  {/* 2. CHARGES FIXES */}
                  <View>
                    <Text className="text-xs font-bold text-foreground mb-1">Charges fixes (€)</Text>
                    <Input
                      value={monthlyFixedInput}
                      onChangeText={(v) => setOverrideMonthlyFixed(v.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="61.73"
                      placeholderTextColor={colors.textMuted}
                      className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
                    />
                  </View>

                  {/* 3. TOTAL NÉCESSAIRE */}
                  <View>
                    <Text className="text-xs font-bold text-foreground mb-1">Total Nécessaire (Seuil survie) (€)</Text>
                    <Input
                      value={monthlyNecessaryInput}
                      onChangeText={(v) => setOverrideMonthlyNecessary(v.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="123"
                      placeholderTextColor={colors.textMuted}
                      className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
                    />
                  </View>
                </>
              ) : (
                <>
                  {/* REVENU PONCTUEL */}
                  <View>
                    <Text className="text-xs font-bold text-foreground mb-1">Montant du revenu ponctuel (€)</Text>
                    <Input
                      value={oneTimeAmountInput}
                      onChangeText={(v) => setOverrideOneTimeAmount(v.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="566.17"
                      placeholderTextColor={colors.textMuted}
                      className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
                    />
                  </View>

                  {/* NÉCESSAIRE SUR REVENU PONCTUEL */}
                  <View>
                    <Text className="text-xs font-bold text-foreground mb-1">Part Nécessaire (Seuil survie) (€)</Text>
                    <Input
                      value={oneTimeNecessaryInput}
                      onChangeText={(v) => setOverrideOneTimeNecessary(v.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="198.16"
                      placeholderTextColor={colors.textMuted}
                      className="bg-muted/40 border-border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold text-foreground h-11"
                    />
                  </View>
                </>
              )}
            </View>

            {/* BOUTON ENREGISTRER */}
            <Button
              onPress={handleApplyBudget}
              disabled={isSaving}
              className={`flex-row items-center justify-center bg-primary rounded-xl py-3.5 px-4 gap-2 h-auto ${
                isSaving ? 'opacity-80' : ''
              }`}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" className="mr-1.5" />
              ) : (
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              )}
              <Text className="text-xs sm:text-sm font-bold text-white">
                {isSaving
                  ? 'Enregistrement...'
                  : isMonthly
                  ? 'Appliquer comme budget officiel'
                  : 'Enregistrer ce revenu ponctuel'}
              </Text>
            </Button>
          </Card>

          {/* 4. LIEN VERS CHARGES FIXES */}
          <TouchableOpacity
            onPress={() => router.push('/fixed-expenses')}
            activeOpacity={0.8}
            className="flex-row items-center justify-between bg-card rounded-2xl p-3.5 sm:p-4 border border-border shadow-xs">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 justify-center items-center">
                <Ionicons name="calendar-outline" size={18} color={colors.lavender} />
              </View>
              <Text className="text-sm font-bold text-foreground">Gérer mes charges fixes</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
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

      {/* POP-UP DE RÉSULTAT / FEEDBACK */}
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
