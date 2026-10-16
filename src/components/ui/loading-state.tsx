import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { Colors } from '@/constants/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Bloc Skeleton avec pulsation d'opacité douce et organique
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 10,
  style,
}: SkeletonProps) {
  const [opacityAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

/**
 * Écran de chargement élégant aux couleurs de la charte
 */
export function LoadingScreen({
  message = 'Chargement de vos finances...',
  submessage = 'Préparation de votre budget optimisé',
}: LoadingScreenProps) {
  return (
    <View style={styles.loadingScreenWrapper}>
      <View style={styles.spinnerCard}>
        <View style={styles.spinnerBulle}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
        <Text style={styles.loadingTitle}>{message}</Text>
        <Text style={styles.loadingSub}>{submessage}</Text>
      </View>
    </View>
  );
}

/**
 * Squelette de chargement complet pour l'écran d'accueil
 */
export function HomeSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Skeleton Hero Card */}
      <View style={styles.skeletonHeroCard}>
        <View style={styles.rowBetween}>
          <Skeleton width={110} height={26} borderRadius={12} />
          <Skeleton width={140} height={18} borderRadius={8} />
        </View>
        <Skeleton width={180} height={46} borderRadius={12} style={{ marginTop: 14 }} />
        <Skeleton width="100%" height={38} borderRadius={12} style={{ marginTop: 14 }} />
      </View>

      {/* Skeleton Input Card */}
      <View style={styles.skeletonCard}>
        <View style={styles.rowBetween}>
          <Skeleton width={130} height={20} borderRadius={8} />
          <Skeleton width={70} height={20} borderRadius={10} />
        </View>
        <Skeleton width="100%" height={48} borderRadius={14} style={{ marginTop: 12 }} />
      </View>

      {/* Skeleton Fixed Card */}
      <View style={styles.skeletonCard}>
        <View style={styles.rowBetween}>
          <Skeleton width={140} height={20} borderRadius={8} />
          <Skeleton width={90} height={26} borderRadius={8} />
        </View>
      </View>

      {/* Skeleton 2 Comptes */}
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonCard, { flex: 1 }]}>
          <Skeleton width={90} height={16} borderRadius={8} />
          <Skeleton width={110} height={28} borderRadius={10} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
        <View style={[styles.skeletonCard, { flex: 1 }]}>
          <Skeleton width={90} height={16} borderRadius={8} />
          <Skeleton width={110} height={28} borderRadius={10} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

/**
 * Squelette de chargement pour les listes (charges fixes, variables)
 */
export function ListSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeroCard}>
        <View style={styles.rowBetween}>
          <Skeleton width={120} height={22} borderRadius={10} />
          <Skeleton width={80} height={22} borderRadius={10} />
        </View>
        <Skeleton width={160} height={40} borderRadius={12} style={{ marginTop: 14 }} />
      </View>

      <View style={styles.skeletonCard}>
        <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={60} borderRadius={14} />
      </View>
    </View>
  );
}

/**
 * Squelette de chargement pour l'écran Calcul & Détails
 */
export function DetailsSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Sélecteur d'onglets (Mensuelle / Ponctuel) */}
      <View style={styles.skeletonRow}>
        <Skeleton width="48%" height={42} borderRadius={12} />
        <Skeleton width="48%" height={42} borderRadius={12} />
      </View>

      {/* Carte Résultat / Bilan */}
      <View style={styles.skeletonHeroCard}>
        <View style={styles.rowBetween}>
          <Skeleton width={150} height={22} borderRadius={8} />
          <Skeleton width={90} height={24} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={88} borderRadius={16} style={{ marginTop: 16 }} />
        <View style={[styles.skeletonRow, { marginTop: 14 }]}>
          <Skeleton width="30%" height={48} borderRadius={10} />
          <Skeleton width="30%" height={48} borderRadius={10} />
          <Skeleton width="30%" height={48} borderRadius={10} />
        </View>
        <Skeleton width="100%" height={14} borderRadius={8} style={{ marginTop: 14 }} />
      </View>

      {/* Carte Explication & Formule */}
      <View style={styles.skeletonCard}>
        <Skeleton width={180} height={20} borderRadius={8} />
        <Skeleton width="100%" height={56} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      {/* Carte Formulaire de simulation */}
      <View style={styles.skeletonCard}>
        <Skeleton width={140} height={20} borderRadius={8} />
        <Skeleton width="100%" height={50} borderRadius={12} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={50} borderRadius={12} style={{ marginTop: 10 }} />
        <Skeleton width="100%" height={48} borderRadius={14} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
  },
  loadingScreenWrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinnerCard: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  spinnerBulle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.backgroundSelected,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  loadingSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  skeletonHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
