// ============================================================================
// EMAIL NOTIFICATION ADAPTER (FRONTEND MOCK ADAPTER)
// ============================================================================
// NOTE: Purely frontend simulation for match pass ticket email dispatch.
// DO NOT SEND REAL EMAILS OR REQUIRE RESEND / SENDGRID / SMTP CREDENTIALS IN FRONTEND.
//
// Future Backend Endpoint:
// POST /api/v1/notifications/email/booking-confirmation
// Headers: Authorization: Bearer <token>
// Body: { bookingId, recipientEmail, subject, ticketHtml }
// ============================================================================

export interface EmailDispatchOptions {
  to: string;
  bookingReference: string;
  turfName: string;
  date: string;
  startTime: string;
  qrCodeUrl?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  status: 'sent' | 'pending' | 'failed';
  provider: 'resend-mock' | 'sendgrid-mock' | 'smtp-mock';
  messageId: string;
  sentAt: string;
}

export const emailAdapter = {
  /**
   * Future: POST /api/v1/notifications/email/booking-confirmation
   */
  async sendBookingConfirmationEmail(options: EmailDispatchOptions): Promise<EmailDispatchResult> {
    // Simulate slight network transmission delay
    await new Promise((r) => setTimeout(r, 400));

    return {
      success: true,
      status: 'sent',
      provider: 'resend-mock',
      messageId: `msg_email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
    };
  },
};
