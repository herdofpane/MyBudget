/**
 * Klyro — Directives Design & Charte Graphique (Mobile Expo / React Native)
 * Palette officielle et tokens chromatiques stricts définis dans .agents/rules/ui-brand-guidelines.md
 */

export const colors = {
  primary: '#0F172A',
  accent: '#10B981',
  accentDark: '#047857',
  lavender: '#6366F1',
  danger: '#F87171',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
} as const;

export type KlyroColors = typeof colors;
