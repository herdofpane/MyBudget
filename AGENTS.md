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

# Directives de Développement

Ce document définit les règles universelles et les standards de qualité que tout code généré ou modifié dans ce projet doit strictement respecter.

## 1. Principes de Conception et Architecture Logicielle

- **KISS (Keep It Simple, Stupid)** : Privilégie toujours la solution la plus simple et la plus directe. N'introduis pas de patterns complexes ou de sur-ingénierie sans nécessité absolue.
- **DRY (Don't Repeat Yourself) vs WET** : Évite la duplication de logique métier. Cependant, préfère une légère duplication à une mauvaise abstraction qui créerait un couplage fort entre des modules non liés.
- **YAGNI (You Aren't Gonna Need It)** : Ne code que ce qui est explicitement requis pour la fonctionnalité actuelle. N'ajoute pas de code, de paramètres ou d'interfaces "au cas où" pour le futur.
- **SoC (Separation of Concerns)** : Sépare clairement la logique métier, l'interface utilisateur (UI) et l'accès aux données (API/Base de données).
- **Single Responsibility Principle (SOLID)** : Chaque fichier, classe, module ou fonction ne doit avoir qu'une seule responsabilité et une seule raison de changer.
- **Langage Ubiquitaire (DDD)** : Utilise exactement la même terminologie métier dans le code (noms de classes, variables, routes) que celle employée par le produit et le métier.

## 2. Clean Code et Lisibilité

- **Nommage explicite** : Les noms de variables, fonctions, classes et fichiers doivent révéler leur intention clairement sans nécessiter de contexte supplémentaire (ex: `daysSinceLastLogin` au lieu de `d` ou `time`).
- **Fonctions courtes et prévisibles** :
  - Une fonction doit faire une seule chose.
  - Privilégie les fonctions pures et minimise les effets de bord (ne modifie pas les paramètres d'entrée ou l'état global de manière cachée).
  - Principe de moindre surprise : Une fonction fait exactement ce que son nom indique (ex: `getUser()` ne doit rien modifier).
- **Politique de commentaires** :
  - **Ne commente jamais le Quoi** : Si le code a besoin d'un commentaire pour expliquer ce qu'il fait, réécris le code pour le rendre plus lisible (meilleur nommage, extraction de sous-fonctions).
  - **Commente toujours le Pourquoi** : Documente les décisions métier complexes, les contournements techniques (workarounds) ou les contraintes externes non évidentes.
- **Zéro valeur magique** : N'utilise pas de chaînes de caractères ou de nombres en dur (*magic numbers/strings*) dans la logique. Extrais-les dans des constantes nommées explicites ou des énumérations.

## 3. Conception Système (System Design) et Résilience

- **Statelessness (Absence d'état)** : Ne stocke jamais d'état de session ou de données temporaires critiques en mémoire locale du serveur. Tout état doit être déporté (base de données, cache externe, jeton client) pour garantir le scaling horizontal.
- **Idempotence** : Les opérations de mutation critiques (PUT, DELETE, paiements, webhooks, jobs asynchrones) doivent être idempotentes : les exécuter plusieurs fois avec les mêmes paramètres doit produire le même résultat sans créer de doublons.
- **Rétrocompatibilité** : Toute modification d'API, de contrat d'interface ou de schéma de base de données doit être rétrocompatible (pattern *Expand and Contract*) pour permettre des déploiements sans interruption de service.
- **Asynchronisme et Découplage** : Délègue les opérations longues ou coûteuses (envoi d'e-mails, génération de fichiers, appels tiers lents) à des tâches de fond (queues/workers) pour ne pas bloquer le thread principal ou la réponse HTTP.

## 4. Robustesse, Sécurité (DevSecOps) et Confidentialité

- **Fail Fast & Guard Clauses** : Valide les préconditions tout en haut des fonctions et retourne immédiatement en cas d'état invalide (retours anticipés). Évite les structures `if / else` imbriquées sur plus de 2 niveaux.
- **Never Trust User Input** : Considère toute donnée entrante (utilisateur, API externe, fichier, URL) comme potentiellement malveillante ou malformée. Valide, type et assainis les données aux frontières du système (protection contre les injections SQL, XSS, CSRF).
- **Défense en profondeur & Moindre Privilège** :
  - Vérifie systématiquement l'authentification et les autorisations côté serveur sur chaque route/action, même si l'interface client les masque.
  - Restreins les permissions des services, tokens et requêtes au strict minimum nécessaire.
- **Sécurité des secrets et Dépendances** :
  - Ne laisse jamais de secrets, clés d'API, mots de passe ou jetons en dur dans le code. Utilise systématiquement des variables d'environnement.
  - N'introduis pas de librairies externes lourdes ou non maintenues pour des besoins triviaux. Privilégie des licences permissives (MIT, Apache 2.0, BSD).
- **Privacy by Design (RGPD)** : Applique la minimisation des données. Ne collecte, ne stocke et n'expose dans les réponses API que les champs strictement nécessaires à la fonctionnalité (ne renvoie jamais un objet User complet avec son hash de mot de passe ou des métadonnées privées).

## 5. Observabilité, Erreurs et Exploitation (DevOps)

- **Gestion stricte des erreurs** :
  - Interdiction formelle d'utiliser des blocs `try / catch` vides qui avalent les erreurs silencieusement.
  - Chaque erreur interceptée doit être soit traitée proprement, soit journalisée avec son contexte, soit relancée avec un message explicite.
  - Ne renvoie jamais de stack traces ou de détails techniques internes à l'utilisateur final en production.
- **Journalisation (Logging) structurée et sécurisée** :
  - Produis des logs structurés et contextualisés (incluant un `request_id` ou `correlation_id` quand applicable).
  - Interdiction absolue de logger des données sensibles (mots de passe, tokens JWT, numéros de carte bancaire, données personnelles brutes).
- **Standardisation Temporelle** : Stocke, manipule et échange toutes les dates et heures exclusivement en UTC (format ISO 8601). La conversion dans le fuseau horaire local ne doit se faire qu'au dernier moment sur l'interface d'affichage.
- **Configuration externe (12-Factor App)** : Sépare strictement le code de la configuration dépendante de l'environnement (URLs, feature flags, limites).

## 6. Accessibilité (a11y), Performance et Éco-conception

- **Accessibilité par défaut (WCAG / RGAA)** :
  - Utilise toujours du HTML/composants sémantiques natifs plutôt que des éléments génériques non signifiants.
  - Assure une navigation complète au clavier (gestion du focus), des labels explicites sur tous les champs de formulaire, des textes alternatifs (`alt` / `accessibilityLabel`) pertinents et des attributs d'accessibilité (`aria-*` / props accessibility) lorsque nécessaire.
- **Performance des données** :
  - Évite systématiquement le problème des requêtes $N+1$ (utilise le eager loading, des jointures ou du batching).
  - Pagine ou limite systématiquement toute requête retournant une liste d'éléments depuis la base de données ou via une API.
- **Pas d'optimisation prématurée (mais pas de négligence)** : Privilégie dans l'ordre :
  1. L'exactitude (*Make it work*)
  2. La clarté et la maintenabilité (*Make it right*)
  3. La performance (*Make it fast* — si un goulot d'étranglement est prouvé ou évident).

## 7. Hygiène de Code et Testabilité

- **Règle du Boy Scout** : Laisse toujours le code plus propre que tu ne l'as trouvé. Supprime le code mort, les imports inutilisés et les instructions de débogage (`console.log`, `print`, `dd`) avant de finaliser.
- **Changements atomiques** : Lors d'une modification, ne touche qu'au périmètre concerné par la demande sans casser l'existant ni reformater arbitrairement des fichiers non liés.
- **Testabilité** : Écris du code facilement testable (injection de dépendances, découplage). Les tests doivent vérifier le comportement métier (entrées/sorties, cas limites et cas d'erreur) et non les détails d'implémentation interne.
