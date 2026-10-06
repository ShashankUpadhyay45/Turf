import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  IndianRupee,
  Clock3,
  ShieldCheck,
  Users,
  XCircle,
  MapPin,
  Trophy,
  AlertTriangle,
  FileCheck2,
  AlertOctagon,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActionLink, Badge, Button, SectionHeading } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useBookingStore } from '@/store/useBookingStore';
import { mockUsers } from '@/data/mock-users';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [
      { title: 'SuperAdmin Command Center — Playo' },
      { name: 'description', content: 'Platform governance, venue approval workflows, dispute arbitration, and audit logs.' },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const turfs = useOwnerStore((s) => s.turfs);
  const violations = useOwnerStore((s) => s.violations);
  const allBookings = useBookingStore((s) => s.bookings);

  const pendingApprovals = useMemo(
    () => turfs.filter((t) => t.approvalStatus !== 'APPROVED'),
    [turfs]
  );
  const pendingApprovalsCount = pendingApprovals.length;
  const activeViolationsCount = violations.filter((v) => v.status !== 'RESOLVED').length;

  const stats = [
    { icon: Users, label: 'Platform Users', value: '1,420', change: '+18% MoM', link: '/admin/users' },
    { icon: MapPin, label: 'Registered Turfs', value: String(turfs.length), change: `${pendingApprovalsCount} pending review`, link: '/admin/turfs' },
    { icon: CalendarCheck, label: 'Total Bookings', value: String(allBookings.length + 380), change: '+32 this week', link: '/admin/bookings' },
    { icon: IndianRupee, label: 'Gross Volume', value: '₹3.85L', change: '₹57,750 commission (15%)', link: '/admin/revenue' },
    { icon: AlertTriangle, label: 'Active Violations', value: String(activeViolationsCount), change: 'Negative points ledger', link: '/admin/availability-violations' },
  ];

  return (
    <div className="container-page py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Platform Governance & Integrity</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">SUPERADMIN COMMAND CENTER</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor verified sports grounds, enforce availability accuracy, review listings, and review audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingApprovalsCount > 0 && (
            <ActionLink to="/admin/turf-requests" variant="primary" className="text-xs">
              <FileCheck2 className="size-4 mr-1.5" />
              Review Pending Requests ({pendingApprovalsCount})
            </ActionLink>
          )}
          <ActionLink to="/admin/availability-violations" variant="secondary" className="text-xs">
            <AlertTriangle className="size-4 mr-1.5 text-amber-500" />
            Violations Ledger
          </ActionLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.link}
              className="card-shell p-4 hover:border-primary/60 transition group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <Icon className="size-5 text-info" />
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground font-bold">{s.label}</p>
              <p className="font-display text-3xl font-black">{s.value}</p>
              <p className="text-[11px] font-bold text-success mt-1">{s.change}</p>
            </Link>
          );
        })}
      </div>

      {/* Pending Approval Alert Banner */}
      {pendingApprovalsCount > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-amber-200">
                {pendingApprovalsCount} VENUE LISTING REQUESTS AWAITING INSPECTION
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                New venues submitted by ground owners require documentation and safety compliance sign-off.
              </p>
            </div>
          </div>
          <ActionLink to="/admin/turf-requests" variant="primary" className="text-xs shrink-0">
            Open Review Queue →
          </ActionLink>
        </div>
      )}

      {/* Module Fast Navigation Grid */}
      <section className="space-y-4">
        <SectionHeading eyebrow="Quick navigation" title="ADMINISTRATION CONSOLES" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Turf Approval Queue',
              desc: 'Approve, reject, or request changes on new venue registrations.',
              to: '/admin/turf-requests',
              badge: `${pendingApprovalsCount} Pending`,
              tone: 'gold' as const,
            },
            {
              title: 'Negative Marking Ledger',
              desc: 'Enforce availability accuracy and manage penalty points.',
              to: '/admin/availability-violations',
              badge: `${activeViolationsCount} Active`,
              tone: 'neutral' as const,
            },
            {
              title: 'User & Owner Directory',
              desc: 'Inspect registered accounts, roles, and KYC statuses.',
              to: '/admin/users',
              badge: '1,420 Users',
              tone: 'blue' as const,
            },
            {
              title: 'System Audit Logs',
              desc: 'Full immutable compliance trail of platform modifications.',
              to: '/admin/audit-logs',
              badge: 'Compliant',
              tone: 'green' as const,
            },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="card-shell p-5 hover:border-primary transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-display text-xl font-black">{item.title}</h4>
                  <Badge tone={item.tone}>{item.badge}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs font-bold text-primary flex items-center gap-1">
                Open Console <ArrowRight className="size-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Bookings Platform Snapshot */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Live reservations"
          title="PLATFORM BOOKINGS FEED"
          action={
            <Link to="/admin/bookings" className="text-sm font-bold text-primary hover:underline">
              View all bookings →
            </Link>
          }
        />
        <div className="card-shell overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
              <tr>
                <th className="p-4">Ref Code</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Player</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allBookings.slice(0, 6).map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-mono font-bold text-xs">#{b.referenceCode}</td>
                  <td className="p-4 font-bold">{b.turfName}</td>
                  <td className="p-4 text-xs text-muted-foreground">{b.userName ?? 'Player'}</td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {b.date} · {b.startTime}
                  </td>
                  <td className="p-4 font-black">₹{b.finalPrice}</td>
                  <td className="p-4">
                    <Badge tone={b.status === 'confirmed' ? 'green' : 'neutral'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
