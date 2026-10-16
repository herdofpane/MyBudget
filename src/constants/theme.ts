import { Platform } from 'react-native';
import { colors } from '@/theme/colors';

export { colors };

export const Colors = {
  light: {
    // Fond général (Canvas) & Surfaces (Klyro Fintech)
    background: colors.background, // #F8FAFC - Blanc Cassé
    surface: colors.card, // #FFFFFF - Blanc Pur (cartes)
    surfaceSubtle: '#F1F5F9', // Gris clair subtil
    surfaceElevated: '#FFFFFF', // Surface élevée
    backgroundSubtle: '#F1F5F9',
    backgroundElement: '#F1F5F9', // Élément de fond / conteneur creusé
    backgroundSelected: '#ECFDF5', // Brume émeraude douce

    // Bordures & séparateurs
    border: colors.border, // #E2E8F0 - Gris Neutre
    borderSubtle: '#F1F5F9', // Séparateur discret
    borderFocus: colors.accent, // #10B981 - Halo Émeraude Doux

    // Primaire (Bleu Nuit - Klyro)
    primary: colors.primary, // #0F172A - Bleu Nuit
    primaryHover: '#1E293B', // Survol interactif
    primaryActive: '#334155', // Pression active
    primarySubtle: '#F1F5F9', // Fond primaire doux
    primaryMuted: '#E2E8F0', // Badge / neutre secondaire

    // Accents & Sémantique
    accent: colors.accent, // #10B981 - Émeraude Doux
    accentDark: colors.accentDark, // #047857 - Émeraude Foncé
    lavender: colors.lavender, // #6366F1 - Lavande / Violet

    // Neutres sombres profonds (Jamais de noir pur #000000)
    text: colors.text, // #0F172A - Titres et texte principal
    textSecondary: colors.textMuted, // #64748B - Gris Ardoise
    textMuted: '#94A3B8', // Texte tertiaire / métadonnées
    textOnPrimary: '#FFFFFF', // Blanc pur sur fond sombre

    // Sémantique & Statuts
    success: colors.accent, // #10B981
    successSubtle: '#ECFDF5',
    warning: '#F59E0B',
    warningSubtle: '#FFFBEB',
    destructive: colors.danger, // #F87171 - Saumon Doux
    destructiveSubtle: '#FEF2F2',
  },
  dark: {
    background: colors.background,
    surface: colors.card,
    surfaceSubtle: '#F1F5F9',
    surfaceElevated: '#FFFFFF',
    backgroundSubtle: '#F1F5F9',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#ECFDF5',
    border: colors.border,
    borderSubtle: '#F1F5F9',
    borderFocus: colors.accent,
    primary: colors.primary,
    primaryHover: '#1E293B',
    primaryActive: '#334155',
    primarySubtle: '#F1F5F9',
    primaryMuted: '#E2E8F0',
    accent: colors.accent,
    accentDark: colors.accentDark,
    lavender: colors.lavender,
    text: colors.text,
    textSecondary: colors.textMuted,
    textMuted: '#94A3B8',
    textOnPrimary: '#FFFFFF',
    success: colors.accent,
    successSubtle: '#ECFDF5',
    warning: '#F59E0B',
    warningSubtle: '#FFFBEB',
    destructive: colors.danger,
    destructiveSubtle: '#FEF2F2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    rounded: '"Plus Jakarta Sans", sans-serif',
    mono: 'ui-monospace, Menlo, Monaco, monospace',
  },
});

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.8,
    fontWeight: '800' as const,
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.15,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
    fontWeight: '700' as const,
  },
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  full: 9999,
} as const;

export const Shadows = {
  soft: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  modal: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  primary: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
