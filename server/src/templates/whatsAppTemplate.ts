export interface WhatsAppTemplateData {
  bookingRef: string;
  turfName: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  finalAmount: number;
  pointsEarned: number;
  mapsLink: string;
}

export const generateWhatsAppPayload = (data: WhatsAppTemplateData): string => {
  return `⚽ Booking Confirmed — Playo Sports
  
Match Booking Reference: ${data.bookingRef}
🏟 Turf: ${data.turfName}
🏅 Sport: ${data.sport}
📅 Date: ${data.date}
⏰ Time: ${data.time}
📍 Location: ${data.location}
💳 Final Amount: ₹${data.finalAmount.toFixed(2)}
🎁 TurfPoints: +${data.pointsEarned}

🗺 Get Directions: ${data.mapsLink}

Show this message or digital ticket at venue check-in. Have a great game!`;
};

// Meta WhatsApp Cloud API structured payload generator
export const generateMetaWhatsAppPayload = (toPhoneNumber: string, data: WhatsAppTemplateData) => {
  return {
    messaging_product: "whatsapp",
    to: toPhoneNumber,
    type: "template",
    template: {
      name: "booking_confirmation",
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.bookingRef },
            { type: "text", text: data.turfName },
            { type: "text", text: data.sport },
            { type: "text", text: data.date },
            { type: "text", text: data.time },
            { type: "text", text: data.location },
            { type: "text", text: data.finalAmount.toFixed(2) },
            { type: "text", text: data.pointsEarned.toString() },
            { type: "text", text: data.mapsLink }
          ]
        }
      ]
    }
  };
};
