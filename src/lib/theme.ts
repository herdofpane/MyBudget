import { DefaultTheme, type Theme } from 'expo-router';

export const THEME = {
  light: {
    background: '#f4f0e8',
    border: '#e6dfd3',
    card: '#ffffff',
    notification: '#d43f5e',
    primary: '#9b6fba',
    text: '#231c2b',
    textSecondary: '#6e6277',
  },
  dark: {
    background: '#f4f0e8',
    border: '#e6dfd3',
    card: '#ffffff',
    notification: '#d43f5e',
    primary: '#9b6fba',
    text: '#231c2b',
    textSecondary: '#6e6277',
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
