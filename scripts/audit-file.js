#!/usr/bin/env node

/**
 * File Audit Script for Klyro / MyBudget
 * Deterministic quality and architectural constraint validator.
 * Checks LOC ceilings, function lengths, strict typing, and layer boundaries.
 */

const fs = require('fs');
const path = require('path');

const LIMITS = {
  MODULE_MAX_LOC: 400,
  COMPONENT_MAX_LOC: 250,
  FUNCTION_MAX_LOC: 35,
  MAX_PARAMS: 3,
};

function auditFile(targetPath) {
  if (!targetPath) {
    console.error('❌ Error: Please provide a file path to audit.');
    console.error('Usage: node ./scripts/audit-file.js <path>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: File not found at "${targetPath}"`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const totalLoc = lines.length;
  const normalizedPath = targetPath.replace(/\\/g, '/');

  const violations = [];
  const warnings = [];
  const stats = {
    totalLoc,
    longFunctions: [],
    highParamFunctions: [],
    anyCount: 0,
    consoleCount: 0,
    forbiddenImports: [],
  };

  // 1. File LOC Ceiling Check
  const isComponent = /\.(tsx|jsx)$/.test(targetPath) && normalizedPath.includes('/components/');
  const maxAllowedLoc = isComponent ? LIMITS.COMPONENT_MAX_LOC : LIMITS.MODULE_MAX_LOC;

  if (totalLoc > maxAllowedLoc) {
    violations.push(`File length (${totalLoc} LOC) exceeds the ${maxAllowedLoc} LOC limit for ${isComponent ? 'components' : 'modules'}.`);
  } else if (totalLoc > maxAllowedLoc * 0.85) {
    warnings.push(`File length (${totalLoc} LOC) is approaching the ${maxAllowedLoc} LOC ceiling (>85%).`);
  }

  // 2. Layer Boundary & Forbidden Import Rules
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Check direct AsyncStorage import
    if (/@react-native-async-storage\/async-storage/.test(line) && !normalizedPath.includes('src/services/') && !normalizedPath.includes('src/hooks/use-privacy-mode.ts')) {
      violations.push(`Line ${lineNum}: Direct import of AsyncStorage forbidden outside src/services/. Use BudgetStorageService.`);
    }

    // Check direct storage service in UI components
    if (/budget-storage\.service/.test(line) && (normalizedPath.includes('src/components/') || normalizedPath.includes('src/app/'))) {
      violations.push(`Line ${lineNum}: Components & routes must not import BudgetStorageService directly. Delegate to custom hooks.`);
    }

    // 3. Strict Typing & Hygiene Checks
    if (/\bany\b/.test(line) && !/\/\*/.test(line) && !/\/\//.test(line)) {
      if (/:\s*any\b|<any>|\bas\s+any\b/.test(line)) {
        stats.anyCount++;
        violations.push(`Line ${lineNum}: Strict typing violation: explicit 'any' detected.`);
      }
    }

    if (/\bas\s+unknown\s+as\b/.test(line)) {
      violations.push(`Line ${lineNum}: Loose double type assertion ('as unknown as') forbidden.`);
    }

    if (/console\.(log|debug)\(/.test(line) && !normalizedPath.includes('scripts/')) {
      stats.consoleCount++;
      warnings.push(`Line ${lineNum}: Unfiltered console statement found.`);
    }
  });

  // 4. Function Length & Parameter Analysis
  let currentFunc = null;
  let braceDepth = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Naive function declaration matcher
    const funcMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/)
      || trimmed.match(/(?:const|let)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?=>/);

    if (funcMatch && !currentFunc) {
      const name = funcMatch[1];
      const params = funcMatch[2].split(',').filter(p => p.trim().length > 0);
      currentFunc = { name, startLine: lineNum, paramsCount: params.length, startDepth: braceDepth };

      if (params.length > LIMITS.MAX_PARAMS) {
        stats.highParamFunctions.push({ name, count: params.length, line: lineNum });
        warnings.push(`Line ${lineNum}: Function '${name}' has ${params.length} parameters (limit: ${LIMITS.MAX_PARAMS}). Group into an options object.`);
      }
    }

    // Track braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceDepth += openBraces - closeBraces;

    if (currentFunc && braceDepth <= currentFunc.startDepth && idx > currentFunc.startLine - 1) {
      const funcLength = lineNum - currentFunc.startLine + 1;
      if (funcLength > LIMITS.FUNCTION_MAX_LOC) {
        stats.longFunctions.push({ name: currentFunc.name, length: funcLength, line: currentFunc.startLine });
        violations.push(`Line ${currentFunc.startLine}: Function '${currentFunc.name}' spans ${funcLength} lines (exceeds ${LIMITS.FUNCTION_MAX_LOC} LOC limit).`);
      }
      currentFunc = null;
    }
  });

  // 5. Print Standardized Scorecard
  const statusIcon = violations.length === 0 ? (warnings.length === 0 ? '🟢' : '🟡') : '🔴';
  const statusLabel = violations.length === 0 ? (warnings.length === 0 ? 'CONFORME' : 'ATTENTION') : 'NON-CONFORME';

  console.log('\n======================================================');
  console.log(`📋 KLYRO FILE AUDIT SCORECARD: ${path.basename(targetPath)} ${statusIcon}`);
  console.log(`Path: ${targetPath}`);
  console.log(`Status: ${statusLabel}`);
  console.log('======================================================');
  console.log(`• Total LOC: ${totalLoc} / max ${maxAllowedLoc}`);
  console.log(`• Violations: ${violations.length}`);
  console.log(`• Warnings: ${warnings.length}`);
  console.log(`• Strict Typing (any count): ${stats.anyCount}`);
  console.log('------------------------------------------------------');

  if (violations.length > 0) {
    console.log('\n❌ CRITICAL VIOLATIONS:');
    violations.forEach(v => console.log(`  - ${v}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS & ADVICE:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (violations.length === 0 && warnings.length === 0) {
    console.log('\n✨ Excellent! File strictly complies with all Klyro architecture & clean code rules.');
  }
  console.log('======================================================\n');

  return { isCompliant: violations.length === 0, violations, warnings, stats };
}

// CLI Execution
if (require.main === module) {
  const filePath = process.argv[2];
  auditFile(filePath);
}

module.exports = { auditFile, LIMITS };
