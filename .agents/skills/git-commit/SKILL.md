---
name: git-commit
description: >-
  Standardized, high-signal Git commit protocols, Conventional Commits formatting, pre-commit quality gates, and deployment lifecycle for Klyro.
  Use when staging, reviewing, formatting, committing, or pushing git changes.
---

# Git Commit & Push Protocols (Klyro)

Deterministic, high-signal Git workflow standards, Conventional Commits conventions, pre-commit validation gates, and deployment awareness for the Klyro / MyBudget repository.

---

## 1. Pre-Commit Quality Gates

Before staging or committing any code, verify that the workspace passes all quality invariants:

* **Code Verification**:
  * Run `node scripts/audit-file.js <path-to-file>` on modified files (LOC ceilings: $< 35$ fn, $< 250$ UI, $< 400$ module; 0 `any`).
  * Ensure clean compilation and linting (`npx expo lint`, `npx tsc --noEmit`).
* **Living Documentation Sync**:
  * Ensure [`README.md`](file:///c:/Users/bradl/Documents/projets/MyBudget/README.md) reflects all added components, hooks, routes, scripts, or formulas (`docs-continuous-sync`).
* **Staging Hygiene**:
  * Inspect `git status -s` and `git diff` to stage only intentional, relevant files.
  * Never commit temporary files, debug logs, or unrelated cosmetic churn.

---

## 2. Conventional Commits Standards

Every commit message must be in **English only** and follow this exact two-part structure:

### 2.1 Subject Line (Title)
Format: `<type>(<scope>): <imperative summary>`
* **Types**:
  * `feat`: New user-facing functionality, component, or screen.
  * `fix`: Bug fix, calculation correction, or layout glitch resolution.
  * `refactor`: Structural reorganization without functional alteration.
  * `perf`: Performance optimization or re-render minimization.
  * `chore`: Tooling, build config, scripts, git hooks, or dependency updates.
  * `docs`: Documentation updates (`README.md`, specs, guides).
  * `test`: Adding or updating test suites.
* **Scopes**:
  * `(home)`, `(fixed-expenses)`, `(variable-expenses)`, `(details)`, `(storage)`, `(hooks)`, `(ui)`, `(math)`, `(git)`, `(deps)`.
* **Rules**:
  * Imperative mood ("add", "fix", "update", NOT "added", "fixes", "updating").
  * Maximum 72 characters, lowercase first letter after colon, no trailing period.

### 2.2 Detailed Body
* Separated from the subject line by a single blank line.
* Bullet points detailing affected files, components, and the technical *Why* (motivation/rationale).
* Strictly avoid vague summaries like "update code" or "fix bugs".

### Canonical Example:
```text
feat(home): add dual cognitive display for account balances

- Add rounded approximation badge (≈ X €) under exact balance in HomeAccountsCard
- Implement renderMoneyRound helper in financial-math utils for instant legibility
- Add haptic feedback trigger when toggling privacy mode on accounts card
- Retain exact currency value accessible on tap to preserve financial accuracy
```

---

## 3. User Confirmation & Push Lifecycle

* **Explicit User Authorization**:
  * Never execute `git commit` or `git push` without prior formal instruction or confirmation from the user.
* **Pre-Push Deployment Awareness**:
  * The repository enforces a `.githooks/pre-push` hook configured via `scripts/setup-git-hooks.js`.
  * Pushing to `main` automatically triggers `npm run deploy` (Expo web export + GitHub Pages publication) prior to the push completing.
* **Network Execution**:
  * Remote push operations require network access and must be executed accordingly.
