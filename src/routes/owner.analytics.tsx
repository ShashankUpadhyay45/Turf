import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CalendarCheck,
  IndianRupee,
  Clock3,
  Percent,
  UserCheck,
  Download,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';

export const Route = createFileRoute('/owner/analytics')({
  head: () => ({
    meta: [
      { title: 'Venue Analytics & KPIs — Playo Owner' },
      { name: 'description', content: 'In-depth financial, occupancy, and player footfall analytics.' },
    ],
  }),
  component: OwnerAnalyticsPage,
});

function OwnerAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Realistic mock data corresponding to timeframe
  const revenueData = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        { time: '06 AM', revenue: 600, bookings: 1 },
        { time: '08 AM', revenue: 1200, bookings: 2 },
        { time: '10 AM', revenue: 800, bookings: 1 },
        { time: '04 PM', revenue: 1400, bookings: 2 },
        { time: '06 PM', revenue: 2400, bookings: 3 },
        { time: '08 PM', revenue: 3200, bookings: 4 },
        { time: '10 PM', revenue: 1600, bookings: 2 },
      ];
    }
    if (timeframe === 'weekly') {
      return [
        { day: 'Mon', revenue: 12400, bookings: 18 },
        { day: 'Tue', revenue: 9800, bookings: 14 },
        { day: 'Wed', revenue: 14200, bookings: 20 },
        { day: 'Thu', revenue: 16500, bookings: 23 },
        { day: 'Fri', revenue: 28400, bookings: 36 },
        { day: 'Sat', revenue: 38900, bookings: 48 },
        { day: 'Sun', revenue: 34200, bookings: 44 },
      ];
    }
    if (timeframe === 'yearly') {
      return [
        { month: 'Jan', revenue: 95000, bookings: 130 },
        { month: 'Feb', revenue: 110000, bookings: 148 },
        { month: 'Mar', revenue: 128000, bookings: 165 },
        { month: 'Apr', revenue: 142000, bookings: 180 },
        { month: 'May', revenue: 138000, bookings: 172 },
        { month: 'Jun', revenue: 120000, bookings: 155 },
        { month: 'Jul', revenue: 115000, bookings: 150 },
        { month: 'Aug', revenue: 134000, bookings: 170 },
        { month: 'Sep', revenue: 148500, bookings: 184 },
      ];
    }
    // Monthly (weeks of current month)
    return [
      { week: 'Week 1', revenue: 32400, bookings: 42 },
      { week: 'Week 2', revenue: 36800, bookings: 46 },
      { week: 'Week 3', revenue: 38200, bookings: 48 },
      { week: 'Week 4', revenue: 41100, bookings: 52 },
    ];
  }, [timeframe]);

  const peakHourData = [
    { hour: '06-08 AM', occupancy: 65 },
    { hour: '08-10 AM', occupancy: 48 },
    { hour: '10-04 PM', occupancy: 28 },
    { hour: '04-06 PM', occupancy: 74 },
    { hour: '06-08 PM', occupancy: 96 },
    { hour: '08-10 PM', occupancy: 98 },
    { hour: '10-12 AM', occupancy: 60 },
  ];

  const sportShareData = [
    { name: 'Football 7-a-side', value: 62, color: '#10b981' },
    { name: 'Box Cricket', value: 28, color: '#3b82f6' },
    { name: 'Badminton', value: 10, color: '#8b5cf6' },
  ];

  const playerRetentionData = [
    { name: 'Repeat Captains', value: 64, color: '#10b981' },
    { name: 'New Discoveries', value: 36, color: '#64748b' },
  ];

  const kpis = [
    {
      label: 'Gross Revenue',
      value: timeframe === 'yearly' ? '₹11.3L' : timeframe === 'weekly' ? '₹1.54L' : '₹1,48,500',
      change: '+18.2%',
      icon: IndianRupee,
      desc: 'vs previous period',
    },
    {
      label: 'Total Bookings',
      value: timeframe === 'yearly' ? '1,454' : timeframe === 'weekly' ? '203' : '184 Games',
      change: '+14.6%',
      icon: CalendarCheck,
      desc: 'Occupied slots',
    },
    {
      label: 'Average Occupancy',
      value: '79.4%',
      change: '+6.1%',
      icon: Percent,
      desc: 'Day & night capacity',
    },
    {
      label: 'Total Footfall',
      value: '1,840',
      change: '+22%',
      icon: Users,
      desc: 'Active sports players',
    },
    {
      label: 'Avg Booking Value',
      value: '₹807',
      change: '+4.2%',
      icon: TrendingUp,
      desc: 'Per game receipt',
    },
    {
      label: 'Cancellation Rate',
      value: '4.1%',
      change: '-2.7%',
      icon: Clock3,
      desc: 'Platform benchmark: 8%',
    },
  ];

  return (
    <div className="container-page py-10 space-y-8">
      {/* Header with Timeframe Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Financial & Operational Metrics</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PERFORMANCE ANALYTICS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor match utilization, revenue yields, peak demand, and cohort retention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border bg-secondary/60 p-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded px-3 py-1.5 text-xs font-bold capitalize transition ${
                  timeframe === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" className="text-xs">
            <Download className="size-3.5 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="card-shell p-4 hover:border-primary/50 transition">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">{kpi.label}</span>
                <Icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-foreground">
                {kpi.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-emerald-500">{kpi.change}</span>
                <span className="text-muted-foreground">{kpi.desc}</span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Main Revenue Trend Chart */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Revenue Trajectory</span>
            <h3 className="font-display text-2xl font-black">GROSS TURNOVER TREND</h3>
          </div>
          <Badge tone="green">Verified Ledger</Badge>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.4} />
              <XAxis
                dataKey={timeframe === 'daily' ? 'time' : timeframe === 'weekly' ? 'day' : timeframe === 'yearly' ? 'month' : 'week'}
                stroke="#888888"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#262626',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Deep Dive */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Hours Occupancy Bar Chart */}
        <div className="card-shell p-6 space-y-4">
          <div>
            <span className="eyebrow">Time Window Utilization</span>
            <h3 className="font-display text-2xl font-black">PEAK HOURS OCCUPANCY</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Average slot fill percentage across all operating hours.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.4} />
                <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="occupancy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Distribution & Retention Donut Charts */}
        <div className="card-shell p-6 space-y-4 flex flex-col justify-between">
          <div>
            <span className="eyebrow">Category Breakdown</span>
            <h3 className="font-display text-2xl font-black">SPORT SHARE & RETENTION</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sport Share */}
            <div className="text-center">
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportShareData}
                      dataKey="value"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                    >
                      {sportShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="font-display text-xs font-bold text-muted-foreground uppercase">Revenue by Sport</p>
              <div className="mt-2 space-y-1 text-[11px] font-bold">
                <div className="text-emerald-500">Football: 62%</div>
                <div className="text-blue-500">Box Cricket: 28%</div>
                <div className="text-purple-500">Badminton: 10%</div>
              </div>
            </div>

            {/* Retention */}
            <div className="text-center">
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={playerRetentionData}
                      dataKey="value"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                    >
                      {playerRetentionData.map((entry, index) => (
                        <Cell key={`cell-ret-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="font-display text-xs font-bold text-muted-foreground uppercase">Player Retention</p>
              <div className="mt-2 space-y-1 text-[11px] font-bold">
                <div className="text-emerald-500">64% Repeat Captains</div>
                <div className="text-slate-400">36% New Users</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>Top Sport: <strong>Football 7-a-side</strong></span>
            <span>Peak Day: <strong>Saturday (48 games)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
