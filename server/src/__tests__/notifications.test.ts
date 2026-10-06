import { describe, it, expect } from 'vitest';
import { generateBookingEmail } from '../templates/bookingEmail';
import { generateWhatsAppPayload } from '../templates/whatsAppTemplate';
import { emailProvider } from '../services/emailProvider';
import { whatsAppProvider } from '../services/whatsAppProvider';

describe('Notification Infrastructure & Templates', () => {
  const sampleBooking = {
    bookingRef: 'TB-2026-8F4K29',
    turfName: 'Champions Arena',
    area: 'Rajpur Road',
    city: 'Dehradun',
    sport: 'Football',
    date: '28 September 2026',
    time: '07:00 PM – 08:00 PM',
    basePrice: 800,
    membershipDiscount: 80,
    rewardDiscount: 50,
    finalAmount: 670,
    pointsEarned: 100,
    mapsLink: 'https://maps.google.com/test',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=test',
  };

  it('generates compliant HTML email containing ticket details and QR code', () => {
    const html = generateBookingEmail(sampleBooking);

    expect(html).toContain('TB-2026-8F4K29');
    expect(html).toContain('Champions Arena');
    expect(html).toContain('Football');
    expect(html).toContain('670.00');
    expect(html).toContain('+100 TP');
    expect(html).toContain('Get Driving Directions');
  });

  it('generates structured WhatsApp message with all required match information', () => {
    const waText = generateWhatsAppPayload({
      bookingRef: sampleBooking.bookingRef,
      turfName: sampleBooking.turfName,
      sport: sampleBooking.sport,
      date: sampleBooking.date,
      time: sampleBooking.time,
      location: `${sampleBooking.area}, ${sampleBooking.city}`,
      finalAmount: sampleBooking.finalAmount,
      pointsEarned: sampleBooking.pointsEarned,
      mapsLink: sampleBooking.mapsLink,
    });

    expect(waText).toContain('TB-2026-8F4K29');
    expect(waText).toContain('Champions Arena');
    expect(waText).toContain('₹670');
    expect(waText).toContain('Get Directions: https://maps.google.com/test');
  });

  it('dispatches mock email cleanly in development mode', async () => {
    const result = await emailProvider.sendEmail({
      to: 'customer@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('dispatches mock WhatsApp message cleanly in development mode', async () => {
    const result = await whatsAppProvider.sendMessage({
      to: '+919876543210',
      text: 'Test message',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
