import React, { useState } from 'react';
import { XCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface RejectionReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  mode?: 'reject' | 'request_changes';
  turfName: string;
}

export function RejectionReasonDialog({
  isOpen,
  onClose,
  onSubmit,
  mode = 'reject',
  turfName,
}: RejectionReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isReject = mode === 'reject';
  const title = isReject ? 'Reject Turf Listing' : 'Request Changes from Owner';
  const Icon = isReject ? XCircle : AlertTriangle;
  const toneColor = isReject ? 'text-destructive' : 'text-amber-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide detailed feedback for the venue owner.');
      return;
    }
    onSubmit(reason);
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="card-shell w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <Icon className={`size-6 ${toneColor}`} />
          <div>
            <h3 className="font-display text-xl font-black">{title}</h3>
            <p className="text-xs text-muted-foreground">{turfName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground">
              {isReject ? 'Specific compliance reason for rejection:' : 'Required corrections / missing documents:'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              placeholder={
                isReject
                  ? 'e.g. Venue lease deed could not be verified with municipal authorities...'
                  : 'e.g. Please upload higher resolution photos of the locker rooms and emergency exits...'
              }
              className="mt-1.5 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="mt-1 text-xs text-destructive font-bold">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={isReject ? 'dark' : 'primary'}
              type="submit"
            >
              {isReject ? 'Confirm Rejection' : 'Send Change Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
