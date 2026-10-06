import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingReference: string;
  userId: mongoose.Types.ObjectId | string;
  turfId: mongoose.Types.ObjectId | string;
  sport?: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  membershipDiscount: number;
  rewardDiscount: number;
  finalAmount: number;
  rewardPointsEarned: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    turfId: { type: Schema.Types.Mixed, required: true, index: true },
    sport: { type: String },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    membershipDiscount: { type: Number, default: 0 },
    rewardDiscount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    rewardPointsEarned: { type: Number, default: 100 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    paymentMethod: { type: String, default: 'UPI' },
    qrCode: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
