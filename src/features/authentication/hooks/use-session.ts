import { useAuth } from '@/providers';

export function useSession() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}
