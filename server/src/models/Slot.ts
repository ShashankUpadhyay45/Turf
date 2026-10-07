import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  turfId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';
  bookingId?: string;
  heldUntil?: Date | null;
  heldBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema: Schema = new Schema(
  {
    turfId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'booked', 'held', 'unavailable', 'maintenance'],
      default: 'available',
      index: true,
    },
    bookingId: { type: String },
    heldUntil: { type: Date, default: null },
    heldBy: { type: String, default: null },
  },
  { timestamps: true }
);

SlotSchema.index({ turfId: 1, date: 1, startTime: 1 }, { unique: true });
SlotSchema.index({ status: 1, heldUntil: 1 });

export const Slot = mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);
