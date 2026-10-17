---
description: Générer un commit Conventional Commits
---
1. Lance `git diff --staged` (ou `git diff` s'il n'y a rien de staged) ainsi que `git status -s`.
2. Analyse précisément toutes les modifications apportées.
3. Rédige un message de commit conforme aux règles strictes :
   - Structure : `<type>(<scope>): <description courte et explicite au présent>`
   - Types autorisés : `feat`, `fix`, `refactor`, `style`, `perf`, `docs`, `chore`
   - Le `<scope>` cible le domaine exact modifié.
   - Détailler systématiquement dans le corps du message (liste à puces) :
     - Les modifications clés apportées aux composants et actions.
     - Les éléments ajoutés, refactorisés ou explicitement supprimés.
     - Le motif ou l'impact fonctionnel (correction ergonomique, prévention d'erreur, amélioration UX).
4. Propose le commit à l'utilisateur.