import { NecessaryBreakdown, FacultativeBreakdown } from '@/types';

// Poids en pourcentage pour le Nécessaire (Seuil de survie)
export const NECESSARY_CONFIG = [
  { key: 'groceries', label: 'Course (Alimentation/Entretien)', percent: 49, icon: 'cart-outline', color: '#059669' },
  { key: 'transport', label: 'Transports (Essence/Tickets)', percent: 37, icon: 'car-outline', color: '#2563eb' },
  { key: 'hygiene', label: 'Hygiène & Santé', percent: 14, icon: 'medkit-outline', color: '#0d9488' },
] as const;

// Poids en pourcentage pour le Facultatif (Budget Plaisir)
export const FACULTATIVE_CONFIG = [
  { key: 'leisure', label: 'Activité, Loisir & Culture', percent: 37, icon: 'film-outline', color: '#d9822b' },
  { key: 'restaurants', label: 'Resto, Cafés', percent: 26, icon: 'restaurant-outline', color: '#ea580c' },
  { key: 'clothing', label: 'Habillement', percent: 21, icon: 'shirt-outline', color: '#8557a5' },
  { key: 'misc', label: 'Divers & Imprévus', percent: 16, icon: 'sparkles-outline', color: '#64748b' },
] as const;

// Calcul automatique de la ventilation du Nécessaire
export function computeNecessaryBreakdown(totalAmount: number): NecessaryBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  return {
    groceries: Math.round(safeTotal * 0.49 * 100) / 100,
    transport: Math.round(safeTotal * 0.37 * 100) / 100,
    hygiene: Math.round(safeTotal * 0.14 * 100) / 100,
    total: safeTotal,
  };
}

// Calcul automatique de la ventilation du Facultatif
export function computeFacultativeBreakdown(totalAmount: number): FacultativeBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  return {
    leisure: Math.round(safeTotal * 0.37 * 100) / 100,
    restaurants: Math.round(safeTotal * 0.26 * 100) / 100,
    clothing: Math.round(safeTotal * 0.21 * 100) / 100,
    misc: Math.round(safeTotal * 0.16 * 100) / 100,
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
