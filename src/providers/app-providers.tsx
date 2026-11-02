import React, { ReactNode } from 'react';
import { AppThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { BudgetProvider } from './budget-provider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root composite provider wrapping all required contexts.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BudgetProvider>
      <AuthProvider>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </AuthProvider>
    </BudgetProvider>
  );
}
