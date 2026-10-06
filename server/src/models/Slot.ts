import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  turfId: mongoose.Types.ObjectId | string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';
  bookingId?: string;
  heldUntil?: Date;
}

const SlotSchema: Schema = new Schema(
  {
    turfId: { type: Schema.Types.Mixed, required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'booked', 'held', 'unavailable', 'maintenance'],
      default: 'available',
    },
    bookingId: { type: String },
    heldUntil: { type: Date },
  },
  { timestamps: true }
);

SlotSchema.index({ turfId: 1, date: 1, startTime: 1 }, { unique: true });

export const Slot = mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);
