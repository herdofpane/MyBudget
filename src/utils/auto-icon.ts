import { FixedCategoryType } from '@/types';
import { CATEGORY_CONFIG } from '@/data';

export interface DetectedExpenseMeta {
  icon: string;
  color: string;
  category?: FixedCategoryType;
}

interface MatchRule {
  keywords: string[];
  icon: string;
  color: string;
  category?: FixedCategoryType;
}

/**
 * Normalise une chaîne de texte (minuscules, sans accents, sans ponctuation excessive)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Catalogue intelligent de détection d'icônes, couleurs et catégories
 * pour les charges fixes et variables.
 */
const MATCH_RULES: MatchRule[] = [
  // 1. ALIMENTATION & COURSES
  {
    keywords: [
      'course', 'courses', 'supermarche', 'superette', 'alimentaire', 'alimentation',
      'epicerie', 'nourriture', 'bouffe', 'carrefour', 'leclerc', 'auchan', 'lidl',
      'intermarche', 'monoprix', 'picard', 'boucherie', 'boulangerie', 'pain',
      'fruits', 'legumes', 'marche', 'drive', 'super u', 'biocoop', 'cora', 'franprix'
    ],
    icon: 'cart-outline',
    color: '#059669', // Vert émeraude
    category: 'autre',
  },

  // 2. RESTAURANTS, BARS & FAST-FOOD
  {
    keywords: [
      'restaurant', 'resto', 'cafe', 'bar', 'brasserie', 'bistrot', 'bistro',
      'fast food', 'fastfood', 'burger', 'pizza', 'pizzeria', 'sushi', 'mcdo',
      'macdo', 'mcdonald', 'kfc', 'burger king', 'uber eats', 'deliveroo',
      'takeaway', 'starbucks', 'snack', 'sandwich', 'kebab', 'tacos', 'repas'
    ],
    icon: 'restaurant-outline',
    color: '#d97706', // Ambre
    category: 'autre',
  },

  // 3. LOGEMENT & IMMOBILIER
  {
    keywords: [
      'loyer', 'appartement', 'appart', 'maison', 'logement', 'locatif',
      'syndic', 'foncier', 'taxe fonciere', 'copro', 'copropriete', 'bailleur',
      'caution', 'quittance', 'charges locatives', 'garant', 'chambre'
    ],
    icon: 'home-outline',
    color: '#9b6fba', // Violet doux
    category: 'logement',
  },

  // 4. ÉNERGIE, EAU & CHAUFFAGE
  {
    keywords: [
      'edf', 'electricite', 'engie', 'totalenergies', 'total direct', 'gaz',
      'eau', 'veolia', 'suez', 'chauffage', 'enedis', 'fioul', 'pellet', 'energie', 'climatisation'
    ],
    icon: 'flash-outline',
    color: '#d9822b', // Orange chaud
    category: 'energie',
  },

  // 5. ASSURANCES & MUTUELLE
  {
    keywords: [
      'assurance', 'mutuelle', 'maif', 'macif', 'axa', 'allianz', 'matmut',
      'groupama', 'mma', 'generali', 'prevoyance', 'responsabilite civile', 'courtier'
    ],
    icon: 'shield-checkmark-outline',
    color: '#2563eb', // Bleu royal
    category: 'assurance',
  },

  // 6. STREAMING, JEUX & DIVERTISSEMENT
  {
    keywords: [
      'netflix', 'spotify', 'deezer', 'disney', 'prime video', 'amazon prime',
      'canal', 'canal+', 'youtube', 'apple music', 'apple tv', 'hbo', 'paramount',
      'crunchyroll', 'playstation', 'psn', 'xbox', 'game pass', 'nintendo',
      'twitch', 'steam', 'audible', 'podcast'
    ],
    icon: 'play-circle-outline',
    color: '#db2777', // Rose fuchsia
    category: 'abonnements',
  },

  // 7. ABONNEMENTS INTERNET & TÉLÉPHONIE
  {
    keywords: [
      'internet', 'box', 'wifi', 'fibre', 'forfait', 'mobile', 'telephone',
      'free', 'freebox', 'orange', 'sfr', 'bouygues', 'sosh', 'red by sfr',
      'telecom', 'abonnement', 'abonnements', 'icloud', 'google one', 'dropbox'
    ],
    icon: 'wifi-outline',
    color: '#8557a5', // Violet améthyste
    category: 'abonnements',
  },

  // 8. VOITURE, CARBURANT & VÉHICULE
  {
    keywords: [
      'voiture', 'auto', 'moto', 'essence', 'carburant', 'diesel', 'gazole',
      'sp95', 'sp98', 'e85', 'total', 'peage', 'parking', 'garage', 'reparation',
      'pneu', 'vidange', 'lavage', 'controle technique', 'amende', 'station', 'vignette'
    ],
    icon: 'car-sport-outline',
    color: '#2563eb', // Bleu
    category: 'transport',
  },

  // 9. TRANSPORTS EN COMMUN & VOYAGES QUOTIDIENS
  {
    keywords: [
      'navigo', 'ratp', 'sncf', 'train', 'rer', 'metro', 'bus', 'tram',
      'tramway', 'pass transport', 'billet train', 'ouigo', 'tgv', 'ter',
      'taxi', 'uber', 'vtc', 'blablacar', 'trottinette', 'velo', 'velib', 'lime'
    ],
    icon: 'train-outline',
    color: '#0891b2', // Cyan
    category: 'transport',
  },

  // 10. CRÉDITS & EMPRUNTS
  {
    keywords: [
      'credit', 'pret', 'emprunt', 'mensualite', 'banque', 'cetelem',
      'sofinco', 'cofidis', 'remboursement', 'financement', 'leasing',
      'loa', 'lld', 'dette', 'prelevement pret'
    ],
    icon: 'cash-outline',
    color: '#e11d48', // Rose rouge
    category: 'credit',
  },

  // 11. SANTÉ, MÉDICAL & BIEN-ÊTRE
  {
    keywords: [
      'sante', 'pharmacie', 'medecin', 'docteur', 'dentiste', 'opticien',
      'lunettes', 'hopital', 'medicament', 'soin', 'soins', 'kine', 'psy',
      'ophtalmo', 'analyse', 'laboratoire', 'clinique', 'osteo', 'therapie'
    ],
    icon: 'medkit-outline',
    color: '#059669', // Vert
    category: 'autre',
  },

  // 12. SHOPPING, MODE & HABILLEMENT
  {
    keywords: [
      'shopping', 'vetement', 'vetements', 'habits', 'habillement', 'fringues',
      'zara', 'h&m', 'uniqlo', 'chaussures', 'mode', 'vinted', 'asos',
      'shein', 'manteau', 'pantalon', 'robe', 'pull', 'sneakers', 'nike',
      'adidas', 'galeries lafayette', 'printemps'
    ],
    icon: 'shirt-outline',
    color: '#9333ea', // Violet
    category: 'autre',
  },

  // 13. SPORT, FITNESS & MUSCULATION
  {
    keywords: [
      'sport', 'gym', 'fitness', 'basic fit', 'basicfit', 'fitness park',
      'salle de sport', 'musculation', 'muscu', 'piscine', 'foot', 'football',
      'tennis', 'yoga', 'escalade', 'pilates', 'coach', 'club sport', 'cotisation club'
    ],
    icon: 'barbell-outline',
    color: '#0284c7', // Bleu ciel
    category: 'abonnements',
  },

  // 14. VACANCES, VOYAGES & LOISIRS
  {
    keywords: [
      'vacance', 'vacances', 'voyage', 'hotel', 'airbnb', 'booking',
      'avion', 'billet avion', 'aeroport', 'vol', 'plage', 'ski', 'camping',
      'sejour', 'cinema', 'concert', 'festival', 'spectacle', 'theatre',
      'parc', 'disneyland', 'musee', 'exposition', 'visite'
    ],
    icon: 'airplane-outline',
    color: '#ea580c', // Orange vif
    category: 'autre',
  },

  // 15. ANIMAUX DE COMPAGNIE
  {
    keywords: [
      'animal', 'animaux', 'chien', 'chat', 'veterinaire', 'croquettes',
      'litiere', 'animalerie', 'toilettage', 'frais veto', 'assurance chat', 'assurance chien'
    ],
    icon: 'paw-outline',
    color: '#ca8a04', // Jaune ambre
    category: 'autre',
  },

  // 16. BEAUTÉ, COIFFEUR & SOIN
  {
    keywords: [
      'coiffeur', 'coiffure', 'barbier', 'barber', 'esthetique', 'ongles',
      'manucure', 'massage', 'spa', 'parfum', 'sephora', 'maquillage', 'beaute', 'soin visage'
    ],
    icon: 'cut-outline',
    color: '#db2777', // Rose
    category: 'autre',
  },

  // 17. CADEAUX & ÉVÉNEMENTS
  {
    keywords: [
      'cadeau', 'cadeaux', 'anniversaire', 'noel', 'fete', 'mariage',
      'soiree', 'fleur', 'fleurs', 'chocolat', 'surprise'
    ],
    icon: 'gift-outline',
    color: '#e11d48', // Rouge rosé
    category: 'autre',
  },

  // 18. ÉDUCATION, ÉTUDES & LIVRES
  {
    keywords: [
      'ecole', 'etude', 'etudes', 'universite', 'creche', 'nounou', 'garde',
      'formation', 'livre', 'livres', 'fnac', 'cours', 'scolaire', 'cantine'
    ],
    icon: 'school-outline',
    color: '#4f46e5', // Indigo
    category: 'autre',
  },

  // 19. FRAIS BANCAIRES & CARTE
  {
    keywords: [
      'banque', 'frais bancaire', 'frais bancaires', 'cotisation carte',
      'tenue de compte', 'agios', 'agio', 'carte bancaire', 'commission'
    ],
    icon: 'card-outline',
    color: '#475569', // Gris ardoise
    category: 'autre',
  },

  // 20. IMPÔTS & TAXES
  {
    keywords: [
      'impot', 'impots', 'taxe', 'taxes', 'tresor public', 'urssaf',
      'amende', 'cotisation', 'taxe habitation', 'dgfip'
    ],
    icon: 'document-text-outline',
    color: '#64748b', // Gris ardoise
    category: 'autre',
  },
];

/**
 * Détecte automatiquement l'icône, la couleur et la catégorie recommandée
 * en analysant le titre d'une dépense (fixe ou variable).
 *
 * @param label Le nom ou titre saisi par l'utilisateur
 * @param fallbackCategory Catégorie fixe par défaut en cas d'absence de correspondance
 */
export function autoDetectExpenseMeta(
  label: string,
  fallbackCategory: FixedCategoryType = 'autre'
): DetectedExpenseMeta {
  const normalized = normalizeText(label);

  if (!normalized) {
    const defaultCatConfig = CATEGORY_CONFIG[fallbackCategory] || CATEGORY_CONFIG.autre;
    return {
      icon: defaultCatConfig.icon,
      color: defaultCatConfig.color,
      category: fallbackCategory,
    };
  }

  // Découper en mots pour comparaison exacte ou inclusion
  const words = normalized.split(/\s+/);

  for (const rule of MATCH_RULES) {
    // Vérifier si un des mots-clés correspond exactement à un mot ou est contenu dans le label
    const match = rule.keywords.some((keyword) => {
      if (keyword.includes(' ')) {
        return normalized.includes(keyword);
      }
      return words.includes(keyword) || normalized.includes(keyword);
    });

    if (match) {
      return {
        icon: rule.icon,
        color: rule.color,
        category: rule.category || fallbackCategory,
      };
    }
  }

  // Fallback si aucun mot-clé n'a correspondu
  const defaultCatConfig = CATEGORY_CONFIG[fallbackCategory] || CATEGORY_CONFIG.autre;
  return {
    icon: defaultCatConfig.icon || 'pricetag-outline',
    color: defaultCatConfig.color || '#9b6fba',
    category: fallbackCategory,
  };
}
