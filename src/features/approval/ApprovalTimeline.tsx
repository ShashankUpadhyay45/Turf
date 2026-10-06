import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';
import type { ListingApprovalStatus } from '@/types';

interface ApprovalTimelineProps {
  status: ListingApprovalStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  changesRequestedNote?: string;
}

export function ApprovalTimeline({
  status,
  submittedAt,
  approvedAt,
  rejectionReason,
  changesRequestedNote,
}: ApprovalTimelineProps) {
  const steps = [
    {
      title: 'Draft Created',
      desc: 'Venue details, amenities & photos configured',
      done: true,
      current: status === 'DRAFT',
    },
    {
      title: 'Submitted for Review',
      desc: submittedAt
        ? `Sent on ${new Date(submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
        : 'Awaiting submission by owner',
      done: status !== 'DRAFT',
      current: status === 'PENDING_REVIEW',
    },
    {
      title: 'Admin Verification',
      desc:
        status === 'APPROVED'
          ? `Approved on ${approvedAt ? new Date(approvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'recently'}`
          : status === 'CHANGES_REQUESTED'
            ? 'Corrections requested by inspection team'
            : status === 'REJECTED'
              ? 'Listing rejected by platform compliance'
              : 'Documentation & coordinates check in progress',
      done: status === 'APPROVED',
      current: status === 'CHANGES_REQUESTED' || status === 'REJECTED',
      isError: status === 'REJECTED',
      isWarning: status === 'CHANGES_REQUESTED',
    },
    {
      title: 'Live & Bookable',
      desc: status === 'APPROVED' ? 'Turf is active for player bookings' : 'Requires admin approval',
      done: status === 'APPROVED',
      current: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-[11px] before:w-[2px] before:bg-border">
        {steps.map((step, idx) => {
          let iconBg = 'bg-muted text-muted-foreground';
          let borderCol = 'border-border';

          if (step.done) {
            iconBg = 'bg-emerald-500 text-white';
            borderCol = 'border-emerald-500';
          } else if (step.isError) {
            iconBg = 'bg-rose-500 text-white';
            borderCol = 'border-rose-500';
          } else if (step.isWarning) {
            iconBg = 'bg-amber-500 text-white';
            borderCol = 'border-amber-500';
          } else if (step.current) {
            iconBg = 'bg-primary text-primary-foreground animate-pulse';
            borderCol = 'border-primary';
          }

          return (
            <div key={step.title} className="relative flex items-start gap-3">
              <span
                className={`absolute -left-6 flex size-6 items-center justify-center rounded-full border-2 ${borderCol} ${iconBg} shadow-sm`}
              >
                {step.done ? (
                  <Check className="size-3.5" />
                ) : step.isError ? (
                  <XCircle className="size-3.5" />
                ) : step.isWarning ? (
                  <AlertTriangle className="size-3.5" />
                ) : (
                  <Clock className="size-3" />
                )}
              </span>

              <div>
                <h4 className="text-sm font-extrabold text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {changesRequestedNote && status === 'CHANGES_REQUESTED' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <p className="font-extrabold uppercase tracking-wider text-amber-400">Admin Feedback Note:</p>
          <p className="mt-1 leading-relaxed">{changesRequestedNote}</p>
        </div>
      )}

      {rejectionReason && status === 'REJECTED' && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200">
          <p className="font-extrabold uppercase tracking-wider text-rose-400">Rejection Reason:</p>
          <p className="mt-1 leading-relaxed">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
