---
name: financial-math
description: >-
  Pure financial computations, savings formulas, multi-month expense smoothing, and currency formatting for Klyro.
  Use when implementing or adjusting budget calculations, debt ratios, loan schedules, or rounding logic.
---

# Financial Math & Budget Simulation (Klyro)

Mathematical models, savings progressive distribution, multi-month expense smoothing, and financial formatting standards.

---

## 1. Budget Simulation & Allocation Formulas

Klyro balances living expenses and savings progressively based on the available spending amount and the essential need threshold:

### Checking Account Allocation (Compte Courant / Reste à Vivre Réel)
$$\text{CompteCourant} = \sqrt{\text{ResteÀVivre} \times \text{Nécessaire}}$$

### Recommended Savings Allocation (Épargne Conseillée)
$$\text{Épargne} = \text{ResteÀVivre} - \sqrt{\text{ResteÀVivre} \times \text{Nécessaire}}$$

### Rule Invariants
* $\text{ResteÀVivre} = \text{Revenus} - \text{ChargesFixes}$.
* If $\text{ResteÀVivre} \le 0$, $\text{CompteCourant} = 0$ and $\text{Épargne} = 0$.
* If $\text{ResteÀVivre} < \text{Nécessaire}$, all remaining funds are allocated to the checking account, and savings is $0$.

---

## 2. Multi-Month Expense Smoothing (Lissage Temporel)

To prevent budget shocks from large sporadic expenses (vacations, insurance, electronics):
* An expense $E$ can be smoothed over $M \in \{1, 3, 6, 12, 24\}$ months.
* The monthly impact of an active smoothed expense is calculated as:
  $$\text{ImpactMensuel} = \frac{E}{M}$$
* An expense is considered active in month $t$ if $t_{\text{start}} \le t < t_{\text{start}} + M$.

---

## 3. Fixed Expenses & Credit Amortization

* **Loan Progress**:
  $$\text{Progression} = \min\left(100, \frac{\text{MoisÉcoulés}}{\text{DuréeTotaleMois}} \times 100\right)$$
* **Debt Ratio (Taux d'endettement)**:
  $$\text{TauxEndettement} = \frac{\sum \text{MensualitésCrédits}}{\text{Revenus}} \times 100$$
* **End Date Calculation**:
  Always compute expiry dates using month-accurate date arithmetic, accounting for leap years and varying month lengths.

---

## 4. Currency Formatting & Cognitive Dual-Display

* **Exact Value**: Format with two decimal places using localized Euro formatting (`1 250,50 €`).
* **Rounded Cognitive Equivalent**: Format to the nearest integer (`≈ 1 251 €`) to minimize mental load during high-level budget reviews.
