import {
  CalendarDays,
  Clock,
  Download,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Mail,
  Phone,
  MessageSquare,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge, Button } from "./ui";

export interface DigitalTicketProps {
  bookingId: string;
  turfName: string;
  turfAddress: string;
  turfImage?: string;
  sport: string;
  date: string;
  startTime: string;
  endTime?: string;
  finalAmount: number;
  basePrice?: number;
  membershipDiscount?: number;
  rewardDiscount?: number;
  rewardPointsEarned: number;
  latitude: number;
  longitude: number;
  userEmail?: string;
  userPhone?: string;
  emailStatus?: "sent" | "pending" | "failed";
  whatsAppStatus?: "sent" | "pending" | "failed";
  cancellationPolicy?: string;
}

export function DigitalTicket({
  bookingId,
  turfName,
  turfAddress,
  turfImage,
  sport,
  date,
  startTime,
  endTime,
  finalAmount,
  basePrice,
  membershipDiscount = 0,
  rewardDiscount = 0,
  rewardPointsEarned,
  latitude,
  longitude,
  userEmail,
  userPhone,
  emailStatus = "sent",
  whatsAppStatus = "sent",
  cancellationPolicy,
}: DigitalTicketProps) {
  const [downloading, setDownloading] = useState(false);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

  const handlePrint = () => {
    window.print();
  };

  // SVG representation of a scannable QR Code encoding the booking reference
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `PLAYO-VERIFIED-BOOKING:${bookingId}`
  )}`;

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl transition">
      {/* Ticket Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 size-48 rounded-full border-[18px] border-white/5 -translate-y-12 translate-x-12" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-white font-display text-lg font-black text-emerald-950">
              P
            </span>
            <span className="font-display text-2xl font-black tracking-tight">
              PLAYO PASS
            </span>
          </div>
          <Badge tone="green">
            <CheckCircle2 className="size-3" /> OFFICIAL PASS
          </Badge>
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
              Booking Reference
            </p>
            <p className="font-mono text-2xl font-black text-white tracking-wider">
              #{bookingId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
              Sport
            </p>
            <p className="font-display text-2xl font-black text-white uppercase">
              {sport}
            </p>
          </div>
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Match Arena Info */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl font-black text-foreground">
              {turfName}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-info shrink-0" />
              {turfAddress}
            </p>
          </div>
          {turfImage && (
            <img
              src={turfImage}
              alt={turfName}
              className="size-16 rounded-lg object-cover border border-border shrink-0 hidden sm:block"
            />
          )}
        </div>

        {/* Match Time & Date Grid */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-4 border border-border/60">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Match Date
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-foreground">
              <CalendarDays className="size-4 text-primary shrink-0" />
              {date}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Match Slot
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-foreground">
              <Clock className="size-4 text-info shrink-0" />
              {startTime} {endTime ? `– ${endTime}` : ""}
            </p>
          </div>
        </div>

        {/* Financial & Loyalty Breakdown */}
        <div className="space-y-2 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
          {basePrice && (
            <div className="flex justify-between">
              <span>Base Hourly Fee</span>
              <span className="text-foreground">₹{basePrice}</span>
            </div>
          )}
          {membershipDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Membership Discount</span>
              <span>− ₹{membershipDiscount}</span>
            </div>
          )}
          {rewardDiscount > 0 && (
            <div className="flex justify-between text-reward">
              <span>TurfPoints Redemption</span>
              <span>− ₹{rewardDiscount}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-border text-foreground font-black text-base">
            <span>Total Paid</span>
            <span className="font-display text-2xl text-foreground">
              ₹{finalAmount}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-reward-soft p-2.5 text-xs text-reward mt-2">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="size-3.5" /> Loyalty Reward Credited
            </span>
            <span className="font-black">+{rewardPointsEarned} TurfPoints</span>
          </div>
        </div>

        {/* QR Code & Verification Stub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-xl border border-dashed border-border p-4 bg-secondary/20">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-info">
              <ShieldCheck className="size-3.5" /> Scannable Gate Pass
            </span>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Present this QR code at the turf reception desk for instant check-in.
            </p>
            <p className="font-mono text-[10px] text-muted-foreground pt-1">
              Encrypted: {bookingId.toUpperCase()}
            </p>
          </div>
          <div className="grid size-28 place-items-center rounded-lg border border-border bg-white p-2 shadow-sm shrink-0">
            <img
              src={qrDataUrl}
              alt="Booking QR Verification Code"
              className="size-full object-contain"
            />
          </div>
        </div>

        {/* Automatic Notification Delivery Status */}
        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Automated Booking Notifications
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-info" />
              <span className="font-medium text-foreground">
                Email ({userEmail ?? "Customer Email"})
              </span>
            </div>
            <Badge tone={emailStatus === "sent" ? "green" : "gold"}>
              {emailStatus === "sent" ? "Delivered ✓" : "Processing"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-success" />
              <span className="font-medium text-foreground">
                WhatsApp ({userPhone ?? "Mobile Device"})
              </span>
            </div>
            <Badge tone={whatsAppStatus === "sent" ? "green" : "gold"}>
              {whatsAppStatus === "sent" ? "Sent via Meta API ✓" : "Processing"}
            </Badge>
          </div>
        </div>

        {/* Per-Venue Cancellation Policy */}
        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1 text-xs">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Venue Cancellation Policy
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {cancellationPolicy ??
              "Full refund available up to 4 hours prior to kickoff. Instant refund credited to original payment source."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-action hover:-translate-y-0.5 transition"
          >
            <Navigation className="size-4" />
            Get Directions
          </a>
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-bold"
          >
            <Download className="size-4" />
            Print Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
