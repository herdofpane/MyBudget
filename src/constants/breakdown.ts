import { NecessaryBreakdown, FacultativeBreakdown } from '@/types';

// Ratios pour le Nécessaire (Seuil de survie)
export const GROCERIES_PERCENT = 49;
export const TRANSPORT_PERCENT = 37;
export const HYGIENE_PERCENT = 14;

export const GROCERIES_RATIO = GROCERIES_PERCENT / 100;
export const TRANSPORT_RATIO = TRANSPORT_PERCENT / 100;
export const HYGIENE_RATIO = HYGIENE_PERCENT / 100;

export const NECESSARY_CONFIG = [
  { key: 'groceries', label: 'Course (Alimentation/Entretien)', percent: GROCERIES_PERCENT, icon: 'cart-outline', color: '#059669' },
  { key: 'transport', label: 'Transports (Essence/Tickets)', percent: TRANSPORT_PERCENT, icon: 'car-outline', color: '#2563eb' },
  { key: 'hygiene', label: 'Hygiène & Santé', percent: HYGIENE_PERCENT, icon: 'medkit-outline', color: '#0d9488' },
] as const;

// Ratios pour le Facultatif (Budget Plaisir)
export const LEISURE_PERCENT = 37;
export const RESTAURANTS_PERCENT = 26;
export const CLOTHING_PERCENT = 21;
export const MISC_PERCENT = 16;

export const LEISURE_RATIO = LEISURE_PERCENT / 100;
export const RESTAURANTS_RATIO = RESTAURANTS_PERCENT / 100;
export const CLOTHING_RATIO = CLOTHING_PERCENT / 100;
export const MISC_RATIO = MISC_PERCENT / 100;

export const FACULTATIVE_CONFIG = [
  { key: 'leisure', label: 'Activité, Loisir & Culture', percent: LEISURE_PERCENT, icon: 'film-outline', color: '#d9822b' },
  { key: 'restaurants', label: 'Resto, Cafés', percent: RESTAURANTS_PERCENT, icon: 'restaurant-outline', color: '#ea580c' },
  { key: 'clothing', label: 'Habillement', percent: CLOTHING_PERCENT, icon: 'shirt-outline', color: '#8557a5' },
  { key: 'misc', label: 'Divers & Imprévus', percent: MISC_PERCENT, icon: 'sparkles-outline', color: '#64748b' },
] as const;

export function computeNecessaryBreakdown(totalAmount: number): NecessaryBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  return {
    groceries: Math.round(safeTotal * GROCERIES_RATIO * 100) / 100,
    transport: Math.round(safeTotal * TRANSPORT_RATIO * 100) / 100,
    hygiene: Math.round(safeTotal * HYGIENE_RATIO * 100) / 100,
    total: safeTotal,
  };
}

export function computeFacultativeBreakdown(totalAmount: number): FacultativeBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  return {
    leisure: Math.round(safeTotal * LEISURE_RATIO * 100) / 100,
    restaurants: Math.round(safeTotal * RESTAURANTS_RATIO * 100) / 100,
    clothing: Math.round(safeTotal * CLOTHING_RATIO * 100) / 100,
    misc: Math.round(safeTotal * MISC_RATIO * 100) / 100,
    total: safeTotal,
  };
}

/**
 * Calcul exact de l'épargne selon la formule du tableur CSV :
 * =ARRONDI(B4 - RACINE(B4 * B10); 2)
 *
 * @param resteAVivre Base / Reste à vivre (Cellule B4)
 * @param totalNecessaire Total Nécessaire / Seuil de survie (Cellule B10)
 * @returns Montant d'épargne arrondi au centime près
 */
export function computeSavings(resteAVivre: number, totalNecessaire: number): number {
  if (resteAVivre <= 0 || totalNecessaire <= 0) return 0;
  if (resteAVivre <= totalNecessaire) return 0;
  const raw = resteAVivre - Math.sqrt(resteAVivre * totalNecessaire);
  return Math.max(0, Math.round(raw * 100) / 100);
}
