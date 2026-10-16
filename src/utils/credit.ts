import { FixedExpenseItem } from '@/types';

/**
 * Utilitaires métiers pour la gestion des crédits sur X mois
 * Couche 2 SOLID (Logique Métier pure et testable sans React)
 */

/**
 * Calcule le nombre de mois restants pour un crédit
 * Si l'item n'est pas un crédit, renvoie Infinity
 */
export function getCreditRemainingMonths(item: FixedExpenseItem): number {
  if (!item.isCredit || !item.durationMonths || item.durationMonths <= 0) {
    return Infinity;
  }

  // 1. Si on a le nombre explicite de mensualités payées
  if (typeof item.paidMonthsCount === 'number') {
    return Math.max(0, item.durationMonths - item.paidMonthsCount);
  }

  // 2. Si on a un mois de début au format YYYY-MM
  if (item.startMonth && /^\d{4}-\d{2}$/.test(item.startMonth)) {
    const [startYear, startMonthNum] = item.startMonth.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1 à 12

    const elapsed = (currentYear - startYear) * 12 + (currentMonthNum - startMonthNum);
    const remaining = item.durationMonths - Math.max(0, elapsed);
    return Math.max(0, remaining);
  }

  return item.durationMonths;
}

/**
 * Détermine si le crédit est arrivé à son terme (soldé / expiré)
 * Lorsque true, la charge ne doit plus impacter le total des charges fixes
 */
export function isCreditExpired(item: FixedExpenseItem): boolean {
  if (!item.isCredit || !item.durationMonths || item.durationMonths <= 0) {
    return false;
  }
  return getCreditRemainingMonths(item) <= 0;
}

/**
 * Calcule la progression détaillée d'un crédit
 */
export function getCreditProgress(item: FixedExpenseItem) {
  if (!item.isCredit || !item.durationMonths) {
    return {
      paid: 0,
      total: 0,
      remainingMonths: Infinity,
      isExpired: false,
      percent: 0,
      remainingAmount: 0,
    };
  }

  const total = item.durationMonths;
  const remainingMonths = getCreditRemainingMonths(item);
  const paid = Math.min(total, Math.max(0, total - remainingMonths));
  const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const remainingAmount = Math.round(remainingMonths * item.amount * 100) / 100;

  return {
    paid,
    total,
    remainingMonths,
    isExpired: remainingMonths <= 0,
    percent,
    remainingAmount,
  };
}

/**
 * Formate la date de fin estimée du crédit (ex: "Juin 2027")
 */
export function formatCreditEndDate(item: FixedExpenseItem): string {
  if (!item.isCredit || !item.durationMonths) return '';

  const remaining = getCreditRemainingMonths(item);
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + remaining);

  const formatted = targetDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
