import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import type { AvailabilityAccuracy } from '@/types';

interface AccuracyScoreCardProps {
  accuracy: AvailabilityAccuracy;
  className?: string;
}

export function AccuracyScoreCard({ accuracy, className = '' }: AccuracyScoreCardProps) {
  const isHealthy = accuracy.riskLevel === 'LOW';
  const isElevated = accuracy.riskLevel === 'ELEVATED';
  const isHighRisk = accuracy.riskLevel === 'HIGH' || accuracy.riskLevel === 'CRITICAL';

  const riskBadgeClasses = isHealthy
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    : isElevated
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-500 border-rose-500/30';

  const progressPercent = Math.min(100, Math.round((accuracy.negativePointsTotal / accuracy.suspensionThreshold) * 100));

  return (
    <div className={`card-shell p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Trust & Quality Metrics</span>
          <h3 className="font-display text-2xl font-black">AVAILABILITY ACCURACY</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${riskBadgeClasses}`}>
          {accuracy.riskLevel} RISK
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card/60 p-3.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Accuracy Score</p>
          <p className="mt-1 font-display text-3xl font-black text-foreground">
            {accuracy.accuracyScore}%
          </p>
          <span className="text-[10px] text-emerald-500 font-bold">Target &gt; 95%</span>
        </div>

        <div className="rounded-lg border border-border bg-card/60 p-3.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Negative Points</p>
          <p className={`mt-1 font-display text-3xl font-black ${accuracy.negativePointsTotal > 0 ? 'text-destructive' : 'text-foreground'}`}>
            -{accuracy.negativePointsTotal}
          </p>
          <span className="text-[10px] text-muted-foreground font-bold">Max 50 pts</span>
        </div>

        <div className="rounded-lg border border-border bg-card/60 p-3.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Active Warnings</p>
          <p className="mt-1 font-display text-3xl font-black text-foreground">
            {accuracy.activeWarningsCount}
          </p>
          <span className="text-[10px] text-muted-foreground font-bold">System Notices</span>
        </div>

        <div className="rounded-lg border border-border bg-card/60 p-3.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Evaluated Slots</p>
          <p className="mt-1 font-display text-3xl font-black text-foreground">
            {accuracy.accurateSlotsCount}/{accuracy.totalSlotsEvaluated}
          </p>
          <span className="text-[10px] text-muted-foreground font-bold">Audited this month</span>
        </div>
      </div>

      {/* Suspension Risk Bar */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Suspension Threshold Progress
            <HelpCircle className="size-3.5" title="Listings are automatically hidden if penalty reaches 50 points." />
          </span>
          <span className={isHighRisk ? 'text-destructive font-black' : 'text-foreground'}>
            {accuracy.negativePointsTotal} / {accuracy.suspensionThreshold} Negative Points
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isHighRisk ? 'bg-rose-500' : isElevated ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {accuracy.negativePointsTotal > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Negative points reduce over time as you complete verified bookings with 100% slot synchronization.
          </p>
        )}
      </div>
    </div>
  );
}
