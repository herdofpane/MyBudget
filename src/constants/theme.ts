import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#231c2b',
    background: '#f4f0e8',
    backgroundElement: '#ffffff',
    backgroundSelected: 'rgba(155, 111, 186, 0.15)',
    textSecondary: '#6e6277',
    primary: '#9b6fba',
    border: '#e6dfd3',
  },
  dark: {
    text: '#231c2b',
    background: '#f4f0e8',
    backgroundElement: '#ffffff',
    backgroundSelected: 'rgba(155, 111, 186, 0.15)',
    textSecondary: '#6e6277',
    primary: '#9b6fba',
    border: '#e6dfd3',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
