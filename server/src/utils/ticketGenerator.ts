export const generateTicketReference = (): string => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TB-${year}-${randomStr}`;
};

export interface TicketQrData {
  referenceId: string;
  turfName: string;
  date: string;
  time: string;
}

export const generateTicketQrCodeUrl = async (data: TicketQrData): Promise<string> => {
  try {
    const payload = JSON.stringify(data);
    // Return standard verifiable QR code service URL or SVG data URI
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};
