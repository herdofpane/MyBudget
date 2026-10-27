---
name: apple-hig-ux
description: >-
  Apple Human Interface Guidelines (HIG), Inset Grouped design, 4 mandatory async UI states, and mobile touch ergonomics for Klyro.
  Use when creating or refining UI components, screens, modals, or user interactions.
---

# Apple HIG, UI Ergonomics & Asynchronous States (Klyro)

Design standards, layout patterns, and touch ergonomics aligned with Apple Human Interface Guidelines and neobank fintech aesthetics.

---

## 1. Apple HIG & Fintech Visual Foundations

* **Inset Grouped Styling**:
  * Group related controls and metrics inside rounded cards (`rounded-2xl` or `rounded-3xl`) with soft inset borders (`border-border/60`).
  * Use tinted backgrounds, subtle ambient shadows, and frosted translucent headers (`backdrop-blur`).
* **Visual Hierarchy & Typography**:
  * Emphasize primary balances with bold, large typography.
  * Provide secondary cognitive aids such as rounded approximations (`≈ X €`) under exact currency values.
* **Category Squircles**:
  * Render category icons inside colored squircles (`rounded-2xl` with a soft tinted background).
* **Privacy Mode (Mode Discrétion)**:
  * Support instant masking of sensitive financial amounts (`•••• €`) with smooth transition feedback.

---

## 2. Mandatory 4 Asynchronous UI States

Every view or data-dependent component must explicitly implement and handle all four lifecycle states:

1. **Nominal / Idle**:
   * Complete, cleanly formatted financial data with proper typography and colors.
2. **Loading**:
   * Shimmering skeleton loaders (`HomeSkeleton`, `ListSkeleton`, `DetailsSkeleton`) matching the exact layout of the target data card. Never use blocking full-screen spinners for content areas.
3. **Empty**:
   * Contextual and reassuring empty illustration/icon, clear explanation, and an actionable Call-To-Action (CTA) button to add the first item.
4. **Error**:
   * Non-destructive, user-friendly error card with contextual explanation and an immediate retry trigger button.

---

## 3. Mobile Touch Ergonomics

* **Touch Targets ($\ge 44 \times 44$ pt)**:
  * All interactive elements (icon buttons, chevrons, pills, steppers, segmented controls) must have a minimum contact area of $44 \times 44\text{ pt}$.
  * Use `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` on compact icons to guarantee comfortable tapping.
* **Safe Area Insets**:
  * Always respect top notch/island and bottom home-indicator insets using `react-native-safe-area-context`.
* **Form Sheets & Modals**:
  * Present creation/edition flows inside bottom sheets or iOS-style form sheets with drag handles and clear dismiss buttons.
