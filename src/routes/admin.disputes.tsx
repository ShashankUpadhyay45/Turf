import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ShieldAlert, CheckCircle, Clock, Search, ExternalLink } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export const Route = createFileRoute('/admin/disputes')({
  head: () => ({
    meta: [
      { title: 'Disputes & Refunds — SuperAdmin' },
      { name: 'description', content: 'Arbitrate customer booking disputes, refund requests, and cancellation compensation.' },
    ],
  }),
  component: AdminDisputesPage,
});

function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([
    {
      id: 'disp-101',
      bookingId: 'TB-2026-88124',
      playerName: 'Ayush Sharma',
      turfName: 'Champions Arena',
      reason: 'Floodlight outage during 2nd half of match (30 mins lost).',
      amount: 400,
      status: 'OPEN',
      date: '2026-09-28',
    },
    {
      id: 'disp-102',
      bookingId: 'TB-2026-66412',
      playerName: 'Kabir Singh',
      turfName: 'Greenfield Box',
      reason: 'Double booking conflict with offline tournament group.',
      amount: 500,
      status: 'RESOLVED_REFUNDED',
      date: '2026-09-24',
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const handleResolve = (id: string, action: 'refund' | 'reject') => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: action === 'refund' ? 'RESOLVED_REFUNDED' : 'RESOLVED_REJECTED',
            }
          : d
      )
    );
    setToast(
      action === 'refund'
        ? `Dispute #${id} resolved: Full refund initiated to player.`
        : `Dispute #${id} dismissed.`
    );
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Arbitration & Fair Play</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">CUSTOMER DISPUTES</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Investigate match discrepancies, lighting failures, and process refund compensations.
          </p>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Disputes Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Dispute ID</th>
              <th className="p-4">Player & Booking</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Reason / Issue</th>
              <th className="p-4">Claim Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Arbitration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {disputes.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition">
                <td className="p-4 font-mono font-bold text-xs">#{d.id}</td>
                <td className="p-4">
                  <p className="font-bold text-foreground">{d.playerName}</p>
                  <p className="text-xs text-muted-foreground">Ref #{d.bookingId}</p>
                </td>
                <td className="p-4 font-bold text-foreground">{d.turfName}</td>
                <td className="p-4 text-xs text-muted-foreground max-w-xs">{d.reason}</td>
                <td className="p-4 font-black text-foreground">₹{d.amount}</td>
                <td className="p-4">
                  <Badge tone={d.status === 'RESOLVED_REFUNDED' ? 'green' : d.status === 'OPEN' ? 'gold' : 'neutral'}>
                    {d.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-right space-x-2">
                  {d.status === 'OPEN' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(d.id, 'refund')}
                        className="text-xs"
                      >
                        Approve Refund
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolve(d.id, 'reject')}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">Closed</span>
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
