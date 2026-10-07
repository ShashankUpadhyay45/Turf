import { Booking } from '../models/Booking';
import { Slot } from '../models/Slot';
import { Turf } from '../models/Turf';
import { User } from '../models/User';

export const createBooking = async (data: any, userId: string) => {
  const reference = `TB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const amount = Number(data.basePrice || data.amount || 600);
  const membershipDiscount = Number(data.membershipDiscount || 0);
  const rewardDiscount = Number(data.rewardDiscount || 0);
  const finalAmount = Math.max(0, amount - membershipDiscount - rewardDiscount);
  const rewardPointsEarned = Math.round(finalAmount * 0.1);

  // Look up turf details if not provided
  let turfName = data.turfName;
  let turfAddress = data.turfAddress;
  let turfImage = data.turfImage;

  if (!turfName || !turfAddress) {
    const turf = await Turf.findOne({
      $or: [{ customId: data.turfId }, { _id: data.turfId.match(/^[0-9a-fA-F]{24}$/) ? data.turfId : null }],
    });
    if (turf) {
      turfName = turfName || turf.name;
      turfAddress = turfAddress || turf.address || `${turf.area}, ${turf.city}`;
      turfImage = turfImage || turf.image;
    }
  }

  // Atomically book the slot
  await Slot.findOneAndUpdate(
    {
      turfId: data.turfId,
      date: data.date,
      startTime: data.startTime,
    },
    {
      $set: {
        status: 'booked',
        bookingId: reference,
        heldUntil: null,
        heldBy: null,
      },
    },
    { upsert: true }
  );

  // Create booking record
  const booking = await Booking.create({
    bookingReference: reference,
    userId: userId || data.userId || 'user-1',
    userName: data.userName,
    userPhone: data.userPhone,
    userEmail: data.userEmail,
    turfId: data.turfId,
    turfName: turfName || 'Sports Venue',
    turfAddress: turfAddress || 'Venue Location',
    turfImage: turfImage || '/assets/turf-champions.webp',
    sport: data.sport || 'football',
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    amount,
    membershipDiscount,
    rewardDiscount,
    finalAmount,
    rewardPointsEarned,
    paymentStatus: 'PAID',
    status: 'confirmed',
    paymentMethod: data.paymentMethod || 'UPI',
    qrCode: `https://playo.in/verify/${reference}`,
  });

  // Update user reward balance if registered user
  if (userId) {
    await User.findOneAndUpdate(
      { $or: [{ customId: userId }, { _id: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null }] },
      { $inc: { rewardBalance: rewardPointsEarned - (rewardDiscount > 0 ? 50 : 0) } }
    );
  }

  return {
    ...booking.toObject(),
    id: booking.bookingReference,
    referenceCode: booking.bookingReference,
    finalPrice: booking.finalAmount,
    basePrice: booking.amount,
  };
};

export const getBookingById = async (bookingId: string) => {
  const booking = await Booking.findOne({
    $or: [{ bookingReference: bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }],
  }).lean();

  if (!booking) return null;

  return {
    ...booking,
    id: (booking as any).bookingReference,
    referenceCode: (booking as any).bookingReference,
    finalPrice: (booking as any).finalAmount,
    basePrice: (booking as any).amount,
  };
};

export const getUserBookings = async (userId: string) => {
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
  return bookings.map((b: any) => ({
    ...b,
    id: b.bookingReference,
    referenceCode: b.bookingReference,
    finalPrice: b.finalAmount,
    basePrice: b.amount,
  }));
};

export const getTurfBookings = async (turfId: string, date?: string) => {
  const query: any = { turfId };
  if (date) query.date = date;
  const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
  return bookings.map((b: any) => ({
    ...b,
    id: b.bookingReference,
    referenceCode: b.bookingReference,
  }));
};

export const cancelBooking = async (bookingId: string, userId?: string, reason?: string) => {
  const booking = await Booking.findOne({
    $or: [{ bookingReference: bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }],
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  booking.status = 'cancelled';
  booking.paymentStatus = 'REFUNDED';
  booking.cancellationReason = reason || 'Customer requested cancellation';
  await booking.save();

  // Free up the slot
  await Slot.findOneAndUpdate(
    {
      turfId: booking.turfId,
      date: booking.date,
      startTime: booking.startTime,
    },
    {
      $set: {
        status: 'available',
        bookingId: null,
        heldUntil: null,
        heldBy: null,
      },
    }
  );

  return {
    success: true,
    refundStatus: 'PROCESSING',
    bookingReference: booking.bookingReference,
  };
};

export const rebook = async (bookingId: string, newDate: string, newStartTime: string) => {
  const booking = await Booking.findOne({
    $or: [{ bookingReference: bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }],
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  // Release old slot
  await Slot.findOneAndUpdate(
    { turfId: booking.turfId, date: booking.date, startTime: booking.startTime },
    { $set: { status: 'available', bookingId: null } }
  );

  // Reserve new slot
  await Slot.findOneAndUpdate(
    { turfId: booking.turfId, date: newDate, startTime: newStartTime },
    { $set: { status: 'booked', bookingId: booking.bookingReference } },
    { upsert: true }
  );

  booking.date = newDate;
  booking.startTime = newStartTime;
  booking.status = 'confirmed';
  await booking.save();

  return {
    success: true,
    booking: {
      ...booking.toObject(),
      id: booking.bookingReference,
      referenceCode: booking.bookingReference,
    },
  };
};
