import { generateBookingEmail } from '../templates/bookingEmail.js';
import { generateWhatsAppPayload, generateMetaWhatsAppPayload } from '../templates/whatsAppTemplate.js';
import { notificationQueue } from '../jobs/notificationQueue.js';
import { Notification } from '../models/Notification.js';

class NotificationService {
  async sendBookingConfirmation(booking: any, user: any, turf: any) {
    const bookingRef = booking.bookingReference || booking.referenceId || `TB-2026-${Date.now().toString(36).toUpperCase()}`;
    const mapsLink = turf.latitude && turf.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}&travelmode=driving`
      : 'https://maps.google.com';

    const locationStr = `${turf.area || turf.address || ''}, ${turf.city || 'Dehradun'}`;

    const emailData = {
      bookingRef,
      turfName: turf.name,
      area: turf.area || 'Dehradun',
      city: turf.city || 'Dehradun',
      sport: booking.sport || 'Football',
      date: booking.date,
      time: booking.startTime || booking.time,
      basePrice: booking.amount || booking.basePrice || 0,
      membershipDiscount: booking.membershipDiscount || 0,
      rewardDiscount: booking.rewardDiscount || 0,
      finalAmount: booking.finalAmount || 0,
      pointsEarned: booking.rewardPointsEarned || booking.pointsEarned || 100,
      mapsLink,
      qrCodeUrl: booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingRef)}`,
    };

    const waData = {
      bookingRef,
      turfName: turf.name,
      sport: booking.sport || 'Football',
      date: booking.date,
      time: booking.startTime || booking.time,
      location: locationStr,
      finalAmount: booking.finalAmount || 0,
      pointsEarned: booking.rewardPointsEarned || booking.pointsEarned || 100,
      mapsLink,
    };

    const prefs = user?.notificationPreferences || { email: true, whatsapp: true };

    // 1. Email notification
    if (prefs.email && user?.email) {
      let notifDocId = `notif_email_${Date.now()}`;
      try {
        const notifDoc = await Notification.create({
          userId: user._id || user.id || 'user-1',
          bookingId: booking._id || booking.id || bookingRef,
          channel: 'email',
          recipient: user.email,
          status: 'pending',
          templateName: 'booking_confirmation'
        });
        notifDocId = notifDoc._id.toString();
      } catch {
        // DB fallback
      }

      const emailHtml = generateBookingEmail(emailData);
      notificationQueue.enqueueNotification({
        id: notifDocId,
        type: 'email',
        payload: {
          to: user.email,
          subject: `Playo Match Pass Confirmed — #${bookingRef}`,
          html: emailHtml,
        },
      });
    }

    // 2. WhatsApp notification
    if (prefs.whatsapp && (user?.phone || user?.email)) {
      const recipientPhone = user.phone || '+919876543210';
      let notifDocId = `notif_wa_${Date.now()}`;
      try {
        const notifDoc = await Notification.create({
          userId: user._id || user.id || 'user-1',
          bookingId: booking._id || booking.id || bookingRef,
          channel: 'whatsapp',
          recipient: recipientPhone,
          status: 'pending',
          templateName: 'booking_confirmation_wa'
        });
        notifDocId = notifDoc._id.toString();
      } catch {
        // DB fallback
      }

      const waText = generateWhatsAppPayload(waData);
      const metaPayload = generateMetaWhatsAppPayload(recipientPhone, waData);

      notificationQueue.enqueueNotification({
        id: notifDocId,
        type: 'whatsapp',
        payload: {
          to: recipientPhone,
          text: waText,
          metaPayload,
        },
      });
    }
  }
}

export const notificationService = new NotificationService();
