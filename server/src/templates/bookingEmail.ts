export interface BookingEmailData {
  bookingRef: string;
  turfName: string;
  area: string;
  city: string;
  sport: string;
  date: string;
  time: string;
  basePrice: number;
  membershipDiscount: number;
  rewardDiscount: number;
  finalAmount: number;
  pointsEarned: number;
  mapsLink: string;
  qrCodeUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export const generateBookingEmail = (data: BookingEmailData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #22c55e; margin: 0; }
    .content { line-height: 1.6; color: #333333; }
    .booking-ref { background: #f0fdf4; padding: 10px; text-align: center; font-size: 1.2em; font-weight: bold; border-radius: 4px; color: #166534; margin-bottom: 20px; }
    .details { margin-bottom: 20px; }
    .details th { text-align: left; padding: 8px; border-bottom: 1px solid #eeeeee; }
    .details td { padding: 8px; border-bottom: 1px solid #eeeeee; }
    .financials { background: #f9fafb; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .points { color: #eab308; font-weight: bold; text-align: center; margin-bottom: 20px; }
    .button-container { text-align: center; margin-bottom: 20px; }
    .button { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; }
    .qr-section { text-align: center; margin-bottom: 20px; }
    .footer { text-align: center; font-size: 0.9em; color: #666666; border-top: 1px solid #eeeeee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Playo &mdash; Match Booking Confirmed</h1>
    </div>
    
    <div class="content">
      <div class="booking-ref">
        Booking ID: ${data.bookingRef}
      </div>
      
      <table class="details" width="100%" cellspacing="0">
        <tr>
          <th>Turf</th>
          <td>${data.turfName}</td>
        </tr>
        <tr>
          <th>Location</th>
          <td>${data.area}, ${data.city}</td>
        </tr>
        <tr>
          <th>Sport</th>
          <td>${data.sport}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>${data.date}</td>
        </tr>
        <tr>
          <th>Time Slot</th>
          <td>${data.time}</td>
        </tr>
      </table>

      <div class="financials">
        <table width="100%" cellspacing="0">
          <tr>
            <td>Base Price:</td>
            <td align="right">&#8377;${data.basePrice.toFixed(2)}</td>
          </tr>
          ${data.membershipDiscount > 0 ? `
          <tr>
            <td>Membership Discount:</td>
            <td align="right">-&#8377;${data.membershipDiscount.toFixed(2)}</td>
          </tr>` : ''}
          ${data.rewardDiscount > 0 ? `
          <tr>
            <td>Reward Points Used:</td>
            <td align="right">-&#8377;${data.rewardDiscount.toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td><strong>Final Amount Paid:</strong></td>
            <td align="right"><strong>&#8377;${data.finalAmount.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="points">
        &#127873; Reward Points Earned: +${data.pointsEarned} TP
      </div>

      <div class="button-container">
        <a href="${data.mapsLink}" class="button">Get Driving Directions</a>
      </div>

      ${data.qrCodeUrl ? `
      <div class="qr-section">
        <p>Show this QR code at the venue check-in:</p>
        <img src="${data.qrCodeUrl}" alt="QR Code" width="150" height="150" />
      </div>` : ''}
    </div>
    
    <div class="footer">
      <p>Need help? Contact our support team.</p>
      <p>Email: ${data.supportEmail || 'support@playosports.test'}</p>
      <p>Phone: ${data.supportPhone || '+91 1800 123 4567'}</p>
    </div>
  </div>
</body>
</html>
  `;
};
