import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';

export const Route = createFileRoute('/admin/settings')({
  head: () => ({
    meta: [
      { title: 'Platform Governance Settings — SuperAdmin' },
      { name: 'description', content: 'Configure platform commission rate, slot hold expirations, and negative marking thresholds.' },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [config, setConfig] = useState({
    commissionRate: 15,
    holdDurationMinutes: 10,
    penaltyThreshold: 50,
    cancellationWindowHours: 4,
    freeTierDiscount: 0,
    playTierDiscount: 10,
    proTierDiscount: 20,
  });

  const [toast, setToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6 max-w-4xl">
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Platform Configuration</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black">PLATFORM SETTINGS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global policies for booking cart holds, commission percentages, and negative marking penalty thresholds.
        </p>
      </div>

      {toast && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          Platform configuration policies updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-shell p-6 space-y-4">
          <h2 className="font-display text-2xl font-black">Monetization & Commission</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold">
              Platform Take-Rate / Commission (%)
              <input
                type="number"
                value={config.commissionRate}
                onChange={(e) => setConfig({ ...config, commissionRate: Number(e.target.value) })}
                className="h-10 rounded border border-input bg-background px-3 font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground">Default 15% collected on gross matches</span>
            </label>

            <label className="grid gap-1 text-xs font-bold">
              Cart Hold Expiration (Minutes)
              <input
                type="number"
                value={config.holdDurationMinutes}
                onChange={(e) => setConfig({ ...config, holdDurationMinutes: Number(e.target.value) })}
                className="h-10 rounded border border-input bg-background px-3 font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground">Releases unconfirmed slots back to public</span>
            </label>
          </div>
        </div>

        <div className="card-shell p-6 space-y-4">
          <h2 className="font-display text-2xl font-black">Integrity & Quality Enforcement</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold">
              Listing Suspension Penalty Threshold (Negative Points)
              <input
                type="number"
                value={config.penaltyThreshold}
                onChange={(e) => setConfig({ ...config, penaltyThreshold: Number(e.target.value) })}
                className="h-10 rounded border border-input bg-background px-3 font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground">Listings hidden automatically at 50 points</span>
            </label>

            <label className="grid gap-1 text-xs font-bold">
              Standard Player Cancellation Window (Hours)
              <input
                type="number"
                value={config.cancellationWindowHours}
                onChange={(e) => setConfig({ ...config, cancellationWindowHours: Number(e.target.value) })}
                className="h-10 rounded border border-input bg-background px-3 font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground">Full refund allowed up to 4 hours before kickoff</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="size-4 mr-1.5" /> Save Global Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
