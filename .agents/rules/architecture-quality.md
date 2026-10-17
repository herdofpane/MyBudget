---
trigger: always_on
---

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
   - Tout traitement, chargement ou action asynchrone doit fournir un retour visuel instantané (indicateurs de chargement, états `disabled`, UI optimiste, notifications toast contextuelles).
   - L'utilisateur doit toujours savoir où il se trouve, quels filtres ou tris sont actifs, et le volume d'éléments concernés (compteurs dynamiques).

2. **Contrôle utilisateur, Liberté & Réversibilité (Nielsen #3 / Contrôle explicite)** :
   - Offrir systématiquement des échappatoires claires : boutons d'annulation, fermeture des dialogues (croix, clic extérieur, touche `Échap`), et possibilité de réinitialiser filtres et tris d'un seul clic.
   - Prévoir des mécanismes de confirmation pour toute action destructive ou critique (suppression, modification irréversible de statut).

3. **Prévention et gestion bienveillante des erreurs (Nielsen #5 & #9 / Protection & Correction des erreurs)** :
   - Prévenir les erreurs en amont par des validations de formulaires en temps réel, des contraintes de saisie appropriées et la désactivation préventive des actions non valides.
   - Présenter des messages d'erreur clairs, courtois, précis et formulés en langage naturel (sans codes d'erreur bruts ni jargon technique), proposant systématiquement une action corrective immédiate.

4. **Cohérence, Homogénéité & Standards (Nielsen #4 / Homogénéité & Cohérence)** :
   - Conserver une cohérence totale dans toute l'application : même terminologie métier, mêmes conventions de placement (ex: boutons d'action principale, filtres en haut de page), mêmes icônes pour une même action, et respect scrupuleux du Design System.

5. **Réduction de la charge cognitive & Reconnaissance plutôt que rappel (Nielsen #6 & #8 / Allègement de la charge de travail)** :
   - Rendre les informations et actions clés directement visibles et identifiables (icônes parlantes, libellés explicites, badges d'état colorés).
   - Éviter la surcharge informationnelle : organiser les données par paliers (tableaux épurés avec détails dépliables ou modales dédiées) plutôt que d'encombrer la vue principale.

6. **Flexibilité & Efficience d'utilisation (Nielsen #7 / Adaptabilité & Flexibilité)** :
   - Proposer des interactions accélérées pour les utilisateurs fréquents : filtres rapides en un clic, recherche textuelle instantanée, tris combinés et raccourcis.
   - Veiller à une navigation fluide au clavier et à un contraste visuel optimal répondant aux normes d'accessibilité WCAG.


## Règles de Génération des Messages de Commit Git
Toute proposition ou génération de message de commit doit respecter scrupuleusement les standards suivants pour assurer une traçabilité précise et refléter fidèlement la réalité des modifications :

1. **Format Conventionnel Strict (Conventional Commits)** :
   - Utiliser la structure : `<type>(<scope>): <description courte et explicite au présent>`
   - Types autorisés :
     - `feat` : Ajout d'une nouvelle fonctionnalité ou évolution métier.
     - `fix` : Correction d'un bug, d'une erreur d'affichage ou d'un comportement inattendu.
     - `refactor` : Restructuration du code sans altération des fonctionnalités existantes (ex: respect SOLID).
     - `style` : Modifications liées au Design System, polices, couleurs ou classes.
     - `perf` : Optimisation du rendu, de requêtes ou de fluidité.
     - `docs` : Mise à jour de la documentation, de `AGENTS.md` ou de commentaires clés.
     - `chore` : Tâches de maintenance, dépendances ou configuration système.
   - Le `<scope>` doit cibler le domaine exact modifié (ex: `charges-fixes`, `variables`, `dashboard`, `ui`, `theme`, `store`).

2. **Fidélité & Exhaustivité des changements apportés** :
   - **Interdiction formelle des messages vagues ou génériques** (ex: *"fix bug"*, *"update code"*, *"wip"*).
   - Détailler systématiquement dans le corps du message (liste à puces) :
     - Les modifications clés apportées aux composants et actions.
     - Les éléments ajoutés, refactorisés ou explicitement supprimés.
     - Le motif ou l'impact fonctionnel (ex: correction ergonomique, prévention d'erreur, amélioration UX).

3. **Exemple de structure attendue** :
```text
feat(charges-fixes): simplification du tableau et ajout de la confirmation de suppression

- Suppression du bouton d'ajout redondant dans l'en-tête principal
- Ajout de la modale personnalisée de confirmation pour les actions destructives
- Prise en charge de la fermeture de la modale au clic sur l'arrière-plan
- Nettoyage des styles orphelins et validation lint/typecheck
```
