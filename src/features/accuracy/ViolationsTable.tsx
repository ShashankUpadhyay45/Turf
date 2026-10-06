import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { AvailabilityViolation } from '@/types';

interface ViolationsTableProps {
  violations: AvailabilityViolation[];
  isAdmin?: boolean;
  onResolve?: (violationId: string, resolutionNote: string) => void;
}

export function ViolationsTable({ violations, isAdmin = false, onResolve }: ViolationsTableProps) {
  const [selectedViolation, setSelectedViolation] = useState<AvailabilityViolation | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedViolation && onResolve && resolutionInput.trim()) {
      onResolve(selectedViolation.id, resolutionInput);
      setSelectedViolation(null);
      setResolutionInput('');
    }
  };

  return (
    <div className="card-shell overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
          <tr>
            <th className="p-4">Violation / Incident</th>
            <th className="p-4">Venue & Slot</th>
            <th className="p-4">Severity</th>
            <th className="p-4">Penalty</th>
            <th className="p-4">Status</th>
            {isAdmin && <th className="p-4 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {violations.length > 0 ? (
            violations.map((v) => {
              const isResolved = v.status === 'RESOLVED';
              return (
                <tr key={v.id} className="hover:bg-muted/30 transition">
                  <td className="p-4">
                    <p className="font-extrabold text-foreground">{v.violationType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{v.evidenceNote}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-foreground">{v.turfName}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.slotDate} · {v.slotTime}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-black ${
                        v.severity === 'CRITICAL' || v.severity === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-500'
                          : v.severity === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-rose-500">
                    -{v.negativePoints} pts
                  </td>
                  <td className="p-4">
                    <Badge tone={isResolved ? 'green' : 'gold'}>
                      {isResolved ? (
                        <>
                          <CheckCircle className="size-3 mr-1" /> Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="size-3 mr-1" /> {v.status.replace(/_/g, ' ')}
                        </>
                      )}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      {!isResolved && onResolve && (
                        <button
                          onClick={() => setSelectedViolation(v)}
                          className="rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-muted-foreground">
                <CheckCircle className="mx-auto size-8 text-emerald-500 mb-2" />
                No availability violations on record. Clean operating record!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Admin Resolution Dialog */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-md p-6">
            <h3 className="font-display text-xl font-black">RESOLVE VIOLATION</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Incident ID: #{selectedViolation.id} · {selectedViolation.turfName}
            </p>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold">Resolution Notes / Action Taken</label>
                <textarea
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  required
                  placeholder="e.g. Owner verified customer refund was processed and updated ground calendar..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setSelectedViolation(null)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Resolution</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
