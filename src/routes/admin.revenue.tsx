import { createFileRoute } from '@tanstack/react-router';
import { IndianRupee, TrendingUp, Download, Percent, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export const Route = createFileRoute('/admin/revenue')({
  head: () => ({
    meta: [
      { title: 'Platform Revenue & Commission — SuperAdmin' },
      { name: 'description', content: 'Track platform commission, gross merchandise value (GMV), and weekly partner settlements.' },
    ],
  }),
  component: AdminRevenuePage,
});

function AdminRevenuePage() {
  return (
    <div className="container-page py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Financial Settlement & Commission</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PLATFORM REVENUE</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform take-rate (15%), gross transaction volume, and automated weekly merchant payouts.
          </p>
        </div>

        <Button variant="secondary" className="text-xs">
          <Download className="size-4 mr-1.5" /> Export Financial Summary
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-shell p-5">
          <span className="text-xs text-muted-foreground font-bold">Gross Booking Volume (GMV)</span>
          <p className="mt-2 font-display text-3xl font-black text-foreground">₹3,85,000</p>
          <span className="text-xs font-bold text-emerald-400 mt-1 block">+19.4% MoM</span>
        </div>

        <div className="card-shell p-5">
          <span className="text-xs text-muted-foreground font-bold">Platform Commission (15%)</span>
          <p className="mt-2 font-display text-3xl font-black text-primary">₹57,750</p>
          <span className="text-xs font-bold text-emerald-400 mt-1 block">Net Platform Earnings</span>
        </div>

        <div className="card-shell p-5">
          <span className="text-xs text-muted-foreground font-bold">Disbursed to Turf Owners</span>
          <p className="mt-2 font-display text-3xl font-black text-foreground">₹3,27,250</p>
          <span className="text-xs font-bold text-muted-foreground mt-1 block">Weekly settlements</span>
        </div>

        <div className="card-shell p-5">
          <span className="text-xs text-muted-foreground font-bold">Refund Reserve Pool</span>
          <p className="mt-2 font-display text-3xl font-black text-foreground">₹15,000</p>
          <span className="text-xs font-bold text-muted-foreground mt-1 block">Escrow balance</span>
        </div>
      </div>

      {/* Weekly Settlement Run */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl font-black">Recent Partner Settlements</h3>
            <p className="text-xs text-muted-foreground">Automated bank disbursements for completed matches.</p>
          </div>
          <Badge tone="green">All Settled</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-muted text-muted-foreground uppercase font-mono">
              <tr>
                <th className="p-3">Partner Entity</th>
                <th className="p-3">Venues</th>
                <th className="p-3">Gross Match Receipts</th>
                <th className="p-3">Platform Fee (15%)</th>
                <th className="p-3">Net Disbursed</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['Champions Sports Group', '3 Arenas', '₹1,48,500', '₹22,275', '₹1,26,225', 'Completed'],
                ['Greenfield Sports LLP', '1 Ground', '₹68,400', '₹10,260', '₹58,140', 'Completed'],
                ['Capital Turfworks', '2 Arenas', '₹92,000', '₹13,800', '₹78,200', 'Completed'],
                ['Silicon Valley Sports', '2 Arenas', '₹76,100', '₹11,415', '₹64,685', 'Completed'],
              ].map((row) => (
                <tr key={row[0]} className="hover:bg-muted/30">
                  <td className="p-3 font-bold text-foreground">{row[0]}</td>
                  <td className="p-3 text-muted-foreground">{row[1]}</td>
                  <td className="p-3 font-bold">{row[2]}</td>
                  <td className="p-3 text-primary font-bold">{row[3]}</td>
                  <td className="p-3 font-black text-foreground">{row[4]}</td>
                  <td className="p-3">
                    <Badge tone="green">{row[5]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
