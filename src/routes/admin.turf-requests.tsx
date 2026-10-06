import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Eye,
  FileText,
  Building,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ListingStatusBadge } from '@/features/approval/ListingStatusBadge';
import { RejectionReasonDialog } from '@/features/approval/RejectionReasonDialog';
import { ApprovalTimeline } from '@/features/approval/ApprovalTimeline';
import type { Turf } from '@/types';

export const Route = createFileRoute('/admin/turf-requests')({
  head: () => ({
    meta: [
      { title: 'Turf Approval Queue — SuperAdmin' },
      { name: 'description', content: 'Review and approve sports venue listings, inspect documentation and pitch specs.' },
    ],
  }),
  component: AdminTurfRequestsPage,
});

function AdminTurfRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const adminName = user?.name ?? 'SuperAdmin';

  const turfs = useOwnerStore((s) => s.turfs);
  const approveTurf = useOwnerStore((s) => s.approveTurf);
  const rejectTurf = useOwnerStore((s) => s.rejectTurf);
  const requestTurfChanges = useOwnerStore((s) => s.requestTurfChanges);

  const [filter, setFilter] = useState<'pending' | 'changes' | 'all'>('pending');
  const [activeReviewTurf, setActiveReviewTurf] = useState<Turf | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'reject' | 'request_changes';
    turf: Turf | null;
  }>({
    isOpen: false,
    mode: 'reject',
    turf: null,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayTurfs = useMemo(() => {
    if (filter === 'pending') {
      return turfs.filter((t) => t.approvalStatus === 'PENDING_REVIEW');
    }
    if (filter === 'changes') {
      return turfs.filter((t) => t.approvalStatus === 'CHANGES_REQUESTED');
    }
    return turfs.filter((t) => t.approvalStatus !== 'APPROVED');
  }, [turfs, filter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = (turf: Turf) => {
    approveTurf(turf.id, adminName);
    showToast(`Turf "${turf.name}" has been APPROVED and published to the live marketplace.`);
    if (activeReviewTurf?.id === turf.id) setActiveReviewTurf(null);
  };

  const handleDialogSubmit = (reason: string) => {
    if (!dialogState.turf) return;
    if (dialogState.mode === 'reject') {
      rejectTurf(dialogState.turf.id, reason, adminName);
      showToast(`Turf "${dialogState.turf.name}" has been REJECTED.`);
    } else {
      requestTurfChanges(dialogState.turf.id, reason, adminName);
      showToast(`Change request dispatched to owner for "${dialogState.turf.name}".`);
    }
    if (activeReviewTurf?.id === dialogState.turf.id) setActiveReviewTurf(null);
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Listing Compliance & Verification</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">TURF APPROVAL REQUESTS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review submitted sports grounds, verify property deeds and pitch photos, then approve or request revisions.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'pending', label: 'Pending Review' },
          { id: 'changes', label: 'Changes Requested' },
          { id: 'all', label: 'All Unapproved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              filter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Venue Name</th>
              <th className="p-4">Owner / Entity</th>
              <th className="p-4">Location</th>
              <th className="p-4">Rate & Sports</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayTurfs.length > 0 ? (
              displayTurfs.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition">
                  <td className="p-4">
                    <p className="font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.blurb}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-foreground">{t.ownerName ?? 'Turf Owner'}</p>
                    <p className="text-xs text-muted-foreground">ID: #{t.ownerId}</p>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {t.area}, {t.city}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-foreground">₹{t.pricePerHour}/hr</span>
                    <div className="flex gap-1 mt-1">
                      {t.sports.map((s) => (
                        <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <ListingStatusBadge status={t.approvalStatus} />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveReviewTurf(t)}
                      className="text-xs"
                    >
                      <Eye className="size-3.5 mr-1" /> Review Dossier
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(t)}
                      className="text-xs"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" /> Approve
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  <FileCheck2 className="mx-auto size-8 opacity-40 mb-2" />
                  No pending listing applications in this queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Review Drawer Modal */}
      {activeReviewTurf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-3xl font-black">{activeReviewTurf.name}</h3>
                  <ListingStatusBadge status={activeReviewTurf.approvalStatus} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: #{activeReviewTurf.id} · Submitted by {activeReviewTurf.ownerName ?? 'Owner'}
                </p>
              </div>
              <button
                onClick={() => setActiveReviewTurf(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Photos & Primary Specs */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <img
                  src={activeReviewTurf.image}
                  alt={activeReviewTurf.name}
                  className="rounded-lg aspect-[16/10] w-full object-cover border border-border"
                />
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="font-bold text-foreground">Tagline:</span>
                  <p className="text-muted-foreground">{activeReviewTurf.blurb}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="rounded-lg border border-border p-3.5 space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    Pricing Breakdown
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-muted-foreground">Standard:</span>
                      <p className="font-bold text-sm">₹{activeReviewTurf.pricePerHour}/hr</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peak (7-10 PM):</span>
                      <p className="font-bold text-sm">₹{activeReviewTurf.peakPricePerHour ?? '—'}/hr</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weekend:</span>
                      <p className="font-bold text-sm">₹{activeReviewTurf.weekendPricePerHour ?? '—'}/hr</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3.5 space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    Location & GPS Coordinates
                  </h4>
                  <p className="text-muted-foreground">{activeReviewTurf.address}</p>
                  <p className="font-mono text-muted-foreground">
                    Lat: {activeReviewTurf.latitude} | Lng: {activeReviewTurf.longitude}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    Amenities Declared
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {activeReviewTurf.amenities.map((am) => (
                      <Badge key={am} tone="blue">
                        {am}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submitted Documents Inspection Checklist */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="font-display text-lg font-black flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Submitted Compliance Documents
              </h4>
              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded border border-border p-2.5 flex items-center justify-between">
                  <span>Venue Lease / Ownership Deed</span>
                  <ShieldCheck className="size-4 text-emerald-400" />
                </div>
                <div className="rounded border border-border p-2.5 flex items-center justify-between">
                  <span>Municipal Fire Safety Certificate</span>
                  <span className="text-[10px] text-amber-400 font-bold">Needs Review</span>
                </div>
                <div className="rounded border border-border p-2.5 flex items-center justify-between">
                  <span>GST Registration Certificate</span>
                  <ShieldCheck className="size-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Approval Progress History */}
            <div className="border-t border-border pt-4">
              <h4 className="font-display text-lg font-black mb-3">Verification Lifecycle</h4>
              <ApprovalTimeline
                status={activeReviewTurf.approvalStatus}
                submittedAt={activeReviewTurf.submittedAt}
                approvedAt={activeReviewTurf.approvedAt}
                rejectionReason={activeReviewTurf.rejectionReason}
                changesRequestedNote={activeReviewTurf.changesRequestedNote}
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <Button variant="secondary" onClick={() => setActiveReviewTurf(null)}>
                Close Preview
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="dark"
                  onClick={() =>
                    setDialogState({
                      isOpen: true,
                      mode: 'reject',
                      turf: activeReviewTurf,
                    })
                  }
                >
                  <XCircle className="size-4 mr-1 text-destructive" /> Reject Listing
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setDialogState({
                      isOpen: true,
                      mode: 'request_changes',
                      turf: activeReviewTurf,
                    })
                  }
                >
                  <AlertTriangle className="size-4 mr-1 text-amber-500" /> Request Changes
                </Button>
                <Button onClick={() => handleApprove(activeReviewTurf)}>
                  <CheckCircle2 className="size-4 mr-1" /> Approve & Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Changes Dialog */}
      <RejectionReasonDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        turfName={dialogState.turf?.name ?? 'Venue'}
        onClose={() => setDialogState({ isOpen: false, mode: 'reject', turf: null })}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
