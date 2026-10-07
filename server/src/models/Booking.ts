import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingReference: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  turfId: string;
  turfName?: string;
  turfAddress?: string;
  turfImage?: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  membershipDiscount: number;
  rewardDiscount: number;
  finalAmount: number;
  rewardPointsEarned: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: string;
  qrCode?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String },
    userPhone: { type: String },
    userEmail: { type: String },
    turfId: { type: String, required: true, index: true },
    turfName: { type: String },
    turfAddress: { type: String },
    turfImage: { type: String },
    sport: { type: String, default: 'football' },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    membershipDiscount: { type: Number, default: 0 },
    rewardDiscount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    rewardPointsEarned: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED', 'FAILED'],
      default: 'PAID',
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    paymentMethod: { type: String, default: 'UPI' },
    qrCode: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ turfId: 1, date: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
