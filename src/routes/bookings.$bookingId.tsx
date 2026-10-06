import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, XCircle, HelpCircle } from 'lucide-react';
import { DigitalTicket } from '@/components/DigitalTicket';
import { ActionLink, Button } from '@/components/ui';
import { useBookingStore } from '@/store/useBookingStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { refundApi } from '@/services/api/refundApi';

export const Route = createFileRoute('/bookings/$bookingId')({
  head: () => ({
    meta: [
      { title: 'Match Digital Ticket Pass — Playo' },
      { name: 'description', content: 'Scannable match entry pass, GPS driving directions, and itemized billing.' },
    ],
  }),
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const getBookingById = useBookingStore((s) => s.getBookingById);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const unblockSlot = useAvailabilityStore((s) => s.unblockSlot);
  const getTurfById = useOwnerStore((s) => s.getTurfById);

  const booking = getBookingById(bookingId);
  const turf = booking ? getTurfById(booking.turfId) : undefined;

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of schedule / plans');
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!booking) {
    return (
      <div className="container-page py-16 text-center space-y-4">
        <h2 className="font-display text-3xl font-black">Booking Pass Not Found</h2>
        <p className="text-xs text-muted-foreground">
          Could not locate a match reservation with reference ID #{bookingId}.
        </p>
        <ActionLink to="/bookings" variant="primary">
          Back to My Bookings
        </ActionLink>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    cancelBooking(booking.id, cancelReason);
    unblockSlot(booking.turfId, booking.date, booking.startTime);
    await refundApi.cancelBookingWithRefund(booking.id, cancelReason);

    setCancelModal(false);
    setToastMessage(`Booking #${booking.referenceCode} cancelled. Refund of ₹${booking.finalPrice} is processing.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeText.trim()) return;

    await refundApi.raiseDispute(booking.id, disputeText);
    setDisputeModal(false);
    setDisputeText('');
    setToastMessage('Dispute report submitted to Playo Customer Arbitration team.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <ActionLink to="/bookings" variant="secondary" size="sm">
          <ArrowLeft className="size-4 mr-1" /> Back to My Bookings
        </ActionLink>

        {booking.status === 'confirmed' && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDisputeModal(true)}
              className="text-xs"
            >
              <HelpCircle className="size-3.5 mr-1 text-muted-foreground" /> Report Issue
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={() => setCancelModal(true)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              <XCircle className="size-3.5 mr-1" /> Cancel Reservation
            </Button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Render Official Digital Ticket Pass */}
      <DigitalTicket
        bookingId={booking.referenceCode}
        turfName={booking.turfName}
        turfAddress={booking.turfAddress ?? turf?.address ?? 'Main Road, Dehradun'}
        turfImage={booking.turfImage ?? turf?.image}
        sport={booking.sport}
        date={booking.date}
        startTime={booking.startTime}
        endTime={booking.endTime}
        basePrice={booking.basePrice}
        membershipDiscount={booking.membershipDiscount}
        rewardDiscount={booking.rewardDiscount}
        finalAmount={booking.finalPrice}
        rewardPointsEarned={booking.rewardPointsEarned}
        latitude={booking.turfLatitude ?? turf?.latitude ?? 30.3398}
        longitude={booking.turfLongitude ?? turf?.longitude ?? 78.0644}
        userEmail={booking.userEmail ?? 'ayush@example.com'}
        userPhone={booking.userPhone ?? '+91 98765 43210'}
        emailStatus="sent"
        whatsAppStatus="sent"
      />

      {/* Cancellation Dialog Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="size-5" />
              <h3 className="font-display text-2xl font-black">CANCEL RESERVATION</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              According to the venue cancellation policy, you are eligible for an immediate{' '}
              <strong>100% refund of ₹{booking.finalPrice}</strong> back to your original payment method.
            </p>

            <div>
              <label className="block text-xs font-bold mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-10 rounded border border-border bg-card px-3 text-xs font-medium"
              >
                <option value="Change of schedule / plans">Change of schedule / plans</option>
                <option value="Team members unavailable">Team members unavailable</option>
                <option value="Bad weather / rain prediction">Bad weather / rain prediction</option>
                <option value="Booked wrong date or time slot">Booked wrong date or time slot</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setCancelModal(false)}>
                Keep Booking
              </Button>
              <Button onClick={handleConfirmCancel} variant="dark" className="text-rose-400">
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Dialog Modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-md p-6 space-y-4">
            <h3 className="font-display text-2xl font-black">REPORT ISSUE / ARBITRATION</h3>
            <p className="text-xs text-muted-foreground">
              Describe any ground discrepancies, turf surface complaints, or double-booking conflicts.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <textarea
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                required
                rows={4}
                placeholder="Explain the issue encountered at the venue..."
                className="w-full rounded border border-input bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setDisputeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Dispute</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
