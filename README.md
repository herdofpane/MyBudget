# FinTrack by Klyro (MyBudget) 💳📊

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

**FinTrack by Klyro** est conçue pour offrir une maîtrise financière limpide, proactive et sans stress. Inspirée des standards visuels des meilleures néobanques et applications fintech contemporaines, elle allie une interface épurée à un moteur de calcul budgétaire rigoureux.

Toutes les données sont stockées **localement et de façon sécurisée** sur votre appareil (aucun compte obligatoire, zéro transmission de données personnelles à des serveurs tiers).

---

## ✨ Fonctionnalités Clés

### 1. 🏠 Tableau de Bord Accueil (FinTrack)
- **Sélecteur Temporel & Simulation Dynamique de l'Accueil (M+1 à M+12)** : Intégration en tête d'accueil du simulateur mensuel interactif permettant d'anticiper en temps réel votre budget futur (navigation pas à pas `<` / `>` et raccourcis rapides `Ce mois`, `+1m`, `+2m`, `+3m`, `+6m`, `+12m`).
- **Recalcul Dynamique des Piliers Budgétaires** :
  - **Reste à vivre projeté** : Recalculé selon les charges fixes réelles du mois futur (crédits amortis déduits, charges futures programmées prises en compte).
  - **Duo de Comptes Prévisionnel** : Ajustement automatique en direct du **Compte Courant** et du **Compte Épargne Klyro** (dérivé de la formule mathématique racine carrée).
  - **Raccourci Charges Fixes** : Affiche le montant projeté des charges avec un badge `Simulé`.
- **Encart d'Impact du Pouvoir d'Achat** : Visualisation immédiate du gain en reste à vivre (`+X € de reste à vivre en plus` grâce aux crédits qui arrivent à échéance).
- **Synchronisation Globale Accueil ↔ Charges Fixes** : Le mois sélectionné est partagé dans le contexte applicatif : choisir un mois futur sur l'accueil synchronise instantanément la vue des charges fixes (et inversement).
- **Carte Héro Reste à Vivre** : Visualisation centrale et immédiate de votre reste à vivre avec badge `M+X` en mode simulation, et raccourcis directs vers la simulation approfondie et l'échéancier.
- **Double Affichage Monétaire & Arrondi à l'Unité** : Chaque indicateur clé (Reste à vivre, Compte courant, Épargne, Charges fixes) affiche simultanément son montant exact au centime près et son estimation arrondie à l'unité (`≈ X €`) pour une clarté visuelle et cognitive maximale.
- **Mode Discrétion (Privacy Mode)** : Masquage en un clic de tous les montants monétaires (`•••• €`) pour consulter son solde en toute sérénité dans les lieux publics.
- **Édition Instantanée du Revenu** : Ajustez votre revenu net mensuel directement depuis la carte dédiée avec sauvegarde automatique et fluide (initialisé à **0 € par défaut**, sans données fictives).
- **Raccourcis Intelligents** : Navigation instantanée d'un tap vers les charges fixes, variables et le simulateur complet.

### 2. 📅 Échéancier des Charges Fixes & Amortissement de Crédits
- **Détection Automatique Intelligente** : À la création comme en modification, la catégorie et l'icône sont déduites à 100% automatiquement dès la frappe du nom (*Loyer, EDF, Netflix, Navigo, Prêt...*), garantissant une saisie rapide et fluide sans sélection manuelle superflue.
- **Typologie Complète** : Ventilation par catégories dédiées (*Logement, Énergie, Assurance, Abonnements, Transport, Crédit, Autre*).
- **Gestion des Crédits et Emprunts** : Suivi des charges temporaires avec calcul de progression (mensualités honorées vs durée totale, barre de progression visuelle, activation automatique lors de la saisie de mots-clés d'emprunt).
- **Planification Temporelle Avancée** :
  - *Tous les mois* : prélèvements récurrents perpétuels.
  - *À partir d'un mois donné* : charges démarrant dans le futur.
  - *Uniquement ce mois* : charges ponctuelles associées à une échéance unique.
- **Pointage des Prélèvements** : Marquage en un tap du statut prélevé / en attente.
- **Ratio d'Endettement Fixe** : Calcul automatique du pourcentage du revenu absorbé par les charges incompressibles.
- **Simulation Temporelle Dynamique (M+1 à M+12)** : Sélecteur de mois interactif permettant d'anticiper en temps réel l'évolution de ses charges fixes sur les 12 prochains mois (recalcul immédiat des totaux, mise à jour des mensualités restantes, détection des crédits soldés et activation des charges différées).
- **Double Affichage Statistique** : Synthèse affichant le total arrondi à l'unité et le montant exact correspondant.
- **Initialisation Vierge** : Démarrage propre avec un carnet vierge de charges par défaut (zéro donnée fictive pré-remplie).

### 3. 🛒 Charges Variables & Lissage Pluriannuel
- **Attribution Automatique d'Icône & Teinte** : Dès la saisie du titre (*Courses, Restaurant, Vacances, Basic Fit, Essence...*), l'icône thématique et la couleur harmonieuse sont instantanément attribuées de façon 100% automatique, à la création comme en modification.
- **Enveloppes Budgétaires Visuelles** : Gestion fine par postes de dépenses.
- **Lissage Temporel des Dépenses Importantes** : Possibilité d'étaler un achat ou un poste sur plusieurs mois (*1, 3, 6, 12 ou 24 mois*) pour neutraliser son impact mensuel sans déséquilibrer un mois isolé.
- **Suivi Budgété vs Dépensé** : Jauges de consommation en temps réel avec alertes de dépassement.
- **Initialisation Vierge** : Démarrage propre sans données factices.

### 4. 🧮 Simulateur Budgétaire & Ventilation Mathématique (Calcul & Détail)
- **Synchronisation Directe avec le Réel** :
  - Le **revenu mensuel** provient directement de la saisie instantanée sur l'écran d'accueil (`income`, **0 € par défaut**).
  - Le **total des charges fixes** provient directement de la somme réelle des charges fixes actives de votre échéancier (`totalFixedExpenses`).
  - Le **Total Nécessaire (Seuil de survie)** est **égal par défaut au montant total de vos charges variables** (`totalEstimatedVariable`), assurant une adéquation automatique et logique entre vos enveloppes réelles et vos paramètres de simulation, tout en restant librement modifiable si besoin.
- **Double Lecture Exacte & Arrondie** : Les piliers Compte Courant, Épargne et Total Nécessaire présentent simultanément leurs valeurs exactes et arrondies.
- **Indicateurs d'État & Réversibilité (Nielsen)** :
  - Badge dynamique précisant l'état du seuil : *« Par défaut (Charges variables) »* ou *« Personnalisé »*.
  - Bouton d'action rapide permettant de rétablir le seuil exact des charges variables en un seul tap.
  - Liens rapides d'accès direct vers *Gérer mes charges fixes* et *Gérer mes charges variables* avec affichage de leurs totaux respectifs.
- **Double Mode de Calcul** :
  - **Mode Mensuel Récurrent** : Simulation sur la base du salaire régulier, des charges fixes réelles et des charges variables.
  - **Mode Revenu Ponctuel (Extra)** : Ventilation d'une prime, d'un bonus ou d'une rentrée d'argent exceptionnelle (initialisé à **0 € par défaut**).
- **Ventilation du Nécessaire (Seuil de survie)** :
  - 🛒 *Courses & Entretien* : **49%**
  - 🚗 *Transports (Essence/Titres)* : **37%**
  - 💊 *Hygiène & Santé* : **14%**
- **Ventilation du Facultatif (Budget Plaisir)** :
  - 🎟️ *Activités, Loisirs & Culture* : **37%**
  - ☕ *Restaurants & Cafés* : **26%**
  - 👗 *Habillement* : **21%**
  - ✨ *Divers & Imprévus* : **16%**
- **Algorithme d'Épargne Progressive** :  
  Formule mathématique exacte dérivée du modèle financier :
  $$\text{Épargne} = \max\left(0,\, \text{ResteÀVivre} - \sqrt{\text{ResteÀVivre} \times \text{Nécessaire}}\right)$$
- **Bac à Sable Interactif** : Testez des ajustements de revenus et de charges sans altérer vos données officielles tant que vous ne confirmez pas via *Appliquer comme budget officiel*.

---

## 🏛️ Architecture & Qualité du Code

L'application respecte rigoureusement les principes **SOLID** et les heuristiques d'ergonomie et d'utilisabilité (**Bastien & Scapin**, **10 heuristiques de Nielsen**) :

```text
MyBudget/
├── .githooks/               # Hooks Git automatisés (déploiement automatique pre-push)
├── AGENTS.md                # Directives d'architecture, qualité et règles de développement
├── assets/                  # Icônes adaptatives, images et splash screens
├── scripts/                 # Scripts utilitaires (patchs interop, préparation build web)
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
    │   └── use-details-simulation.ts
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

---

## 📄 Licence & Crédits

Conçu et développé avec passion par **[herdofpane](https://github.com/herdofpane)**.  
Développé avec la suite technologique [Expo](https://expo.dev/) et [React Native](https://reactnative.dev/).
