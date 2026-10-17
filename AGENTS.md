# Directives Générales du Projet Klyro (Expo / React Native)

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

---

## 1. Expo & React Native Best Practices

### Expo has changed — do not trust outdated training data
Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:
1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Commands
Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).
```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```
Run lint and typecheck before declaring any task done.

### Navigation & Routing
- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Building with EAS
Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

### Native Code & Continuous Native Generation (CNG)
- If `ios/` and `android/` directories do not exist, they are generated. Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

## 2. Klyro — Directives Design & Charte Graphique

### Identité & Philosophie Visuelle
- **Nom de marque** : Klyro (gestion budgétaire épurée, claire et moderne).
- **Style** : Minimalisme fintech, composants aux angles arrondis, contrastes doux, aération maximale de l'espace.
- **Règle absolue** : Jamais de noir pur (`#000000`). Toujours privilégier le bleu nuit profond pour les textes et les fonds sombres.
- **Composants d'interface (UI & Design System)** :
  - Utiliser prioritairement les composants de `@/components/ui/` (React Native Reusables / Tailwind : `Card`, `Button`, `Badge`, `Input`, `Text`).

### Tokens Chromatiques (Palette Officielle)

| Rôle | Nom | Code Hex | Utilisation React Native / NativeWind |
| :--- | :--- | :--- | :--- |
| **Primaire** | Bleu Nuit | `#0F172A` | Titres, boutons d'action sombres, cartes sombres (`bg-primary`, `text-primary`) |
| **Accent / Succès** | Émeraude Doux | `#10B981` | Revenus, graphiques positifs, boutons CTA (`bg-accent`, `text-accent`) |
| **Accent Secondaire**| Émeraude Foncé | `#047857` | Hover/press states, bordures accentuées (`text-accentDark`) |
| **Accent Tertiaire** | Lavande / Violet | `#6366F1` | Catégories d'épargne, abonnements, graphiques (`text-lavender`, `border-lavender`) |
| **Alerte / Dépense** | Saumon Doux | `#F87171` | Dépenses, débit, alertes de dépassement (`text-danger`, `bg-danger`) |
| **Fond Écran** | Blanc Cassé | `#F8FAFC` | Couleur de fond principale (`bg-background`) |
| **Surface Carte** | Blanc Pur | `#FFFFFF` | Cartes, modales, bottom sheets (`bg-card`) |
| **Texte Secondaire**| Gris Ardoise | `#64748B` | Labels, dates, sous-titres, texte estompé (`text-muted-foreground`) |
| **Bordure** | Gris Neutre | `#E2E8F0` | Séparateurs, contours de champs (`border-border`) |

### Objet de tokens pour React Native (`src/theme/colors.ts`) :
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
```


# Directives d'architecture & Qualité du code
## 1. Respect des principes SOLID & Architecture des couches
Tout le code développé doit respecter rigoureusement les principes **SOLID** ainsi que la séparation stricte des responsabilités :
1. **S — Single Responsibility Principle (SRP) / Responsabilité unique** :
   - Chaque fonction, classe, module ou composant UI ne doit avoir qu'une seule responsabilité et une seule raison de changer.
   - Séparer nettement la logique métier, la couche d'accès aux données et le rendu UI (via des hooks, des services dédiés ou des stores applicatifs).
2. **O — Open/Closed Principle (OCP) / Ouvert/Fermé** :
   - Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.
   - Privilégier la composition, les props d'extension et l'injection de dépendances plutôt que de modifier le code existant stabilisé.
3. **L — Liskov Substitution Principle (LSP) / Substitution de Liskov** :
   - Les implémentations d'abstractions doivent pouvoir se substituer à leurs contrats de base sans altérer le comportement attendu.
   - Respecter scrupuleusement les contrats d'interfaces et les signatures de types.
4. **I — Interface Segregation Principle (ISP) / Ségrégation des interfaces** :
   - Concevoir des interfaces et des types ciblés et granulaires plutôt que des contrats volumineux.
   - Ne jamais forcer un composant ou un service à dépendre de propriétés ou de méthodes dont il n'a pas l'utilité.
5. **D — Dependency Inversion Principle (DIP) / Inversion des dépendances** :
   - Dépendre des abstractions plutôt que des implémentations concrètes.
   - Isoler les services externes (APIs, SDKs, stockage) derrière des couches d'abstraction pour faciliter les tests et l'évolutivité.
6. **Séparation stricte Frontend / Backend** :
   - **Découplage UI et Serveur** : interdiction formelle d'exécuter des requêtes base de données directes (SQL, ORM) ou de manipuler des secrets backend au sein des composants visuels.
   - **Couche d'accès aux données (Data Access Layer)** : toute interaction client/serveur doit transiter par des points d'entrée dédiés et typés (services d'API, endpoints REST/GraphQL ou Server Actions agissant comme contrôleurs).
   - **Isolation des contrats** : partager les schémas de validation et les types de données (DTOs / interfaces) sans importer de dépendances serveur dans l'environnement d'exécution client.
---
## 2. Critères ergonomiques & Heuristiques d'utilisabilité (UX/UI)
Toute interface et interaction développée doit intégrer les **10 heuristiques de Nielsen** et les **critères d'ergonomie de Bastien & Scapin** :
1. **Visibilité de l'état du système & Feedback immédiat (Nielsen #1 / Guidage)** :
   - Tout chargement ou traitement asynchrone doit fournir un retour visuel instantané (indicateurs de progression, squelettes, états inactifs, notifications contextuelles).
   - L'utilisateur doit toujours identifier son emplacement, les filtres ou tris actifs, et le volume d'éléments concernés (compteurs).
2. **Contrôle utilisateur & Réversibilité (Nielsen #3 / Contrôle explicite)** :
   - Fournir des échappatoires claires : boutons d'annulation, fermeture des dialogues (croix, clic extérieur, touche `Échap`), réinitialisation aisée des paramètres.
   - Prévoir une confirmation explicite pour toute action destructive ou irréversible.
3. **Prévention et gestion des erreurs (Nielsen #5 & #9 / Protection des erreurs)** :
   - Valider les formulaires en temps réel et contraindre les saisies pour prévenir les anomalies.
   - Rédiger des messages d'erreur clairs, compréhensibles et sans jargon technique brut, en indiquant la solution pour y remédier.
4. **Cohérence & Standards (Nielsen #4 / Homogénéité)** :
   - Maintenir une uniformité absolue : même vocabulaire métier, mêmes conventions de placement d'actions et mêmes pictogrammes pour une fonction identique.
5. **Réduction de la charge cognitive (Nielsen #6 & #8 / Charge de travail)** :
   - Favoriser la reconnaissance visuelle immédiate plutôt que la mémorisation d'un écran à l'autre.
   - Hiérarchiser l'information pour éviter l'encombrement visuel (organisation par onglets, panneaux dépliables ou modales contextuelles).
6. **Flexibilité & Accessibilité (Nielsen #7 / Adaptabilité)** :
   - Prévoir des raccourcis et actions rapides pour les profils fréquents (recherche directe, filtres rapides).
   - Garantir une navigation complète au clavier et des contrastes conformes aux standards d'accessibilité (WCAG).
---
## 3. Règles de génération des messages de commit Git
Toute proposition de commit doit respecter les standards **Conventional Commits** :
1. **Format attendu** :
   - Structure : `<type>(<scope>): <description courte au présent>`
   - Types admis :
     - `feat` : Ajout d'une nouvelle fonctionnalité.
     - `fix` : Correction d'une anomalie ou d'un bogue.
     - `refactor` : Restructuration sans altération du comportement fonctionnel (ex. : refonte SOLID, isolation de couches).
     - `style` : Ajustements purement visuels, polices, couleurs, espacements.
     - `perf` : Optimisation des performances ou du temps de rendu.
     - `docs` : Modification de la documentation ou des directives de développement.
     - `chore` : Maintenance technique, mise à jour des dépendances, outillage CI/CD.
2. **Détermination du `<scope>`** :
   - Le périmètre doit être déduit fidèlement des fichiers modifiés :
     - Vue applicative / composant client $\rightarrow$ nom du module UI (ex. : `auth-ui`, `billing`, `dashboard`).
     - Service métier, contrôleur, API ou base de données $\rightarrow$ `api`, `db`, nom du domaine backend (ex. : `users-service`, `orders-api`).
     - Logique transverse, directives ou configuration $\rightarrow$ `core`, `config`, `rules`.
3. **Exhaustivité du message** :
   - Proscrire les descriptions floues (*"update"*, *"fix bug"*).
   - Détailler dans le corps du message (liste à puces) :
     - Les ajouts, modifications ou suppressions majeures.
     - L'impact technique ou ergonomique de la modification.
4. **Exemple de référence** :
```text
feat(billing): ajout du récapitulatif de commande et fiabilisation des formulaires
- Découplage du formulaire de paiement via un service dédié (billing-service)
- Ajout de la validation instantanée sur les champs de carte bancaire
- Intégration d'un indicateur de chargement sur le bouton de validation
- Prise en charge de la fermeture du volet récapitulatif via la touche Échap