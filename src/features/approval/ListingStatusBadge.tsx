import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileEdit, 
  Ban 
} from 'lucide-react';
import type { ListingApprovalStatus } from '@/types';

interface ListingStatusBadgeProps {
  status: ListingApprovalStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function ListingStatusBadge({ status, className = '', size = 'sm' }: ListingStatusBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  const iconSize = isSm ? 'size-3' : 'size-3.5';

  switch (status) {
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className={iconSize} />
          Published
        </span>
      );
    case 'PENDING_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          <Clock className={iconSize} />
          Pending Review
        </span>
      );
    case 'CHANGES_REQUESTED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30 ${sizeClasses} ${className}`}
        >
          <AlertCircle className={iconSize} />
          Changes Requested
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 ${sizeClasses} ${className}`}
        >
          <XCircle className={iconSize} />
          Rejected
        </span>
      );
    case 'SUSPENDED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-red-600/10 text-red-600 border border-red-600/30 ${sizeClasses} ${className}`}
        >
          <Ban className={iconSize} />
          Suspended
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-muted text-muted-foreground border border-border ${sizeClasses} ${className}`}
        >
          <FileEdit className={iconSize} />
          Draft
        </span>
      );
  }
}
