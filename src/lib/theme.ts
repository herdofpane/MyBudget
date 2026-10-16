import { DefaultTheme, type Theme } from 'expo-router';
import { colors } from '@/theme/colors';

export const THEME = {
  light: {
    background: colors.background,
    border: colors.border,
    card: colors.card,
    notification: colors.danger,
    primary: colors.primary,
    text: colors.text,
    textSecondary: colors.textMuted,
  },
  dark: {
    background: colors.background,
    border: colors.border,
    card: colors.card,
    notification: colors.danger,
    primary: colors.primary,
    text: colors.text,
    textSecondary: colors.textMuted,
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.notification,
      primary: THEME.light.primary,
      text: THEME.light.text,
    },
  },
  dark: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.notification,
      primary: THEME.dark.primary,
      text: THEME.dark.text,
    },
  },
};
