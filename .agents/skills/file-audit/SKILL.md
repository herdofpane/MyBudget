---
name: file-audit
description: >-
  Inspect, audit, and validate source files against Klyro architecture rules, LOC ceilings, strict typing, and Apple HIG standards.
  Use when asked to review, audit, inspect, analyze, or verify any file in the project.
---

# Klyro File Audit & Quality Inspector

Deterministic quality audit runbook and architectural compliance validator for Klyro.

---

## 1. Audit Workflow

When asked to analyze or inspect a file:

1. **Deterministic Metrics Scan**:
   * Inspect lines, functions, and imports.
   * You can run `node ./scripts/audit-file.js <file_path>` or inspect lines progressively.
2. **Evaluation against Klyro Standards**:
   * Check LOC ceilings, function parameters, and layer boundaries.
   * Verify Apple HIG compliance (for UI files) and pure function immutability (for utility files).
3. **Structured Restitution**:
   * Output the standardized **Scorecard Klyro** with a traffic-light status (🟢 / 🟡 / 🔴) and concrete refactoring instructions if needed.

---

## 2. The 4 Audit Pillars

### Pillar 1: LOC Ceilings & Complexity
* **Modules / Files**: $< 400$ lines.
* **UI Components**: $< 250$ lines.
* **Functions & Methods**: $< 35$ lines.
* **Parameters**: Maximum 3 parameters. If $> 3$, group into a typed options object.
* **Nesting Depth**: Maximum 2 levels of nesting; use guard clauses and early returns.

### Pillar 2: Strict Typing & Hygiene
* **Zero `any`**: Strictly forbid `: any`, `<any>`, or `as any`.
* **Zero Loose Casts**: Forbid `as unknown as ...`.
* **No Magic Values**: Extract raw numbers or strings into named constants or domain enums.
* **Zero Dead Code**: Clean up unused imports, commented code blocks, and orphaned variables immediately.

### Pillar 3: Layer Boundaries & SOLID Compliance
* **Pure UI (`src/components/`, `src/app/`)**: Must never import `@react-native-async-storage/async-storage` or `budget-storage.service.ts` directly.
* **Custom Hooks (`src/hooks/`)**: Must encapsulate reactive business state and expose fine-grained selectors.
* **Pure Math (`src/utils/`)**: Must remain deterministic with zero side effects.

### Pillar 4: Apple HIG & Mobile Ergonomics (TSX files)
* **Touch Targets**: Minimum $44 \times 44\text{ pt}$ for all pressable areas (use `hitSlop` on compact icons).
* **Mandatory 4 Asynchronous States**: Views fetching or displaying data must account for *Nominal*, *Loading/Skeleton*, *Empty*, and *Error* states.
* **Safe Area Insets**: Respect notch and home-indicator insets via `react-native-safe-area-context`.

---

## 3. Required Restitution Format: Scorecard Klyro

Always structure the audit output using this clean format:

```markdown
### 📋 Scorecard Klyro: `<file_name>` [ 🟢 / 🟡 / 🔴 ]

| Dimension | Statut | Constat & Analyse |
| :--- | :---: | :--- |
| **Plafonds LOC & Complexité** | 🟢 / 🟡 / 🔴 | [LOC totales, état des fonctions et composants] |
| **Typage Strict & Hygiène** | 🟢 / 🔴 | [Zéro `any`, cast vérifiés, pas de logs résiduels] |
| **Frontières de Couches (SOLID)** | 🟢 / 🔴 | [Respect du découpage UI / Hooks / Utils / Service] |
| **Ergonomie Mobile & Apple HIG** | 🟢 / 🟡 / ⚪ | [Cibles $\ge 44$ pt, 4 états asynchrones ou N/A] |

#### 🔍 Diagnostic Détaillé
* [Observation ou point fort 1]
* [Observation ou point fort 2]

#### 🛠️ Plan d'Action Recommandé (si 🟡 ou 🔴)
1. [Action corrective prioritaire]
2. [Action de refactoring ou découpage]
```
