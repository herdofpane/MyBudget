import { FixedExpenseItem, VariableCategory, BudgetData } from '@/types';

/**
 * Escapes and sanitizes a CSV field for RFC-4180 compliance.
 */
function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an RFC-4180 compliant CSV string containing the entire budget breakdown.
 */
export function generateBudgetCsv(
  budget: BudgetData,
  fixedExpenses: FixedExpenseItem[],
  variableCategories: VariableCategory[]
): string {
  const lines: string[] = [];

  // 1. Budget Header & Summary
  lines.push('--- SYNTHESE DU BUDGET ---');
  lines.push('Parametre,Montant');
  lines.push(`${sanitizeCsvCell('Revenu Net Mensuel')},${sanitizeCsvCell(budget.income)}`);
  lines.push(`${sanitizeCsvCell('Objectif Necessaire')},${sanitizeCsvCell(budget.targetNecessary ?? 0)}`);
  lines.push('');

  // 2. Fixed Expenses Table
  lines.push('--- CHARGES FIXES & EMPRUNTS ---');
  lines.push('Nom,Montant Mensuel,Categorie,Type,Mois Debut,Duree Totale (Mois)');
  for (const item of fixedExpenses) {
    lines.push([
      sanitizeCsvCell(item.name),
      sanitizeCsvCell(item.amount),
      sanitizeCsvCell(item.category),
      sanitizeCsvCell(item.isCredit ? 'Credit' : 'Charge Recurrente'),
      sanitizeCsvCell(item.startMonth || item.targetMonth || 'Permanent'),
      sanitizeCsvCell(item.durationMonths || 'Permanent'),
    ].join(','));
  }
  lines.push('');

  // 3. Variable Categories Table
  lines.push('--- CHARGES VARIABLES & LISSAGE ---');
  lines.push('Categorie,Montant Mensuel Lisse,Duree Lissage (Mois)');
  for (const cat of variableCategories) {
    lines.push([
      sanitizeCsvCell(cat.name),
      sanitizeCsvCell(cat.estimatedMonthly),
      sanitizeCsvCell(cat.smoothingMonths || 1),
    ].join(','));
  }

  return lines.join('\r\n');
}

/**
 * Triggers a browser/device download of a text-based file (JSON or CSV).
 */
export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
