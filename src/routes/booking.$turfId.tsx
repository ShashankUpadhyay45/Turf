import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { 
  Check, ChevronLeft, CreditCard, LockKeyhole, ShieldCheck, Tag, AlertTriangle, 
  Loader2, QrCode, Smartphone, Building2, Wallet, CheckCircle2, Copy, RefreshCw, X
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Badge, Button } from '@/components/ui';
import { turfs } from '@/data/turfs';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useRewardStore } from '@/store/useRewardStore';
import { getMembershipPlan } from '@/data/membership';
import { RouteGuard } from '@/components/RouteGuard';
import { bookingApi } from '@/services/api/bookingApi';

export const Route = createFileRoute('/booking/$turfId')({
  loader: ({ params }) => {
    const t = turfs.find((x) => x.id === params.turfId);
    if (!t) throw notFound();
    return t;
  },
  head: () => ({
    meta: [
      { title: 'Complete Your Booking — Playo' },
      { name: 'description', content: 'Review your turf slot, apply rewards, and choose a payment method.' },
    ],
  }),
  component: BookingWrapper,
});

function BookingWrapper() {
  return (
    <RouteGuard allowedRoles={['player', 'admin']}>
      <Booking />
    </RouteGuard>
  );
}

function Booking() {
  const turf = Route.useLoaderData();
  const navigate = useNavigate();
  const date = useAppStore((s) => s.selectedDate);
  const slot = useAppStore((s) => s.selectedSlot);
  const reward = useAppStore((s) => s.rewardApplied);
  const rewardDiscount = useAppStore((s) => s.rewardDiscount);
  const toggle = useAppStore((s) => s.toggleReward);
  const user = useAuthStore((s) => s.user);
  const addRewardPoints = useAuthStore((s) => s.addRewardPoints);
  const deductRewardPoints = useAuthStore((s) => s.deductRewardPoints);
  const isSlotAvailable = useAvailabilityStore((s) => s.isSlotAvailable);
  const bookSlotInStore = useAvailabilityStore((s) => s.bookSlot);
  const addBooking = useBookingStore((s) => s.addBooking);
  const addTransaction = useRewardStore((s) => s.addTransaction);

  // Payment states
  const [method, setMethod] = useState<'UPI' | 'Card' | 'Net banking' | 'Wallet'>('UPI');
  const [upiSubMethod, setUpiSubMethod] = useState<'vpa' | 'qr' | 'app'>('vpa');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');

  // Net banking & wallet
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Interactive Payment Gateway Modal
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'prompt' | 'processing' | 'success'>('prompt');
  const [upiPin, setUpiPin] = useState(['', '', '', '', '', '']);
  const [otpCode, setOtpCode] = useState('1234');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [transactionRef, setTransactionRef] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [validationError, setValidationError] = useState('');

  const plan = useMemo(() => getMembershipPlan(user?.membershipTier ?? 'free'), [user?.membershipTier]);

  const base = turf.pricePerHour;
  const membershipDiscount = Math.round(base * (plan.discountPercent / 100));
  const rewardValue = reward ? rewardDiscount : 0;
  const finalAmount = Math.max(0, base - membershipDiscount - rewardValue);

  const baseRewardPoints = 100;
  const earnedPoints = Math.round(baseRewardPoints * plan.rewardMultiplier);

  // QR Code expiration timer
  useEffect(() => {
    if (!showGatewayModal && upiSubMethod !== 'qr') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [showGatewayModal, upiSubMethod]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Card Number auto-formatter
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Card Expiry auto-formatter
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // UPI VPA verification
  const handleVerifyUpi = () => {
    setValidationError('');
    if (!upiId.includes('@') || upiId.length < 5) {
      setValidationError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm)');
      setIsUpiVerified(false);
      return;
    }
    setIsUpiVerified(true);
  };

  // Validate and trigger Payment Gateway
  const handleInitiatePayment = () => {
    setValidationError('');
    setBookingError('');

    if (!user || !date || !slot) {
      setBookingError('Booking details missing. Please re-select your slot.');
      return;
    }

    // Validate based on selected method
    if (method === 'UPI') {
      if (upiSubMethod === 'vpa') {
        if (!upiId.trim() || !upiId.includes('@')) {
          setValidationError('Please enter a valid UPI ID (e.g., yourname@okhdfcbank)');
          return;
        }
      }
    } else if (method === 'Card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setValidationError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setValidationError('Please enter card expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setValidationError('Please enter 3-digit CVV.');
        return;
      }
    }

    // Open Payment Gateway Authorization Modal
    setTransactionRef(`UTR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setGatewayStep('prompt');
    setUpiPin(['', '', '', '', '', '']);
    setShowGatewayModal(true);
  };

  // Finalize booking after gateway confirmation
  const handlePaymentAuthorized = async () => {
    if (!user || !date || !slot) return;
    setGatewayStep('processing');
    setIsProcessing(true);

    // Simulate bank authorization delay
    await new Promise((r) => setTimeout(r, 1200));

    // Double-booking check
    const stillAvailable = isSlotAvailable(turf.id, date, slot);
    if (!stillAvailable) {
      setShowGatewayModal(false);
      setBookingError('This slot was just booked by another user. Please choose another available slot.');
      setIsProcessing(false);
      return;
    }

    const bookingId = `PL-${Date.now().toString(36).toUpperCase()}`;

    // Book the slot locally
    const booked = bookSlotInStore(turf.id, date, slot, bookingId);
    if (!booked) {
      setShowGatewayModal(false);
      setBookingError('Unable to book this slot. Please try another slot.');
      setIsProcessing(false);
      return;
    }

    // Deduct reward points if applied
    if (reward && rewardValue > 0) {
      deductRewardPoints(rewardValue);
      addTransaction({
        userId: user.id,
        type: 'redeemed',
        points: -rewardValue,
        description: `₹${rewardValue} discount applied to booking`,
        bookingId,
      });
    }

    // Earn reward points
    addRewardPoints(earnedPoints);
    addTransaction({
      userId: user.id,
      type: 'earned',
      points: earnedPoints,
      description: `Booking completed — ${turf.name}`,
      bookingId,
    });

    const refCode = `TB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingData = {
      id: bookingId,
      referenceCode: refCode,
      turfId: turf.id,
      turfName: turf.name,
      turfAddress: turf.address,
      turfImage: turf.image,
      turfLatitude: turf.latitude,
      turfLongitude: turf.longitude,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone ?? '+91 98765 43210',
      ownerId: turf.ownerId,
      sport: (turf.sports[0] ?? 'football') as any,
      date,
      startTime: slot,
      endTime: slot,
      basePrice: base,
      membershipDiscount,
      rewardDiscount: rewardValue,
      finalPrice: finalAmount,
      status: 'confirmed' as const,
      rewardPointsEarned: earnedPoints,
      createdAt: new Date().toISOString(),
      paymentMethod: method === 'UPI' ? `UPI (${upiSubMethod === 'vpa' ? upiId : selectedUpiApp})` : method,
      paymentStatus: 'PAID' as const,
      qrVerificationCode: `https://playo.in/verify/${refCode}`,
    };

    // Record in local Zustand store
    addBooking(bookingData);

    // Also persist directly into MongoDB Atlas via backend API!
    try {
      await bookingApi.createBooking(bookingData);
    } catch (e) {
      console.warn('[Booking] Saved locally, backend sync note:', e);
    }

    setGatewayStep('success');

    setTimeout(() => {
      setIsProcessing(false);
      setShowGatewayModal(false);
      navigate({ to: '/confirmation/$turfId', params: { turfId: turf.id } });
    }, 1200);
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="container-page py-6 sm:py-8 max-w-full min-w-0 overflow-hidden">
      <Link
        to="/turfs/$turfId"
        params={{ turfId: turf.id }}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold"
      >
        <ChevronLeft className="size-4" />Back to turf
      </Link>

      <div className="mx-auto mt-6 grid max-w-5xl gap-6 sm:gap-7 lg:grid-cols-[1fr_380px] w-full min-w-0">
        <section className="min-w-0">
          <p className="eyebrow">Secure checkout</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">ONE STEP FROM KICKOFF.</h1>

          {bookingError && (
            <div className="mt-5 flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <strong>Booking conflict</strong>
                <p className="mt-1">{bookingError}</p>
              </div>
            </div>
          )}

          {validationError && (
            <div className="mt-5 flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <strong>Payment Details Required</strong>
                <p className="mt-1">{validationError}</p>
              </div>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="card-shell mt-7 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold">Select Payment Method</h2>
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <ShieldCheck className="size-4" /> 256-bit Encrypted
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone, badge: 'Fastest' },
                { id: 'Card', label: 'Cards', icon: CreditCard, badge: 'Visa/MC' },
                { id: 'Net banking', label: 'NetBanking', icon: Building2 },
                { id: 'Wallet', label: 'Wallets', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id as any);
                      setValidationError('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer relative ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-black shadow-sm'
                        : 'border-border bg-card hover:bg-muted text-foreground font-bold'
                    }`}
                  >
                    {m.badge && (
                      <span className="absolute -top-2 right-2 text-[9px] font-black bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full uppercase">
                        {m.badge}
                      </span>
                    )}
                    <Icon className="size-5 mb-1.5 text-primary" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* UPI DETAILS FORM */}
            {method === 'UPI' && (
              <div className="mt-6 border-t border-border/80 pt-5 space-y-4">
                {/* Sub-modes: UPI ID vs Scan QR vs Instant UPI Apps */}
                <div className="flex gap-2 border-b border-border/60 pb-3">
                  {[
                    { id: 'vpa', label: 'Enter UPI ID' },
                    { id: 'qr', label: 'Scan QR Code' },
                    { id: 'app', label: 'UPI Apps' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setUpiSubMethod(sub.id as any);
                        setValidationError('');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        upiSubMethod === sub.id
                          ? 'bg-foreground text-background font-black shadow-sm'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Submode 1: VPA Entry */}
                {upiSubMethod === 'vpa' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="e.g. 9876543210@ybl or yourname@okaxis"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setIsUpiVerified(false);
                            setValidationError('');
                          }}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                        />
                        {isUpiVerified && (
                          <span className="absolute right-3 top-2.5 flex items-center gap-1 text-xs font-bold text-success">
                            <CheckCircle2 className="size-4" /> Verified
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleVerifyUpi}
                        className="rounded-xl px-4 text-xs font-bold shrink-0"
                      >
                        Verify
                      </Button>
                    </div>

                    {/* Quick Handle Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-muted-foreground self-center mr-1">Suggested:</span>
                      {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => {
                            const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'player';
                            setUpiId(`${prefix}${handle}`);
                            setIsUpiVerified(true);
                          }}
                          className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          +{handle}
                        </button>
                      ))}
                    </div>

                    {isUpiVerified && (
                      <div className="rounded-xl bg-success/10 border border-success/30 p-3 text-xs flex items-center justify-between">
                        <div>
                          <strong className="text-success block">Verified UPI Account: {upiId}</strong>
                          <span className="text-muted-foreground text-[11px]">Registered to: {user?.name || 'Authorized Account'}</span>
                        </div>
                        <CheckCircle2 className="size-5 text-success" />
                      </div>
                    )}
                  </div>
                )}

                {/* Submode 2: Dynamic QR Code */}
                {upiSubMethod === 'qr' && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-5 text-center space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground border-b border-border/60 pb-2">
                      <span>Scan & Pay via any UPI App</span>
                      <span className="text-primary font-black flex items-center gap-1">
                        <RefreshCw className="size-3 animate-spin" /> {formatTimer(timerSeconds)}
                      </span>
                    </div>

                    {/* Scaled High-Contrast QR Code */}
                    <div className="mx-auto size-48 rounded-xl bg-white p-3 shadow-md border flex flex-col items-center justify-center relative">
                      <QrCode className="size-36 text-slate-900" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                          PLAYO
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-lg font-black text-foreground">₹{finalAmount}</p>
                      <p className="text-xs text-muted-foreground">
                        Google Pay · PhonePe · Paytm · CRED · BHIM
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('playo.turf@icici');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-card"
                      >
                        <Copy className="size-3.5" />
                        {copiedUpi ? 'Copied VPA!' : 'Copy UPI ID: playo.turf@icici'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submode 3: Instant UPI Apps */}
                {upiSubMethod === 'app' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Choose Your UPI App
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'CRED'].map((appName) => {
                        const isAppSelected = selectedUpiApp === appName;
                        return (
                          <button
                            key={appName}
                            type="button"
                            onClick={() => setSelectedUpiApp(appName)}
                            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                              isAppSelected
                                ? 'border-primary bg-primary/10 text-primary font-black shadow-sm ring-1 ring-primary'
                                : 'border-border bg-card hover:bg-muted text-foreground font-bold'
                            }`}
                          >
                            <Smartphone className="size-5 mb-1 text-primary" />
                            <span className="text-xs">{appName}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Clicking Pay will request authorization through your {selectedUpiApp} app.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CARD DETAILS FORM */}
            {method === 'Card' && (
              <div className="mt-6 border-t border-border/80 pt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Card Number</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4532 8812 9012 3456');
                        setCardExpiry('08/29');
                        setCardCvv('789');
                        setCardName(user?.name || 'Ayush Sharma');
                      }}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Use Demo Card
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">Name on Card</label>
                    <input
                      type="text"
                      placeholder="Cardholder"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NET BANKING FORM */}
            {method === 'Net banking' && (
              <div className="mt-6 border-t border-border/80 pt-5 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Select Your Bank</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer text-xs ${
                        selectedBank === b
                          ? 'border-primary bg-primary/10 text-primary font-black shadow-sm ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted text-foreground font-bold'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WALLETS FORM */}
            {method === 'Wallet' && (
              <div className="mt-6 border-t border-border/80 pt-5 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Select Wallet</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Paytm', 'Amazon Pay', 'PhonePe Wallet', 'MobiKwik'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer text-xs ${
                        selectedWallet === w
                          ? 'border-primary bg-primary/10 text-primary font-black shadow-sm ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted text-foreground font-bold'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Linked to your verified number: {user?.phone || '+91 98765 43210'}
                </p>
              </div>
            )}
          </div>

          {/* Reward toggle */}
          <div className="card-shell mt-4 flex items-center justify-between gap-4 p-5">
            <div>
              <p className="flex items-center gap-2 font-bold">
                <Tag className="size-4 text-reward" />Use TurfPoints
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.rewardPoints ?? 0} points available · save ₹{rewardDiscount}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={toggle}
              role="switch"
              aria-label="Use TurfPoints"
              aria-checked={reward}
              disabled={(user?.rewardPoints ?? 0) < rewardDiscount}
              className={`relative h-7 w-12 rounded-full transition ${
                reward ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-card transition ${
                  reward ? 'left-6' : 'left-1'
                }`}
              />
            </Button>
          </div>

          {/* Membership info */}
          {plan.discountPercent > 0 && (
            <div className="mt-4 rounded-md bg-success-soft p-4 text-sm">
              <strong className="text-success">{plan.name} member</strong>
              <span className="text-muted-foreground">
                {' '}— {plan.discountPercent}% discount + {plan.rewardMultiplier}x reward points applied
              </span>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(
              [
                [LockKeyhole, 'Encrypted payment'],
                [Check, 'Instant confirmation'],
                [ShieldCheck, 'Verified turf'],
              ] as const
            ).map(([Icon, t]) => (
              <div key={t} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Icon className="size-4 text-success" />
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* Order summary sidebar */}
        <aside className="card-shell p-5">
          <img
            src={turf.image}
            alt={turf.name}
            width={1536}
            height={1024}
            className="aspect-[16/9] w-full rounded-md object-cover"
          />
          <div className="mt-4">
            <Badge tone="green">Verified</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">{turf.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formattedDate} · {slot}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{turf.area}, {turf.city}</p>
          </div>

          {/* Price breakdown */}
          <div className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base price</span>
              <strong>₹{base}</strong>
            </div>
            {membershipDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{plan.name} discount ({plan.discountPercent}%)</span>
                <strong className="text-success">− ₹{membershipDiscount}</strong>
              </div>
            )}
            {reward && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TurfPoints</span>
                <strong className="text-reward">− ₹{rewardValue}</strong>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-lg">
              <strong>Final amount</strong>
              <strong>₹{finalAmount}</strong>
            </div>
            <div className="rounded-md bg-reward-soft p-3 text-xs">
              <strong className="text-reward">+{earnedPoints} TurfPoints</strong>
              <span className="text-muted-foreground"> earned after booking</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Button 
            className="mt-5 w-full h-12 rounded-xl text-sm font-black shadow-action" 
            disabled={isProcessing || !date || !slot} 
            onClick={handleInitiatePayment}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Authorizing…
              </>
            ) : method === 'UPI' && upiSubMethod === 'qr' ? (
              `I Have Paid ₹${finalAmount}`
            ) : (
              `Pay ₹${finalAmount} via ${method === 'UPI' ? (upiSubMethod === 'app' ? selectedUpiApp : 'UPI') : method}`
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            A confirmation pass will be issued immediately upon payment authorization.
          </p>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* REALISTIC PAYMENT GATEWAY VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-muted/40 p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-foreground">
                    {method === 'UPI' ? 'NPCI · UPI Payment Gateway' : 'Bank 3D-Secure Authentication'}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Reference: {transactionRef}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Order Context Pill */}
              <div className="rounded-xl bg-muted/30 border border-border/80 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Paying to Playo Sports</span>
                  <span className="font-bold text-sm text-foreground">{turf.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-xl font-black text-foreground">₹{finalAmount}</span>
                  <span className="text-[10px] text-emerald-500 font-bold block">Zero Surcharge</span>
                </div>
              </div>

              {gatewayStep === 'prompt' && (
                <>
                  {method === 'UPI' ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <Smartphone className="size-8 mx-auto text-primary animate-bounce" />
                        <h4 className="font-display font-extrabold text-base text-foreground">
                          {upiSubMethod === 'vpa'
                            ? `Payment Request Sent to ${upiId}`
                            : `Approve via ${selectedUpiApp}`}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Open your UPI app or enter your 6-digit UPI PIN below to approve payment.
                        </p>
                      </div>

                      {/* 6-Digit UPI PIN Input */}
                      <div>
                        <label className="block text-center text-xs font-black text-muted-foreground uppercase mb-2">
                          Enter 6-Digit UPI PIN (Demo: 123456)
                        </label>
                        <div className="flex justify-center gap-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <input
                              key={idx}
                              id={`upi-pin-${idx}`}
                              type="password"
                              maxLength={1}
                              value={upiPin[idx] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const newPin = [...upiPin];
                                newPin[idx] = val;
                                setUpiPin(newPin);
                                if (val && idx < 5) {
                                  const nextInput = document.getElementById(`upi-pin-${idx + 1}`);
                                  nextInput?.focus();
                                }
                              }}
                              className="size-10 sm:size-11 rounded-xl border border-border bg-card text-center text-lg font-black text-foreground focus:border-primary focus:outline-none"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>Expires in: {formatTimer(timerSeconds)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiPin(['1', '2', '3', '4', '5', '6']);
                          }}
                          className="text-primary font-bold hover:underline"
                        >
                          Auto-fill Demo PIN
                        </button>
                      </div>

                      <Button
                        tone="primary"
                        className="w-full h-11 rounded-xl font-black text-sm"
                        onClick={handlePaymentAuthorized}
                      >
                        Authorize Payment · ₹{finalAmount}
                      </Button>
                    </div>
                  ) : (
                    /* Card / NetBanking OTP Modal */
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <LockKeyhole className="size-8 mx-auto text-primary" />
                        <h4 className="font-display font-extrabold text-base text-foreground">
                          Enter One-Time Password (OTP)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Sent to mobile number linked with your {method === 'Card' ? 'Card' : selectedBank} (•••• 4321).
                        </p>
                      </div>

                      <div>
                        <label className="block text-center text-xs font-black text-muted-foreground uppercase mb-2">
                          4-Digit Bank OTP (Demo: 1234)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-36 mx-auto block rounded-xl border border-border bg-card text-center text-xl font-black text-foreground py-2 focus:border-primary focus:outline-none tracking-widest"
                        />
                      </div>

                      <Button
                        tone="primary"
                        className="w-full h-11 rounded-xl font-black text-sm"
                        onClick={handlePaymentAuthorized}
                      >
                        Submit OTP & Pay ₹{finalAmount}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {gatewayStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="size-10 mx-auto animate-spin text-primary" />
                  <h4 className="font-display font-black text-lg text-foreground">Verifying with Bank...</h4>
                  <p className="text-xs text-muted-foreground">
                    Please do not close or refresh this window. Authorizing ₹{finalAmount}...
                  </p>
                </div>
              )}

              {gatewayStep === 'success' && (
                <div className="py-8 text-center space-y-3">
                  <div className="size-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in">
                    <Check className="size-7 stroke-[3]" />
                  </div>
                  <h4 className="font-display font-black text-lg text-emerald-500">Payment Successful!</h4>
                  <p className="text-xs text-muted-foreground">
                    Bank Reference: {transactionRef}. Generating your digital pass...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
