import { useAuthStore } from '@/store/useAuthStore';
import { useCallback, useMemo } from 'react';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);
  const updateMembership = useAuthStore((s) => s.updateMembership);
  const addRewardPoints = useAuthStore((s) => s.addRewardPoints);
  const deductRewardPoints = useAuthStore((s) => s.deductRewardPoints);

  const isPlayer = useMemo(() => user?.role === 'player', [user]);
  const isOwner = useMemo(() => user?.role === 'owner', [user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  const requireAuth = useCallback(() => {
    return isAuthenticated;
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isPlayer,
    isOwner,
    isAdmin,
    login,
    register,
    logout,
    clearError,
    requireAuth,
    updateMembership,
    addRewardPoints,
    deductRewardPoints,
  };
}
