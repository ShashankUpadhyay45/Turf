export const createBooking = async (data: any, userId: string) => {
  const basePrice = 1000;
  const membershipDiscount = 100;
  const rewardDiscount = data.usePoints ? 50 : 0;
  const finalPrice = basePrice - membershipDiscount - rewardDiscount;
  
  const ref = `TB-2026-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Mock DB booking creation
  const booking = {
    id: 'b1',
    userId,
    turfId: data.turfId,
    date: data.date,
    startTime: data.startTime,
    finalPrice,
    reference: ref,
    qrCode: `qr-${ref}`,
    status: 'CONFIRMED'
  };
  
  return booking;
};

export const getUserBookings = async (userId: string) => {
  return [
    { id: 'b1', userId, status: 'CONFIRMED' }
  ];
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  return { id: bookingId, status: 'CANCELLED' };
};
