import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

export const THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    border: 'hsl(240 5.9% 90%)',
    card: 'hsl(0 0% 100%)',
    notification: 'hsl(0 84.2% 60.2%)',
    primary: 'hsl(240 5.9% 10%)',
    text: 'hsl(240 10% 3.9%)',
  },
  dark: {
    background: 'hsl(222 47% 6%)',
    border: 'hsl(217 33% 20%)',
    card: 'hsl(222 47% 11%)',
    notification: 'hsl(0 84% 60%)',
    primary: 'hsl(217 91% 60%)',
    text: 'hsl(210 40% 98%)',
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
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.notification,
      primary: THEME.dark.primary,
      text: THEME.dark.text,
    },
  },
};
