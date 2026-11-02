import { useState, useCallback } from 'react';
import { useAuth } from '@/providers';
import { authService } from '../services/auth-service';
import { LoginCredentials } from '../types/auth.types';

export function useLogin() {
  const { login: setAuthSession } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeLogin = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await authService.login(credentials);
        await setAuthSession(response.user.email, response.token);
        return response;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur de connexion.';
        setErrorMessage(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthSession]
  );

  return {
    executeLogin,
    isLoading,
    errorMessage,
  };
}
