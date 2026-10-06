import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, LogIn, Briefcase, Shield, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ActionLink } from '@/components/ui';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'player' | 'owner' | 'admin'>;
  requireAuth?: boolean;
}

export function RouteGuard({ children, allowedRoles, requireAuth = true }: RouteGuardProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const [switching, setSwitching] = useState(false);

  const handleQuickLogin = async (role: 'player' | 'owner' | 'admin') => {
    setSwitching(true);
    if (role === 'owner') {
      await login('owner@champions.com', 'owner123');
    } else if (role === 'admin') {
      await login('admin@playo.in', 'admin123');
    } else {
      await login('ayush@example.com', 'player123');
    }
    setSwitching(false);
  };

  if (requireAuth && !isAuthenticated) {
    const isOwnerTarget = allowedRoles?.includes('owner');
    const isAdminTarget = allowedRoles?.includes('admin');

    return (
      <div className="grid min-h-[65vh] place-items-center p-8 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
            {isAdminTarget ? (
              <Shield className="size-8 text-destructive" />
            ) : isOwnerTarget ? (
              <Briefcase className="size-8 text-info" />
            ) : (
              <LogIn className="size-8 text-primary" />
            )}
          </div>
          <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground">
            {isAdminTarget
              ? 'ADMIN PORTAL ACCESS'
              : isOwnerTarget
              ? 'TURF OWNER PORTAL ACCESS'
              : 'SIGN IN REQUIRED'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAdminTarget
              ? 'This console requires platform administrator privileges.'
              : isOwnerTarget
              ? 'This dashboard is reserved for verified turf owners.'
              : 'Please authenticate to access this section.'}
          </p>

          <div className="mt-6 space-y-3">
            {isOwnerTarget && (
              <button
                disabled={switching}
                onClick={() => handleQuickLogin('owner')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-info px-4 py-3 text-sm font-extrabold text-white transition hover:bg-info/90 shadow-md cursor-pointer"
              >
                <Briefcase className="size-4" />
                {switching ? 'Authenticating...' : 'Enter as Turf Owner (Champions Arena)'}
              </button>
            )}

            {isAdminTarget && (
              <button
                disabled={switching}
                onClick={() => handleQuickLogin('admin')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-extrabold text-destructive-foreground transition hover:bg-destructive/90 shadow-md cursor-pointer"
              >
                <Shield className="size-4" />
                {switching ? 'Authenticating...' : 'Enter as Platform Admin (SuperAdmin)'}
              </button>
            )}

            <div className="flex items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
              <ActionLink to="/login" className="font-bold">
                Manual Sign In
              </ActionLink>
              <span>•</span>
              <ActionLink to="/" className="font-bold">
                Return Home
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const isOwnerTarget = allowedRoles.includes('owner');
    const isAdminTarget = allowedRoles.includes('admin');

    return (
      <div className="grid min-h-[65vh] place-items-center p-8 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground">
            ROLE RESTRICTED
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are currently signed in as <span className="font-black text-foreground capitalize">{user.name}</span> ({user.role}). This section requires a{' '}
            <span className="font-bold text-foreground">{allowedRoles.join(' or ')}</span> account.
          </p>

          <div className="mt-6 space-y-3">
            {isOwnerTarget && (
              <button
                disabled={switching}
                onClick={() => handleQuickLogin('owner')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-info px-4 py-3 text-sm font-extrabold text-white transition hover:bg-info/90 shadow-md cursor-pointer"
              >
                <Briefcase className="size-4" />
                {switching ? 'Switching...' : 'Switch to Turf Owner (Champions Arena)'}
              </button>
            )}

            {isAdminTarget && (
              <button
                disabled={switching}
                onClick={() => handleQuickLogin('admin')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-extrabold text-destructive-foreground transition hover:bg-destructive/90 shadow-md cursor-pointer"
              >
                <Shield className="size-4" />
                {switching ? 'Switching...' : 'Switch to Platform Admin'}
              </button>
            )}

            <div className="flex items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
              <ActionLink to="/" className="font-bold">
                Return Home
              </ActionLink>
              <span>•</span>
              <ActionLink to="/login" className="font-bold">
                Switch Another Account
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
