import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as ExpoNavThemeProvider } from 'expo-router';
import { NAV_THEME } from '@/lib/theme';

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ isDark: false }}>
      <ExpoNavThemeProvider value={NAV_THEME.light}>
        {children}
      </ExpoNavThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
