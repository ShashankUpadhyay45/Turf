import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Filter,
  Ban,
  Clock,
  Send,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';
import { ViolationsTable } from '@/features/accuracy/ViolationsTable';
import type { ViolationSeverity, ViolationStatus, AvailabilityViolation } from '@/types';

export const Route = createFileRoute('/admin/availability-violations')({
  head: () => ({
    meta: [
      { title: 'Availability Violations & Penalties — SuperAdmin' },
      { name: 'description', content: 'Track negative marking ledger, resolve booking incidents, and suspend repeated offenders.' },
    ],
  }),
  component: AdminViolationsPage,
});

function AdminViolationsPage() {
  const violations = useOwnerStore((s) => s.violations);
  const resolveViolation = useOwnerStore((s) => s.resolveViolation);
  const addViolation = useOwnerStore((s) => s.addViolation);

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newViolationModal, setNewViolationModal] = useState(false);
  const [newViolationForm, setNewViolationForm] = useState({
    turfName: 'Champions Arena',
    turfId: 'champions-arena',
    ownerName: 'Champions Sports Group',
    ownerId: 'owner-1',
    slotDate: new Date().toISOString().split('T')[0]!,
    slotTime: '08:00 PM',
    violationType: 'OFFLINE_OVERBOOKING' as const,
    severity: 'MEDIUM' as ViolationSeverity,
    negativePoints: 5,
    evidenceNote: 'Customer confirmed walk-in took over turf without system declaration.',
  });

  const filteredViolations = useMemo(() => {
    let list = violations;
    if (severityFilter !== 'all') {
      list = list.filter((v) => v.severity === severityFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((v) => v.status === statusFilter);
    }
    return list;
  }, [violations, severityFilter, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResolve = (violationId: string, note: string) => {
    resolveViolation(violationId, note);
    showToast(`Violation #${violationId} resolved successfully.`);
  };

  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const item: AvailabilityViolation = {
      id: `viol-${Date.now()}`,
      ...newViolationForm,
      expectedStatus: 'available',
      reportedStatus: 'unavailable',
      status: 'WARNING_ISSUED',
      createdAt: new Date().toISOString(),
    };
    addViolation(item);
    setNewViolationModal(false);
    showToast('New violation penalty logged onto owner ledger.');
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Integrity & Quality Enforcement</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">AVAILABILITY VIOLATIONS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Negative marking penalty ledger for offline overbooking, unannounced closures, and false availability declarations.
          </p>
        </div>

        <Button onClick={() => setNewViolationModal(true)} variant="primary">
          <AlertTriangle className="size-4 mr-1.5" /> Log Inspection Violation
        </Button>
      </div>

      {toastMessage && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card-shell p-4">
          <span className="text-xs text-muted-foreground font-bold">Total Violations</span>
          <p className="font-display text-3xl font-black">{violations.length}</p>
        </div>
        <div className="card-shell p-4">
          <span className="text-xs text-muted-foreground font-bold">Active Warnings</span>
          <p className="font-display text-3xl font-black text-amber-500">
            {violations.filter((v) => v.status === 'WARNING_ISSUED').length}
          </p>
        </div>
        <div className="card-shell p-4">
          <span className="text-xs text-muted-foreground font-bold">Resolved Incidents</span>
          <p className="font-display text-3xl font-black text-emerald-500">
            {violations.filter((v) => v.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="card-shell p-4">
          <span className="text-xs text-muted-foreground font-bold">High Risk Accounts</span>
          <p className="font-display text-3xl font-black text-rose-500">0 Venues</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          aria-label="Filter severity"
          className="h-9 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter status"
          className="h-9 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="WARNING_ISSUED">Warning Issued</option>
          <option value="RESOLVED">Resolved</option>
          <option value="PENDING_REVIEW">Pending Review</option>
        </select>

        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {filteredViolations.length} incidents logged
        </span>
      </div>

      {/* Interactive Violations Table */}
      <ViolationsTable
        violations={filteredViolations}
        isAdmin={true}
        onResolve={handleResolve}
      />

      {/* Manual Violation Modal */}
      {newViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-lg p-6 space-y-4">
            <h3 className="font-display text-2xl font-black">LOG AVAILABILITY VIOLATION</h3>
            <p className="text-xs text-muted-foreground">
              Assign penalty points to an owner following player complaints or routine field inspection.
            </p>

            <form onSubmit={handleCreateViolation} className="space-y-4 text-xs font-bold">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  Venue Name
                  <input
                    value={newViolationForm.turfName}
                    onChange={(e) => setNewViolationForm({ ...newViolationForm, turfName: e.target.value })}
                    className="h-9 rounded border border-input bg-background px-3 font-normal"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  Owner Entity
                  <input
                    value={newViolationForm.ownerName}
                    onChange={(e) => setNewViolationForm({ ...newViolationForm, ownerName: e.target.value })}
                    className="h-9 rounded border border-input bg-background px-3 font-normal"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  Severity Tier
                  <select
                    value={newViolationForm.severity}
                    onChange={(e) =>
                      setNewViolationForm({
                        ...newViolationForm,
                        severity: e.target.value as ViolationSeverity,
                        negativePoints: e.target.value === 'CRITICAL' ? 20 : e.target.value === 'HIGH' ? 10 : 5,
                      })
                    }
                    className="h-9 rounded border border-input bg-background px-3 font-normal"
                  >
                    <option value="LOW">LOW (-2 pts)</option>
                    <option value="MEDIUM">MEDIUM (-5 pts)</option>
                    <option value="HIGH">HIGH (-10 pts)</option>
                    <option value="CRITICAL">CRITICAL (-20 pts)</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  Negative Points Assigned
                  <input
                    type="number"
                    value={newViolationForm.negativePoints}
                    onChange={(e) =>
                      setNewViolationForm({ ...newViolationForm, negativePoints: Number(e.target.value) })
                    }
                    className="h-9 rounded border border-input bg-background px-3 font-normal font-mono"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-1">
                Evidence Note / Incident Narrative
                <textarea
                  value={newViolationForm.evidenceNote}
                  onChange={(e) => setNewViolationForm({ ...newViolationForm, evidenceNote: e.target.value })}
                  rows={3}
                  className="rounded border border-input bg-background p-2.5 font-normal"
                  required
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setNewViolationModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Log Penalty</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
