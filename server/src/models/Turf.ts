import mongoose, { Document, Schema } from 'mongoose';

export interface IGamingActivity {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerPerson?: number;
  pricePerHour?: number;
  pricePerGame?: number;
  minPlayers?: number;
  maxPlayers?: number;
  durationMinutes?: number;
  icon?: string;
}

export interface ITurf extends Document {
  customId: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  blurb?: string;
  description?: string;
  sports: string[];
  venueCategory: 'sports_turf' | 'indoor_sports' | 'gaming_zone' | 'fitness';
  area: string;
  city: string;
  pincode?: string;
  address?: string;
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  distance?: number;
  rating: number;
  reviewsCount: number;
  pricePerHour: number;
  peakPricePerHour?: number;
  weekendPricePerHour?: number;
  verified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  imageVerified: boolean;
  amenities: string[];
  image?: string;
  images: string[];
  available: boolean;
  placeId?: string;
  operatingHours: { open: string; close: string };
  approvalStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  trustScore: number;
  accuracyScore: number;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  bookingUnit?: 'per_hour' | 'per_person' | 'per_game' | 'per_session' | 'group_package' | 'event_package';
  cancellationPolicy?: string;
  gamingActivities?: IGamingActivity[];
  videos?: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    durationSeconds?: number;
    uploadedAt: string;
  }>;
  websiteUrl?: string;
  instagramHandle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GamingActivitySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    pricePerPerson: { type: Number },
    pricePerHour: { type: Number },
    pricePerGame: { type: Number },
    minPlayers: { type: Number },
    maxPlayers: { type: Number },
    durationMinutes: { type: Number },
    icon: { type: String },
  },
  { _id: false }
);

const TurfSchema: Schema = new Schema(
  {
    customId: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    ownerName: { type: String },
    name: { type: String, required: true, index: true },
    blurb: { type: String },
    description: { type: String },
    sports: { type: [String], default: [], index: true },
    venueCategory: {
      type: String,
      enum: ['sports_turf', 'indoor_sports', 'gaming_zone', 'fitness'],
      default: 'sports_turf',
      index: true,
    },
    area: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    pincode: { type: String },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
    },
    distance: { type: Number },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    pricePerHour: { type: Number, required: true },
    peakPricePerHour: { type: Number },
    weekendPricePerHour: { type: Number },
    verified: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      default: 'VERIFIED',
    },
    imageVerified: { type: Boolean, default: true },
    amenities: { type: [String], default: [] },
    image: { type: String },
    images: { type: [String], default: [] },
    available: { type: Boolean, default: true },
    placeId: { type: String },
    operatingHours: {
      open: { type: String, default: '06:00 AM' },
      close: { type: String, default: '11:00 PM' },
    },
    approvalStatus: {
      type: String,
      default: 'APPROVED',
      index: true,
    },
    trustScore: { type: Number, default: 95 },
    accuracyScore: { type: Number, default: 95 },
    indoorOutdoor: {
      type: String,
      enum: ['indoor', 'outdoor', 'both'],
      default: 'outdoor',
    },
    bookingUnit: {
      type: String,
      enum: ['per_hour', 'per_person', 'per_game', 'per_session', 'group_package', 'event_package'],
      default: 'per_hour',
    },
    cancellationPolicy: { type: String },
    gamingActivities: { type: [GamingActivitySchema], default: [] },
    videos: {
      type: [
        {
          id: String,
          url: String,
          thumbnail: String,
          title: String,
          durationSeconds: Number,
          uploadedAt: String,
        },
      ],
      default: [],
    },
    websiteUrl: { type: String },
    instagramHandle: { type: String },
  },
  { timestamps: true }
);

TurfSchema.index({ location: '2dsphere' });
TurfSchema.index({ city: 1, sport: 1 });
TurfSchema.index({ city: 1, venueCategory: 1 });

export const Turf = mongoose.models.Turf || mongoose.model<ITurf>('Turf', TurfSchema);
