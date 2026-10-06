import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Building2, ShieldCheck, CreditCard, Save, CheckCircle, Phone, Mail } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { VerifiedOwnerBadge } from '@/features/verification/VerificationBadges';

export const Route = createFileRoute('/owner/profile')({
  head: () => ({
    meta: [
      { title: 'Business Profile — Playo Owner' },
      { name: 'description', content: 'Manage business identity, bank payout details, and owner verification.' },
    ],
  }),
  component: OwnerProfilePage,
});

function OwnerProfilePage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const getOwnerAccuracy = useOwnerStore((s) => s.getOwnerAccuracy);
  const accuracy = getOwnerAccuracy(ownerId);

  const [formData, setFormData] = useState({
    businessName: user?.name ?? 'Champions Sports Group',
    contactEmail: user?.email ?? 'owner@champions.com',
    contactPhone: user?.phone ?? '+91 98765 11111',
    gstNumber: '05AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    accountHolder: 'Champions Sports Group LLP',
    bankName: 'HDFC Bank',
    accountNumber: '••••••••8492',
    ifscCode: 'HDFC0001234',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Account Credentials</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-black">BUSINESS PROFILE</h1>
            <VerifiedOwnerBadge />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational identity, tax compliance details, and verified bank payout coordinates.
          </p>
        </div>
      </div>

      {saved && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <CheckCircle className="size-4" />
          Business profile changes saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Credentials Card */}
        <div className="card-shell p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h2 className="font-display text-2xl font-black">Business Entity</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold">
              Registered Business Name
              <input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="grid gap-1 text-xs font-bold">
              Support / Contact Email
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
                className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="grid gap-1 text-xs font-bold">
              Business Contact Phone
              <input
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
                className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="grid gap-1 text-xs font-bold">
              GSTIN Identification
              <input
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Payout & Banking Coordinates */}
        <div className="card-shell p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-emerald-400" />
              <h2 className="font-display text-2xl font-black">Verified Payout Account</h2>
            </div>
            <Badge tone="green">KYC Verified</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Customer booking payments are automatically deposited into this account every Monday.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/40 p-3.5 space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Account Name</span>
              <p className="font-bold text-sm text-foreground">{formData.accountHolder}</p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3.5 space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Bank & Account</span>
              <p className="font-bold text-sm text-foreground">
                {formData.bankName} ({formData.accountNumber})
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="size-4 mr-1.5" /> Save Profile Details
          </Button>
        </div>
      </form>
    </div>
  );
}
