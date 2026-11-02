import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storageClient } from '@/lib/storage';
import { APP_CONFIG } from '@/config';

export interface UserSession {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly token: string;
}

export interface AuthContextValue {
  readonly user: UserSession | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  login: (email: string, token?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await storageClient.getItem<UserSession>(APP_CONFIG.STORAGE_KEYS.AUTH_SESSION);
        if (isMounted && stored) {
          setUser(stored);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, token: string = 'demo-jwt-token') => {
    const session: UserSession = {
      id: 'usr_local_1',
      email,
      name: email.split('@')[0] || 'Utilisateur',
      token,
    };
    setUser(session);
    await storageClient.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_SESSION, session);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await storageClient.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_SESSION);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
