---
name: docs-continuous-sync
description: >-
  Continuous documentation synchronization and README.md maintenance rules for Klyro.
  Use after every functional, structural, or operational change to keep documentation in 100% alignment.
---

# Continuous Documentation Synchronization (Klyro)

Living documentation guidelines and automated synchronization protocols for `README.md`.

---

## 1. Proactive & Systematic Updates

`README.md` is the authoritative public and technical reference of the project.
* **Zero Prompt Requirement**: Any change affecting features, architecture, scripts, or dependencies must trigger an update to `README.md` immediately, without requiring an explicit prompt from the user.
* **Pre-Commit Invariance**: Never consider a task finished or propose a git commit if `README.md` does not strictly mirror the updated code state.

---

## 2. Synchronization Checklist

Whenever code changes occur, systematically audit and update these key sections:

| Section in README | Verification Criterion |
| :--- | :--- |
| **Badges & Versions** | Check versions of Expo SDK, React Native, React, TypeScript, and NativeWind. |
| **Core Features** | Add, update, or refine descriptions of screens, modal sheets, steppers, or calculation modes. |
| **Project Tree Diagram** | Update folder or file entries whenever files are added, renamed, moved, or deleted. |
| **Commands & Scripts** | Document any new `npm` / `bun` scripts, build targets, or verification utilities. |
| **Formulas & Math** | Synchronize any mathematical model changes (e.g. savings formulas, debt ratios). |

---

## 3. Tone & Quality Standards

* **Professional Neobank Tone**: Maintain clean, elegant language aligned with contemporary fintech standards.
* **Markdown Rigor**: Format tables cleanly, use explicit math notations ($\LaTeX$), and ensure links to documentation remain valid.
