import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Users, Search, CheckCircle2, XCircle, Shield, UserCheck, ShieldAlert } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { mockUsers } from '@/data/mock-users';
import type { UserRole } from '@/types';

export const Route = createFileRoute('/admin/users')({
  head: () => ({
    meta: [
      { title: 'User Directory — SuperAdmin' },
      { name: 'description', content: 'Manage platform accounts, role assignments, and player status.' },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [usersList, setUsersList] = useState(
    mockUsers.map((u) => ({
      ...u,
      isActive: true,
    }))
  );
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = usersList.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextActive = !u.isActive;
          setToast(`User ${u.name} is now ${nextActive ? 'ACTIVE' : 'DEACTIVATED'}.`);
          setTimeout(() => setToast(null), 3000);
          return { ...u, isActive: nextActive };
        }
        return u;
      })
    );
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Identity & Access Control</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PLATFORM USERS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer, operator, and administrator accounts across all regions.
          </p>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter role"
            className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="player">Player</option>
            <option value="owner">Turf Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Showing {filtered.length} of {usersList.length} registered accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Membership</th>
              <th className="p-4">TurfPoints</th>
              <th className="p-4">Account Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition">
                <td className="p-4">
                  <p className="font-bold text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="p-4">
                  <Badge tone={u.role === 'admin' ? 'neutral' : u.role === 'owner' ? 'blue' : 'green'}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-4 capitalize font-semibold text-xs">
                  {u.membershipTier} Tier
                </td>
                <td className="p-4 font-mono font-bold text-reward">
                  {u.rewardPoints} pts
                </td>
                <td className="p-4">
                  <Badge tone={u.isActive ? 'green' : 'neutral'}>
                    {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`text-xs font-bold px-3 py-1 rounded transition ${
                        u.isActive
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
