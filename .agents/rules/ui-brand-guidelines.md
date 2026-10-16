---
trigger: always_on
---

# Klyro — Directives Design & Charte Graphique (Mobile Expo / React Native)

## 1. Identité & Philosophie Visuelle
- **Nom de marque** : Klyro (gestion budgétaire épurée, claire et moderne).
- **Style** : Minimalisme fintech, composants aux angles arrondis, contrastes doux, aération maximale de l'espace.
- **Règle absolue** : Jamais de noir pur (`#000000`). Toujours privilégier le bleu nuit profond pour les textes et les fonds sombres.

## 2. Tokens Chromatiques (Palette Officielle)

| Rôle | Nom | Code Hex | Utilisation React Native / NativeWind |
| :--- | :--- | :--- | :--- |
| **Primaire** | Bleu Nuit | `#0F172A` | Titres, boutons d'action sombres, cartes sombres |
| **Accent / Succès** | Émeraude Doux | `#10B981` | Revenus, graphiques positifs, boutons CTA |
| **Accent Secondaire**| Émeraude Foncé | `#047857` | Hover/press states, bordures accentuées |
| **Accent Tertiaire** | Lavande / Violet | `#6366F1` | Catégories d'épargne, abonnements, graphiques |
| **Alerte / Dépense** | Saumon Doux | `#F87171` | Dépenses, débit, alertes de dépassement |
| **Fond Écran** | Blanc Cassé | `#F8FAFC` | Couleur de fond principale (`background`) |
| **Surface Carte** | Blanc Pur | `#FFFFFF` | Cartes, modales, bottom sheets |
| **Texte Secondaire**| Gris Ardoise | `#64748B` | Labels, dates, sous-titres, texte estompé |
| **Bordure** | Gris Neutre | `#E2E8F0` | Séparateurs, contours de champs |

### Objet de tokens pour React Native (`theme/colors.ts`) :
```typescript
export const colors = {
  primary: '#0F172A',
  accent: '#10B981',
  accentDark: '#047857',
  lavender: '#6366F1',
  danger: '#F87171',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
} as const;