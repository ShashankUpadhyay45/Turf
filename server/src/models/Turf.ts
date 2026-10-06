import mongoose, { Document, Schema } from 'mongoose';

export interface ITurf extends Document {
  ownerId: mongoose.Types.ObjectId | string;
  name: string;
  description?: string;
  sports: string[];
  images: string[];
  amenities: string[];
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  operatingHours: { open: string; close: string };
  slotDuration: number;
  pricePerHour?: number;
  peakPricePerHour?: number;
  weekendPricePerHour?: number;
  rating: number;
  reviews: number;
  status: 'active' | 'pending' | 'suspended';
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TurfSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    description: { type: String },
    sports: { type: [String], default: [] },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    address: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    placeId: { type: String },
    operatingHours: {
      open: { type: String },
      close: { type: String },
    },
    slotDuration: { type: Number, default: 60 },
    pricePerHour: { type: Number },
    peakPricePerHour: { type: Number },
    weekendPricePerHour: { type: Number },
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 100 },
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Turf = mongoose.models.Turf || mongoose.model<ITurf>('Turf', TurfSchema);
