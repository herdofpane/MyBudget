import { FixedExpenseItem } from '@/types';

/**
 * Domain utility functions for credit and installment tracking (SOLID Layer 2)
 * Pure, deterministic functions testable without React dependencies.
 */

/**
 * Calculates remaining installments/months for a credit expense.
 * Returns Infinity for non-credit items.
 */
export function getCreditRemainingMonths(item: FixedExpenseItem): number {
  if (!item.isCredit || !item.durationMonths || item.durationMonths <= 0) {
    return Infinity;
  }

  // 1. Explicitly recorded paid installments count
  if (typeof item.paidMonthsCount === 'number') {
    return Math.max(0, item.durationMonths - item.paidMonthsCount);
  }

  // 2. Start month in YYYY-MM UTC format
  if (item.startMonth && /^\d{4}-\d{2}$/.test(item.startMonth)) {
    const [startYear, startMonthNum] = item.startMonth.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonthNum = now.getUTCMonth() + 1; // 1 to 12

    const elapsed = (currentYear - startYear) * 12 + (currentMonthNum - startMonthNum);
    const remaining = item.durationMonths - Math.max(0, elapsed);
    return Math.max(0, remaining);
  }

  return item.durationMonths;
}

/**
 * Calculates calendar months delta between two YYYY-MM formatted dates
 */
function getMonthsOffset(fromMonth: string, toMonth: string): number {
  if (!/^\d{4}-\d{2}$/.test(fromMonth) || !/^\d{4}-\d{2}$/.test(toMonth)) return 0;
  const [yA, mA] = fromMonth.split('-').map(Number);
  const [yB, mB] = toMonth.split('-').map(Number);
  return (yB - yA) * 12 + (mB - mA);
}

/**
 * Calculates remaining credit months as of a target month (YYYY-MM)
 */
export function getCreditRemainingMonthsInMonth(
  item: FixedExpenseItem,
  targetMonthStr?: string,
  baseMonthStr?: string
): number {
  const currentRemaining = getCreditRemainingMonths(item);
  if (currentRemaining === Infinity) return Infinity;
  if (!targetMonthStr) return currentRemaining;

  const base = baseMonthStr || new Date().toISOString().slice(0, 7);
  const offset = getMonthsOffset(base, targetMonthStr);
  return Math.max(0, currentRemaining - offset);
}

/**
 * Determines whether a credit is fully repaid in the current month
 */
export function isCreditExpired(item: FixedExpenseItem): boolean {
  if (!item.isCredit || !item.durationMonths || item.durationMonths <= 0) {
    return false;
  }
  return getCreditRemainingMonths(item) <= 0;
}

/**
 * Determines whether a credit is fully repaid as of a given target month
 */
export function isCreditExpiredInMonth(
  item: FixedExpenseItem,
  targetMonthStr?: string,
  baseMonthStr?: string
): boolean {
  if (!item.isCredit || !item.durationMonths || item.durationMonths <= 0) {
    return false;
  }
  return getCreditRemainingMonthsInMonth(item, targetMonthStr, baseMonthStr) <= 0;
}

/**
 * Computes detailed installment progress for a given target month
 */
export function getCreditProgressInMonth(
  item: FixedExpenseItem,
  targetMonthStr?: string,
  baseMonthStr?: string
) {
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
  const remainingMonths = getCreditRemainingMonthsInMonth(item, targetMonthStr, baseMonthStr);
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
 * Computes detailed installment progress for the current month
 */
export function getCreditProgress(item: FixedExpenseItem) {
  return getCreditProgressInMonth(item);
}

/**
 * Formats estimated credit completion date in French locale (e.g. "Juin 2027")
 */
export function formatCreditEndDate(item: FixedExpenseItem): string {
  if (!item.isCredit || !item.durationMonths) return '';

  const remaining = getCreditRemainingMonths(item);
  const now = new Date();
  const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + remaining, 1));

  const formatted = targetDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
