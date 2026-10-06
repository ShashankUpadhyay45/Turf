// ============================================================================
// WHATSAPP NOTIFICATION ADAPTER (FRONTEND MOCK ADAPTER)
// ============================================================================
// NOTE: Purely frontend simulation for WhatsApp booking summaries.
// DO NOT CONNECT REAL META CLOUD API / TWILIO CREDENTIALS IN FRONTEND.
//
// Future Backend Endpoint:
// POST /api/v1/notifications/whatsapp/booking-confirmation
// Headers: Authorization: Bearer <token>
// Body: { bookingId, recipientPhone, templateName, parameters }
// ============================================================================

export interface WhatsAppDispatchOptions {
  toPhone: string;
  bookingReference: string;
  turfName: string;
  date: string;
  startTime: string;
  mapsUrl: string;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  status: 'sent' | 'pending' | 'failed';
  provider: 'meta-cloud-mock' | 'twilio-mock';
  messageId: string;
  sentAt: string;
}

export const whatsappAdapter = {
  /**
   * Future: POST /api/v1/notifications/whatsapp/booking-confirmation
   */
  async sendBookingSummaryWhatsApp(options: WhatsAppDispatchOptions): Promise<WhatsAppDispatchResult> {
    await new Promise((r) => setTimeout(r, 450));

    return {
      success: true,
      status: 'sent',
      provider: 'meta-cloud-mock',
      messageId: `wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
    };
  },
};
