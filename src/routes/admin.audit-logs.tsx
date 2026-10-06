import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { History, Shield, Search, FileText } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';

export const Route = createFileRoute('/admin/audit-logs')({
  head: () => ({
    meta: [
      { title: 'Compliance Audit Trail — SuperAdmin' },
      { name: 'description', content: 'Immutable platform activity trail and administrative log ledger.' },
    ],
  }),
  component: AdminAuditLogsPage,
});

function AdminAuditLogsPage() {
  const auditLogs = useOwnerStore((s) => s.auditLogs);
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (l.targetName && l.targetName.toLowerCase().includes(search.toLowerCase())) ||
      (l.reason && l.reason.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Platform Governance & Security</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">COMPLIANCE AUDIT TRAIL</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable log of all listing approvals, maintenance overrides, penalty assignments, and role mutations.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, actor, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {filtered.length} entries recorded
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action Event</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">State Transition</th>
              <th className="p-4">Justification / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition text-xs">
                <td className="p-4 font-mono text-muted-foreground">
                  {new Date(log.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-4">
                  <p className="font-bold text-foreground">{log.actorName}</p>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Role: {log.actorRole}
                  </span>
                </td>
                <td className="p-4">
                  <span className="rounded bg-muted px-2 py-0.5 font-mono font-bold text-foreground">
                    {log.action}
                  </span>
                </td>
                <td className="p-4">
                  <p className="font-bold text-foreground">{log.targetName ?? log.targetId}</p>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    Type: {log.targetType}
                  </span>
                </td>
                <td className="p-4 font-mono text-muted-foreground">
                  {log.oldValue ? (
                    <span>
                      {log.oldValue} → <strong className="text-emerald-400">{log.newValue}</strong>
                    </span>
                  ) : (
                    <strong className="text-emerald-400">{log.newValue}</strong>
                  )}
                </td>
                <td className="p-4 text-muted-foreground max-w-xs">{log.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
