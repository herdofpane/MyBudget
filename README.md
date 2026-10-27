# FinTrack (MyBudget) 💳📊

> Application universelle (iOS, Android, Web) de gestion budgétaire personnelle, simulation financière en temps réel et suivi intelligent des dépenses.

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![React 19](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/Tailwind_CSS-NativeWind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)
[![GitHub Pages](https://img.shields.io/badge/Déployé_sur-GitHub_Pages-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://herdofpane.github.io/MyBudget/)

---

## 🌐 Démo en Ligne

L'application est accessible directement dans votre navigateur grâce au déploiement statique GitHub Pages :  
👉 **[Tester FinTrack en direct : herdofpane.github.io/MyBudget](https://herdofpane.github.io/MyBudget/)**

---

## 📖 Présentation du Projet

**FinTrack** est conçue pour offrir une maîtrise financière limpide, proactive et agréable. Inspirée des standards visuels des meilleures néobanques et applications fintech contemporaines, elle allie une interface épurée à un bandeau bleu nuit signature unifié sur tous les écrans et un moteur de calcul budgétaire rigoureux.

Toutes les données sont stockées **localement et de façon sécurisée** sur votre appareil (aucun compte obligatoire, zéro transmission de données personnelles à des serveurs tiers).

---

## ✨ Fonctionnalités Clés

### 1. 🏠 Tableau de Bord Accueil (FinTrack) — Design Apple Human Interface Guidelines (HIG)
- **Ergonomie Apple HIG & Navigation Bar** : En-tête bleu nuit signature intégrant une barre de navigation fluide, des boutons d'actions circulaires translucides (cibles tactiles conformes au standard Apple 44pt minimum) et typographie San Francisco-like claire et hiérarchisée.
- **Sélecteur Temporel Segmenté façon iOS** : Stepper mensuel interactif avec boutons de navigation ergonomiques, badge prévisionnel `M+X` en capsule et retour instantané au mois en cours.
- **Carte Héro Reste à Vivre (Style Apple Card / Apple Wallet)** :
  - Solde principal en typographie héroïque aérée avec équivalent arrondi en sous-titre.
  - Jauge de répartition budgétaire segmentée inspirée d'Apple Health / Fitness avec segments arrondis continus (`Fixes`, `Épargne`, `Vie courante`).
  - Actions rapides façon *Apple Tinted Buttons* d'au moins 44pt de hauteur avec chevrons directionnels subtils.
- **Duo de Comptes (Courant & Épargne)** : Deux cartes interactives au style Inset Grouped d'Apple avec micro-indicateurs chromatiques, soldes nets et flèches de navigation.
- **Saisie du Revenu Net (Formulaire Inset Grouped iOS)** : Ligne de réglage avec icône dans un squircle, label descriptif et champ de saisie direct fluide avec focus ring soigné.
- **Double Affichage Monétaire & Arrondi à l'Unité** : Chaque indicateur affiche son montant exact et son estimation arrondie à l'unité (`≈ X €`) pour un confort cognitif maximal.
- **Mode Discrétion (Privacy Mode)** : Masquage en un tap de tous les montants monétaires (`•••• €`) avec retour haptique/visuel instantané.
- **Raccourcis Intelligents** : Navigation sans latence vers les charges fixes, variables et le simulateur approfondi.

### 2. 📅 Échéancier des Charges Fixes & Crédits — Design Apple Human Interface Guidelines (HIG)
- **Tableau Inset Grouped & Squircle Icons** : Liste structurée selon les conventions des tableaux iOS, avec icônes de catégories en squircles colorés doux, micro-badges d'état en capsules pills et typographie San Francisco-like claire et hiérarchisée.
- **Ergonomie & Cibles Tactiles (44pt Apple HIG)** : Tous les boutons interactifs (actions de charge, boutons fléchés, raccourcis et contrôles modaux) respectent strictement la norme ergonomique Apple avec des cibles tactiles confortables de 44x44 points.
- **Feuille Modale de Saisie (Form Sheet iOS)** : Formulaire épuré avec commutateurs à bascule façon iOS Switches, boutons de durées en capsules, détection 100% automatique de l'icône/catégorie dès la frappe et panneau d'aperçu d'échéance instantané.
- **Sélecteur Temporel Segmenté (M+1 à M+12)** : Stepper pas à pas interactif avec navigation tactile fluide, rouleau de capsules de mois rapides (+0m, +1m, +2m, +3m, +6m, +12m) et bannière prévisionnelle d'impact financier.
- **Carte Métrique Groupée de Synthèse** : Affichage héroïque du montant arrondi et exact, bannières d'information feutrées pour les crédits soldés ou charges différées, et volet statistique épuré (moyenne par charge, ratio d'endettement).
- **Détection Automatique Intelligente** : À la création comme en modification, la catégorie et l'icône sont déduites immédiatement sans sélection manuelle superflue.
- **Planification Temporelle & Gestion des Emprunts** : Suivi précis des mensualités d'emprunts avec barre de progression continue et gestion fine des charges perpétuelles, différées ou ponctuelles.
- **Initialisation Vierge** : Démarrage propre avec un carnet vierge de charges par défaut (zéro donnée fictive pré-remplie).

### 3. 🛒 Charges Variables & Lissage Pluriannuel — Design Apple Human Interface Guidelines (HIG)
- **Tableau Inset Grouped & Squircle Icons** : Liste de dépenses structurée selon les standards iOS, avec icônes en squircles teintés doux (`rounded-2xl`), badges de durée de lissage en capsules pills et typographie San Francisco-like percutante.
- **Ergonomie & Cibles Tactiles (44pt Apple HIG)** : Boutons d'édition et de suppression circulaires feutrés avec feedback tactile fluide et zone de contact minimale garantie de 44x44 points (`hitSlop`).
- **Feuille Modale de Saisie (Form Sheet iOS)** : Formulaire épuré avec détection 100% automatique de l'icône et de la teinte dès la frappe, sélection rapide de durée en capsules horizontales (+1m, +3m, +6m, +12m, +24m) et bannière de prévisualisation instantanée de l'impact mensuel lissé.
- **Carte Métrique Groupée de Synthèse** : Affichage héroïque du montant mensuel lissé avec badge capsule ambre, équivalence exacte au centime près et volet statistique épuré (moyenne mensuelle, part des revenus).
- **Lissage Temporel des Dépenses Importantes** : Possibilité d'étaler un achat ou un poste sur plusieurs mois (*1, 3, 6, 12 ou 24 mois*) pour neutraliser son impact mensuel sans déséquilibrer un mois isolé.
- **Initialisation Vierge** : Démarrage propre sans données factices.

### 4. Simulateur Budgétaire & Ventilation Mathématique — Design Apple Human Interface Guidelines (HIG)
- **Contrôle Segmenté iOS (Segmented Control)** : Bascule fluide en capsule entre *Répartition Mensuelle* et *Revenu Ponctuel*, avec typographie San Francisco, ombre douce et cibles tactiles de 44 pt garanties (`hitSlop`).
- **Cartes de Synthèse Inset Grouped** :
  - **Duo de Piliers Principaux** : Présentation en cartes étagées du *Compte Courant* (dépenses de vie courante) et de l'*Épargne conseillée* avec badges capsules distinctifs, montants héroïques, équivalents arrondis et pourcentages d'attribution sur le revenu global.
  - **Cellule Seuil Nécessaire** : Ligne Inset Grouped stylisée avec squircle d'icône ambre, montant exact et arrondi au centime près.
- **Bandeaux Pédagogiques Mathématiques (Apple Callouts)** :
  - Explicitation formelle et décomposition numérique en temps réel du calcul du Compte Courant : $\text{Reste à vivre} - \text{Épargne} = \sqrt{\text{ResteÀVivre} \times \text{Nécessaire}}$.
  - Formule d'épargne progressive avec substitution dynamique des variables : $\text{ResteÀVivre} - \sqrt{\text{ResteÀVivre} \times \text{Nécessaire}}$.
- **Panneau de Réglages Inset Grouped & Cibles Ergonomiques (44 pt)** :
  - Lignes de consultation et de redirection rapide pour le revenu net mensuel et les charges fixes avec boutons de redirection pills.
  - Champ de saisie feutré avec indicateur d'état dynamique (*Par défaut (Charges variables)* ou *Personnalisé*) et bouton de réinitialisation rapide au seuil des charges variables.
  - Grand bouton d'action principal Apple pour appliquer et enregistrer le budget officiel.
- **Cellules de Navigation Inférieure** : Liens rapides vers *Gérer mes charges fixes* et *Gérer mes charges variables* au format Inset Grouped Cell avec squircles et chevron de divulgation iOS standard.
- **Synchronisation Directe avec le Réel** :
  - Le **revenu mensuel** provient directement de la saisie instantanée sur l'écran d'accueil (`income`, **0 € par défaut**).
  - Le **total des charges fixes** provient directement de la somme réelle des charges fixes actives de votre échéancier (`totalFixedExpenses`).
  - Le **Total Nécessaire (Seuil de survie)** est **égal par défaut au montant total de vos charges variables** (`totalEstimatedVariable`), assurant une adéquation automatique et logique entre vos enveloppes réelles et vos paramètres de simulation, tout en restant librement modifiable si besoin.
- **Double Lecture Exacte & Arrondie** : Les piliers Compte Courant, Épargne et Total Nécessaire présentent simultanément leurs valeurs exactes et arrondies.
- **Double Mode de Calcul** :
  - **Mode Mensuel Récurrent** : Simulation sur la base du salaire régulier, des charges fixes réelles et des charges variables.
  - **Mode Revenu Ponctuel (Extra)** : Ventilation d'une prime, d'un bonus ou d'une rentrée d'argent exceptionnelle (initialisé à **0 € par défaut**).
- **Ventilation du Nécessaire (Seuil de survie)** :
  - *Courses & Entretien* : **49%**
  - *Transports (Essence/Titres)* : **37%**
  - *Hygiène & Santé* : **14%**
- **Ventilation du Facultatif (Budget Plaisir)** :
  - *Activités, Loisirs & Culture* : **37%**
  - *Restaurants & Cafés* : **26%**
  - *Habillement* : **21%**
  - *Divers & Imprévus* : **16%**
- **Bac à Sable Interactif** : Testez des ajustements de revenus et de charges sans altérer vos données officielles tant que vous ne confirmez pas via *Appliquer comme budget officiel*.

---

## 🏛️ Architecture & Qualité du Code

L'application respecte rigoureusement les principes **SOLID** et les heuristiques d'ergonomie et d'utilisabilité (**Bastien & Scapin**, **10 heuristiques de Nielsen**) :

```text
MyBudget/
├── .agents/skills/          # Skills projet modulaires (expo, architecture, hig-ux, math, storage, sync)
├── .githooks/               # Hooks Git automatisés (déploiement automatique pre-push)
├── AGENTS.md                # Orchestrateur central des skills, directives d'architecture et cycle de vie
├── assets/                  # Icônes adaptatives, images et splash screens
├── scripts/                 # Scripts utilitaires (audit qualité déterministe, patchs interop, build web)
└── src/
    ├── app/                 # Routes Expo Router (file-based routing)
    │   ├── _layout.tsx      # Navigation principale par onglets (Dock flottant)
    │   ├── index.tsx        # Écran Tableau de bord (Accueil)
    │   ├── fixed-expenses.tsx # Écran Charges fixes & crédits
    │   ├── variable-expenses.tsx # Écran Charges variables & lissage
    │   └── details.tsx      # Écran Simulateur & détail des ventilations
    ├── components/          # Composants UI modulaires et réutilisables
    │   ├── ui/              # Composants atomiques (Card, Button, Badge, Input, Skeletons)
    │   ├── home/            # Composants dédiés à l'accueil (Hero Reste à Vivre, Comptes, Revenu, Raccourcis)
    │   ├── fixed-expenses/  # Composants charges fixes (Modal, Stats, Ligne de charge)
    │   ├── variable-expenses/ # Composants charges variables (Modal, Stats, Jauges)
    │   ├── details/         # Composants simulateur (Onglets, Bilan de synthèse, Contrôles)
    │   ├── confirm-dialog.tsx # Dialogues de confirmation et alertes accessibles
    │   └── navigation-header.tsx # En-têtes standardisés
    ├── constants/           # Règles métiers pures (formules, ratios, formatters monétaires)
    ├── data/                # Données initiales, préréglages de catégories et icônes
    ├── hooks/               # Logique applicative découplée de la vue (Custom Hooks)
    │   ├── use-budget.tsx   # Contexte global et persistance d'état
    │   ├── use-home-summary.ts
    │   ├── use-fixed-expenses.ts
    │   ├── use-variable-expenses.ts
    │   ├── use-details-simulation.ts
    │   ├── use-simulation-month.ts  # Stepper temporel et presets M+0..M+12
    │   ├── use-expense-form.ts      # Gestion des formulaires modaux & détection sémantique
    │   ├── use-privacy-mode.ts      # Mode discrétion global persisté
    │   ├── use-haptics.ts           # Retours sensoriels haptiques Apple HIG
    │   ├── use-budget-health.ts     # Score et diagnostic financier neobanque
    │   ├── use-budget-backup.ts     # Import/Export JSON et restauration défensive
    │   └── index.ts                 # Baril d'export unifié des hooks
    ├── services/            # Couche d'accès aux données (AsyncStorage Service)
    ├── theme/               # Charte graphique unifiée (palette de couleurs fintech)
    ├── types/               # Définitions des contrats TypeScript
    └── utils/               # Fonctions utilitaires pures
        ├── auto-icon.ts     # Moteur sémantique de détection d'icônes, catégories & couleurs
        ├── fixed-expenses.ts# Calculs des échéanciers et statuts de crédit
        ├── credit.ts        # Logique mathématique des durées d'emprunts
        └── index.ts         # Point d'entrée des utilitaires
```

- **S (Single Responsibility)** : Chaque composant UI se concentre sur l'affichage ; toute la logique métier réside dans des hooks dédiés.
- **D (Dependency Inversion)** : La persistance locale est isolée dans un service de stockage (`budget-storage.service.ts`), garantissant un découplage total avec la vue.
- **Guidage & Visibilité** : Indicateurs de chargement squelettes (*HomeSkeleton*, *ListSkeleton*, *DetailsSkeleton*), confirmations réversibles sur chaque suppression, retours visuels immédiats.

---

## 🛠️ Stack Technologique

| Domaine | Technologie | Description |
| :--- | :--- | :--- |
| **Framework Mobile/Web** | [Expo (SDK 57)](https://expo.dev/) | Managed Workflow moderne avec Continuous Native Generation |
| **Moteur Runtime** | [React Native 0.86](https://reactnative.dev/) | Exécution native haute performance et React Native Web |
| **Bibliothèque UI** | [React 19](https://react.dev/) | React Compiler activé pour des mémorisations automatisées |
| **Routage** | [Expo Router v57](https://docs.expo.dev/router/introduction/) | Navigation déclarative basée sur les fichiers avec routes typées |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) / Tailwind | Classes utilitaires universelles compatibles mobile & web |
| **Composants Primitifs** | [@rn-primitives](https://rnprimitives.com/) | Portails et primitives d'accessibilité |
| **Icônes & Visuels** | Ionicons, LinearGradient, SVG | Design fintech avec nuances sombres et accents émeraude |
| **Persistance** | AsyncStorage | Stockage clé-valeur persistant hors-ligne |
| **Déploiement Web** | [gh-pages](https://www.npmjs.com/package/gh-pages) | Export statique optimisé pour GitHub Pages |

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)
- Application mobile **Expo Go** (sur [iOS](https://apps.apple.com/app/expo-go/id982107779) ou [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) pour tester sur appareil physique

### 1. Cloner le dépôt
```bash
git clone https://github.com/herdofpane/MyBudget.git
cd MyBudget
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer le serveur de développement
```bash
npx expo start
```

Dans le terminal interactif :
- Appuyez sur `w` pour ouvrir directement la version **Web** dans votre navigateur.
- Appuyez sur `a` pour ouvrir sur un émulateur **Android**.
- Appuyez sur `i` pour ouvrir sur le simulateur **iOS**.
- Ou **scannez le QR code** avec l'application Expo Go sur votre smartphone.

---

## 📜 Commandes Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run start` ou `npx expo start` | Démarre le serveur de développement Metro Bundler |
| `npm run web` | Démarre l'application directement ciblée sur le Web |
| `npm run android` | Lance l'application sur un terminal/émulateur Android |
| `npm run ios` | Lance l'application sur le simulateur iOS |
| `npm run lint` | Lance la vérification ESLint du code |
| `npm run audit -- <fichier>` | Lance l'audit architectural déterministe (plafonds LOC, strict typing, SOLID) |
| `npm run predeploy` | Exporte le bundle web statique optimisé dans le dossier `dist/` |
| `npm run deploy` | Déploie automatiquement la version web sur la branche `gh-pages` |

---

## 🚢 Déploiement Web (GitHub Pages)

Le projet est configuré pour être compilé en mode statique avec un `baseUrl` adapté pour GitHub Pages (`/MyBudget`).

### Déploiement Automatique via le Terminal (Git Hook pre-push)
Un hook Git (`.githooks/pre-push`) est configuré dans le projet. À chaque fois que vous exécutez `git push` sur la branche `main` depuis votre terminal :
1. Git intercepte le push et lance automatiquement `npm run deploy` en arrière-plan.
2. Le bundle est compilé, préparé (`.nojekyll`, fallback `404.html`) et publié sur la branche `gh-pages`.
3. Une fois la publication sur `gh-pages` terminée, votre code est poussé sur GitHub sans aucune action supplémentaire.

### Déploiement Manuel (Optionnel)
Vous pouvez également déclencher un déploiement ponctuel en local sur la branche `gh-pages` :
```bash
npm run deploy
```
La commande compile le bundle statique via `npm run predeploy` puis pousse le contenu du dossier `dist/` sur la branche `gh-pages`.

---

## 🤝 Contribution & Standards de Commits

Les contributions doivent respecter la norme **Conventional Commits** :

```text
<type>(<scope>): <courte description au présent>

- Détail des modifications techniques ou ergonomiques
- Éléments impactés
```

Types acceptés : `feat`, `fix`, `refactor`, `style`, `perf`, `docs`, `chore`.  
Exemple :
```bash
git commit -m "docs(readme): mise à jour complète de la documentation du projet"
```

> **Documentation continue** : Toute évolution fonctionnelle, technique ou structurelle doit s'accompagner **automatiquement** de la mise à jour du fichier `README.md` (badges, fonctionnalités, arborescence et commandes) afin de garantir une documentation vivante et toujours synchrone avec le code.
>
> **Protocole Agent & Commits** : Le workflow complet de validation, les portes qualité préalables et le cycle de déploiement sont détaillés dans la compétence dédiée [`.agents/skills/git-commit/SKILL.md`](.agents/skills/git-commit/SKILL.md).

---

## 📄 Licence & Crédits

Conçu et développé avec passion par **[herdofpane](https://github.com/herdofpane)**.  
Développé avec la suite technologique [Expo](https://expo.dev/) et [React Native](https://reactnative.dev/).
