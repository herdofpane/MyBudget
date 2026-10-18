import { FixedExpenseItem } from '@/types';
import { isCreditExpired } from '@/utils/credit';
import { colors } from '@/theme/colors';

/**
 * Utilitaires métiers pour la gestion des charges fixes (Couche 2 SOLID)
 * Gère la planification par mois (active à partir de tel mois, ou uniquement tel mois)
 */

/**
 * Renvoie le mois courant au format YYYY-MM (ex: "2026-10")
 */
export function getCurrentMonthStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Détermine si une charge fixe est active pour le mois donné (par défaut, le mois courant).
 * Si inactive (charge à venir ou ponctuelle d'un autre mois ou crédit soldé), elle ne doit pas impacter le total.
 */
export function isChargeActiveInMonth(
  item: FixedExpenseItem,
  currentMonthStr: string = getCurrentMonthStr()
): boolean {
  // 1. Crédits échus / soldés
  if (isCreditExpired(item)) {
    return false;
  }

  // 2. Vérification de la planification
  const activationType = item.activationType || 'all';
  const targetMonth = item.targetMonth || item.startMonth;

  // Si active à partir d'un mois précis
  if (activationType === 'starting_from' && targetMonth) {
    return currentMonthStr >= targetMonth;
  }

  // Si active uniquement sur un mois précis
  if (activationType === 'only_month' && targetMonth) {
    return currentMonthStr === targetMonth;
  }

  return true;
}

export type ChargeStatusKey = 'active' | 'upcoming' | 'only_month_active' | 'past' | 'credit_expired';

export interface ChargeStatusInfo {
  status: ChargeStatusKey;
  badgeLabel: string;
  isCounted: boolean;
  description: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
}

/**
 * Calcule le statut détaillé de planification d'une charge fixe
 */
export function getChargeScheduleStatus(
  item: FixedExpenseItem,
  currentMonthStr: string = getCurrentMonthStr()
): ChargeStatusInfo {
  // Crédit soldé
  if (isCreditExpired(item)) {
    return {
      status: 'credit_expired',
      badgeLabel: 'Soldé',
      isCounted: false,
      description: 'Crédit entièrement remboursé',
      badgeColor: colors.textMuted,
      badgeBg: '#F1F5F9',
      badgeBorder: '#CBD5E1',
    };
  }

  const activationType = item.activationType || 'all';
  const targetMonth = item.targetMonth || item.startMonth;

  // Active à partir de tel mois
  if (activationType === 'starting_from' && targetMonth) {
    if (currentMonthStr < targetMonth) {
      return {
        status: 'upcoming',
        badgeLabel: `Dès ${formatMonthYear(targetMonth)}`,
        isCounted: false,
        description: `Charge différée active à partir de ${formatMonthYear(targetMonth)}`,
        badgeColor: colors.lavender,
        badgeBg: '#EEF2FF',
        badgeBorder: '#C7D2FE',
      };
    }
  }

  // Active uniquement sur tel mois
  if (activationType === 'only_month' && targetMonth) {
    if (currentMonthStr === targetMonth) {
      return {
        status: 'only_month_active',
        badgeLabel: `Ce mois (${formatMonthYear(targetMonth)})`,
        isCounted: true,
        description: 'Charge ponctuelle active pour ce mois-ci',
        badgeColor: '#D97706',
        badgeBg: '#FEF3C7',
        badgeBorder: '#FDE68A',
      };
    } else if (currentMonthStr < targetMonth) {
      return {
        status: 'upcoming',
        badgeLabel: `Unique • ${formatMonthYear(targetMonth)}`,
        isCounted: false,
        description: `Charge ponctuelle prévue pour ${formatMonthYear(targetMonth)}`,
        badgeColor: colors.lavender,
        badgeBg: '#EEF2FF',
        badgeBorder: '#C7D2FE',
      };
    } else {
      return {
        status: 'past',
        badgeLabel: `Passée (${formatMonthYear(targetMonth)})`,
        isCounted: false,
        description: `Charge ponctuelle passée de ${formatMonthYear(targetMonth)}`,
        badgeColor: colors.textMuted,
        badgeBg: '#F8FAFC',
        badgeBorder: '#E2E8F0',
      };
    }
  }

  // Charge standard récurrente
  return {
    status: 'active',
    badgeLabel: 'Mensuelle',
    isCounted: true,
    description: 'Prélèvement récurrent chaque mois',
    badgeColor: colors.accent,
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
  };
}

/**
 * Formate un mois YYYY-MM en texte lisible (ex: "2026-11" -> "Nov. 2026")
 */
export function formatMonthYear(monthStr: string): string {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr || '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  const formatted = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formate un mois YYYY-MM en texte complet (ex: "2026-11" -> "Novembre 2026")
 */
export function formatMonthYearFull(monthStr: string): string {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr || '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  const formatted = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Génère les 6 prochains mois sous forme de présélections rapides
 */
export function getMonthPresets(): { value: string; label: string; fullLabel: string }[] {
  const presets: { value: string; label: string; fullLabel: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const full = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const fullCapitalized = full.charAt(0).toUpperCase() + full.slice(1);

    let shortLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
    shortLabel = shortLabel.charAt(0).toUpperCase() + shortLabel.slice(1);

    if (i === 0) shortLabel = 'Ce mois';
    else if (i === 1) shortLabel = 'Mois prochain';

    presets.push({
      value,
      label: shortLabel,
      fullLabel: fullCapitalized,
    });
  }

  return presets;
}

export interface TargetMonthPreview {
  label: string;
  description: string;
  isCounted: boolean;
}

/**
 * Explication pédagogique en temps réel du mois d'activation choisi (avec guard clauses)
 */
export function getTargetMonthPreviewStatus(
  isScheduled: boolean,
  activationType: 'starting_from' | 'only_month' | 'all',
  targetMonth: string,
  currentMonth: string
): TargetMonthPreview {
  if (!isScheduled || activationType === 'all') {
    return {
      label: 'Active immédiatement',
      description: 'Cette charge sera imputée chaque mois sans interruption.',
      isCounted: true,
    };
  }

  if (activationType === 'starting_from') {
    if (targetMonth <= currentMonth) {
      return {
        label: 'Active dès ce mois-ci',
        description: `Démarre ce mois-ci (${formatMonthYearFull(targetMonth)}) et se renouvellera chaque mois.`,
        isCounted: true,
      };
    }
    return {
      label: `À venir en ${formatMonthYear(targetMonth)}`,
      description: `Non imputée pour le moment. Elle s'activera automatiquement dès ${formatMonthYearFull(targetMonth)}.`,
      isCounted: false,
    };
  }

  // activationType === 'only_month'
  if (targetMonth === currentMonth) {
    return {
      label: 'Active ce mois-ci uniquement',
      description: `S'impute uniquement pour ce mois (${formatMonthYearFull(targetMonth)}), puis s'arrête.`,
      isCounted: true,
    };
  }

  if (targetMonth > currentMonth) {
    return {
      label: `Prévue pour ${formatMonthYear(targetMonth)}`,
      description: `Non imputée pour le moment. S'appliquera uniquement le mois de ${formatMonthYearFull(targetMonth)}.`,
      isCounted: false,
    };
  }

  return {
    label: 'Mois passé',
    description: `Le mois de ${formatMonthYearFull(targetMonth)} est déjà passé. Cette charge n'est plus imputée.`,
    isCounted: false,
  };
}
