import React from 'react';
import { ShieldCheck, MapPin, FileClock, AlertOctagon, CheckCircle2 } from 'lucide-react';
import type { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function VerificationBadge({ status, className = '', size = 'sm' }: VerificationBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const iconSize = isSm ? 'size-3' : 'size-3.5';

  switch (status) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 ${sizeClasses} ${className}`}
        >
          <ShieldCheck className={iconSize} />
          Verified Turf
        </span>
      );
    case 'LOCATION_VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30 ${sizeClasses} ${className}`}
        >
          <MapPin className={iconSize} />
          Location Verified
        </span>
      );
    case 'DOCUMENTS_PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          <FileClock className={iconSize} />
          Documents Pending
        </span>
      );
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 ${sizeClasses} ${className}`}
        >
          <AlertOctagon className={iconSize} />
          Verification Failed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-muted text-muted-foreground border border-border ${sizeClasses} ${className}`}
        >
          Unverified
        </span>
      );
  }
}

export function VerifiedOwnerBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 ${className}`}
    >
      <CheckCircle2 className="size-3" />
      Verified Owner
    </span>
  );
}
