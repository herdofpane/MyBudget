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
## Respect des principes SOLID
Tout le code développé doit respecter rigoureusement les principes **SOLID** :
1. **S - Single Responsibility Principle (SRP) / Responsabilité unique** :
   - Chaque fonction, classe, module ou composant React ne doit avoir qu'une seule responsabilité et une seule raison de changer.
   - Séparer clairement la logique métier, l'accès aux données et le rendu UI (ex: via des custom hooks, des services dédiés, et des composants focalisés).
2. **O - Open/Closed Principle (OCP) / Ouvert/Fermé** :
   - Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.
   - Préférer la composition, les props polymorphes et l'extensibilité plutôt que de modifier sans cesse des composants ou fonctions existants.
3. **L - Liskov Substitution Principle (LSP) / Substitution de Liskov** :
   - Les sous-classes ou implémentations d'abstractions doivent pouvoir se substituer à leurs types de base sans altérer le comportement attendu.
   - Respecter scrupuleusement les contrats d'interfaces et les signatures de types.
4. **I - Interface Segregation Principle (ISP) / Ségrégation des interfaces** :
   - Concevoir des interfaces et des types TypeScript ciblés et granulaires plutôt que des contrats volumineux.
   - Ne pas forcer un composant ou un service à dépendre de propriétés ou méthodes dont il n'a pas besoin.
5. **D - Dependency Inversion Principle (DIP) / Inversion des dépendances** :
   - Dépendre des abstractions (interfaces / types) plutôt que des implémentations concrètes.
   - Isoler les services externes (APIs, SDKs, stockage) derrière des couches d'abstraction pour faciliter les tests et l'évolutivité.
## Respect des Critères Ergonomiques & Heuristiques d'Utilisabilité (UX/UI)
Toute interface et interaction développée doit intégrer rigoureusement les **heuristiques d'utilisabilité de Nielsen** et les **critères ergonomiques de Bastien & Scapin** :
1. **Visibilité de l'état du système & Feedback immédiat (Nielsen #1 / Guidage & Incitation)** :
   - Tout traitement, chargement ou action asynchrone doit fournir un retour visuel instantané (indicateurs de chargement `Loader2`, états `disabled`, UI optimiste, notifications toast contextuelles via `sonner`).
   - L'utilisateur doit toujours savoir où il se trouve, quels filtres ou tris sont actifs, et le volume d'éléments concernés (compteurs dynamiques).
2. **Contrôle utilisateur, Liberté & Réversibilité (Nielsen #3 / Contrôle explicite)** :
   - Offrir systématiquement des échappatoires claires : boutons d'annulation, fermeture des dialogues (croix, clic extérieur, touche `Échap`), et possibilité de réinitialiser filtres et tris d'un seul clic.
   - Prévoir des mécanismes de confirmation pour toute action destructive ou critique (suppression, modification irréversible de statut).
3. **Prévention et gestion bienveillante des erreurs (Nielsen #5 & #9 / Protection & Correction des erreurs)** :
   - Prévenir les erreurs en amont par des validations de formulaires en temps réel, des contraintes de saisie appropriées et la désactivation préventive des actions non valides.
   - Présenter des messages d'erreur clairs, courtois, précis et formulés en langage naturel (sans codes d'erreur bruts ni jargon technique), proposant systématiquement une action corrective immédiate.
4. **Cohérence, Homogénéité & Standards (Nielsen #4 / Homogénéité & Cohérence)** :
   - Conserver une cohérence totale dans toute l'application : même terminologie métier, mêmes conventions de placement (ex: boutons d'action principale, filtres en haut de page), mêmes icônes pour une même action, et respect scrupuleux du Design System Wobjok.
5. **Réduction de la charge cognitive & Reconnaissance plutôt que rappel (Nielsen #6 & #8 / Allègement de la charge de travail)** :
   - Rendre les informations et actions clés directement visibles et identifiables (icônes parlantes, libellés explicites, badges d'état colorés).
   - Éviter la surcharge informationnelle : organiser les données par paliers (tableaux épurés avec détails dépliables ou modales dédiées) plutôt que d'encombrer la vue principale.
6. **Flexibilité & Efficience d'utilisation (Nielsen #7 / Adaptabilité & Flexibilité)** :
   - Proposer des interactions accélérées pour les utilisateurs fréquents : filtres rapides en un clic (ex: barre des étapes d'atelier), recherche textuelle instantanée, tris combinés et raccourcis.
   - Veiller à une navigation fluide au clavier et à un contraste visuel optimal répondant aux normes d'accessibilité WCAG.
## Règles de Génération des Messages de Commit Git
Toute proposition ou génération de message de commit doit respecter scrupuleusement les standards suivants pour assurer une traçabilité précise et refléter fidèlement la réalité des modifications :
1. **Format Conventionnel Strict (Conventional Commits)** :
   - Utiliser la structure : `<type>(<scope>): <description courte et explicite au présent>`
   - Types autorisés :
     - `feat` : Ajout d'une nouvelle fonctionnalité ou évolution métier.
     - `fix` : Correction d'un bug, d'une erreur d'affichage ou d'un comportement inattendu.
     - `refactor` : Restructuration du code sans altération des fonctionnalités existantes (ex: respect SOLID).
     - `style` : Modifications liées au Design System Wobjok, polices, couleurs ou classes Tailwind.
     - `perf` : Optimisation du rendu, de requêtes ou de fluidité.
     - `docs` : Mise à jour de la documentation, de `AGENTS.md` ou de commentaires clés.
     - `chore` : Tâches de maintenance, dépendances ou configuration système.
   - Le `<scope>` doit cibler le domaine exact modifié (ex: `tableur`, `planning`, `bat`, `clients`, `design-system`).
2. **Fidélité & Exhaustivité des changements apportés** :
   - **Interdiction formelle des messages vagues ou génériques** (ex: *"fix bug"*, *"update code"*, *"wip"*).
   - Détailler systématiquement dans le corps du message (liste à puces) :
     - Les modifications clés apportées aux composants et actions.
     - Les éléments ajoutés, refactorisés ou explicitement supprimés.
     - Le motif ou l'impact fonctionnel (ex: correction ergonomique, prévention d'erreur, amélioration UX).
3. **Exemple de structure attendue** :
```text
feat(tableur): simplification du filtrage atelier et renforcement ergonomique
- Suppression du menu déroulant de tri redondant dans la barre d'outils
- Filtrage direct via les boutons des 6 étapes d'atelier (Prépa, Impr, Lam, Déc, Éch, Tape)
- Ajout de la fermeture des modales au clavier (Échap) et au clic sur l'arrière-plan
- Amélioration de l'état vide avec bouton de réinitialisation complète des filtres
```
