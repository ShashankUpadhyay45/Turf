import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, MembershipTier } from '@/types';
import { mockUsers as baseMockUsers } from '@/data/mock-users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpired: boolean;
  showLogoutConfirm: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  triggerSessionExpired: () => void;
  updateMembership: (tier: MembershipTier, cycle?: 'monthly' | 'annual') => void;
  addMembershipSavings: (amount: number) => void;
  toggleAutoRenew: () => void;
  addRewardPoints: (points: number) => void;
  deductRewardPoints: (points: number) => boolean;
  switchPersona: (roleOrUserId: UserRole | string) => void;
}

// User credentials and registry for mock authentication
const userDatabase: Array<User & { password?: string }> = baseMockUsers.map((u) => {
  let pwd = 'owner123';
  if (u.role === 'player') pwd = 'player123';
  else if (u.role === 'admin') pwd = 'admin123';
  else {
    // Check if gaming or specific owner password
    if (u.id.includes('gaming')) pwd = 'gaming123';
    else pwd = 'owner123';
  }
  return { ...u, password: pwd };
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpired: false,
      showLogoutConfirm: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, sessionExpired: false });
        await new Promise((r) => setTimeout(r, 450));

        const found = userDatabase.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (found) {
          if (found.isActive === false) {
            set({
              error: 'Your account has been deactivated. Please contact support@playo.in for review.',
              isLoading: false,
            });
            return false;
          }

          const { password: _, ...cleanUser } = found;
          set({
            user: cleanUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpired: false,
          });
          return true;
        }

        set({ error: 'Invalid email or password combination.', isLoading: false });
        return false;
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        set({ isLoading: true, error: null, sessionExpired: false });
        await new Promise((r) => setTimeout(r, 450));

        if (userDatabase.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          set({ error: 'An account with this email address already exists.', isLoading: false });
          return false;
        }

        const newUser: User & { password?: string } = {
          id: `${role}-${Date.now()}`,
          name,
          email,
          role,
          membershipTier: 'free',
          rewardPoints: role === 'player' ? 100 : 0,
          createdAt: new Date().toISOString(),
          isActive: true,
          password,
        };

        userDatabase.push(newUser);
        const { password: _, ...cleanUser } = newUser;
        set({ user: cleanUser, isAuthenticated: true, isLoading: false, error: null });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          sessionExpired: false,
          showLogoutConfirm: false,
        });
      },

      clearError: () => set({ error: null }),

      triggerSessionExpired: () => {
        set({ sessionExpired: true, isAuthenticated: false, user: null });
      },

      setShowLogoutConfirm: (show: boolean) => {
        set({ showLogoutConfirm: show });
      },

      updateMembership: (tier: MembershipTier, cycle: 'monthly' | 'annual' = 'monthly') => {
        const { user } = get();
        if (user) {
          const now = new Date();
          const expiry = new Date(now);
          if (cycle === 'annual' || tier === 'annual_pass') {
            expiry.setFullYear(now.getFullYear() + 1);
          } else {
            expiry.setMonth(now.getMonth() + 1);
          }

          const details = tier === 'free' ? undefined : {
            tier,
            billingCycle: (tier === 'annual_pass' ? 'annual' : cycle) as 'monthly' | 'annual',
            startDate: now.toISOString(),
            expiryDate: expiry.toISOString(),
            autoRenew: true,
            totalSavings: user.membershipDetails?.totalSavings ?? 0,
            status: 'ACTIVE' as const,
          };

          set({
            user: {
              ...user,
              membershipTier: tier,
              membershipDetails: details,
            },
          });
        }
      },

      addMembershipSavings: (amount: number) => {
        const { user } = get();
        if (user && user.membershipDetails) {
          set({
            user: {
              ...user,
              membershipDetails: {
                ...user.membershipDetails,
                totalSavings: (user.membershipDetails.totalSavings || 0) + amount,
              },
            },
          });
        }
      },

      toggleAutoRenew: () => {
        const { user } = get();
        if (user && user.membershipDetails) {
          set({
            user: {
              ...user,
              membershipDetails: {
                ...user.membershipDetails,
                autoRenew: !user.membershipDetails.autoRenew,
              },
            },
          });
        }
      },

      addRewardPoints: (points: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, rewardPoints: user.rewardPoints + points } });
        }
      },

      deductRewardPoints: (points: number) => {
        const { user } = get();
        if (user && user.rewardPoints >= points) {
          set({ user: { ...user, rewardPoints: user.rewardPoints - points } });
          return true;
        }
        return false;
      },

      switchPersona: (roleOrUserId: UserRole | string) => {
        let u = userDatabase.find((x) => x.id === roleOrUserId);
        if (!u) {
          if (roleOrUserId === 'player') {
            u = userDatabase.find((x) => x.id === 'user-1');
          } else if (roleOrUserId === 'owner') {
            u = userDatabase.find((x) => x.id === 'owner-1');
          } else if (roleOrUserId === 'admin') {
            u = userDatabase.find((x) => x.id === 'admin-1');
          }
        }
        if (u) {
          const { password: _, ...clean } = u;
          set({ user: clean, isAuthenticated: true, error: null, sessionExpired: false });
        }
      },
    }),
    {
      name: 'playo-auth-v2',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
