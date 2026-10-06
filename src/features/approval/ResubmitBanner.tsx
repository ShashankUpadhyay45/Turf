import React from 'react';
import { AlertCircle, ArrowRight, RefreshCw, XCircle } from 'lucide-react';
import { ActionLink, Button } from '@/components/ui';
import type { ListingApprovalStatus } from '@/types';

interface ResubmitBannerProps {
  status: ListingApprovalStatus;
  turfId: string;
  rejectionReason?: string;
  changesRequestedNote?: string;
  onResubmit?: () => void;
}

export function ResubmitBanner({
  status,
  turfId,
  rejectionReason,
  changesRequestedNote,
  onResubmit,
}: ResubmitBannerProps) {
  if (status !== 'CHANGES_REQUESTED' && status !== 'REJECTED') {
    return null;
  }

  const isChanges = status === 'CHANGES_REQUESTED';

  return (
    <div
      className={`rounded-xl border p-5 ${
        isChanges
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div
            className={`grid size-9 shrink-0 place-items-center rounded-lg ${
              isChanges ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isChanges ? <AlertCircle className="size-5" /> : <XCircle className="size-5" />}
          </div>
          <div>
            <h4 className="font-display text-lg font-black tracking-wide">
              {isChanges ? 'ACTION REQUIRED: CHANGES REQUESTED BY ADMIN' : 'LISTING REJECTED'}
            </h4>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              {isChanges
                ? changesRequestedNote ?? 'Admin requested corrections before this turf can go live.'
                : rejectionReason ?? 'This venue listing did not pass platform compliance.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ActionLink to={`/owner/turfs/${turfId}/edit`} variant="secondary" className="text-xs">
            Edit Listing
          </ActionLink>
          {onResubmit && (
            <Button onClick={onResubmit} className="text-xs">
              <RefreshCw className="size-3.5 mr-1.5" />
              Resubmit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
