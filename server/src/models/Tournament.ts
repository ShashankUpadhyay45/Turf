import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  teamName?: string;
  registeredAt: Date;
  status: 'registered' | 'waitlisted' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  entryFeePaid?: number;
}

export interface ITournament extends Document {
  customId: string;
  venueId: string;
  ownerId: string;
  title: string;
  description: string;
  category?: string;
  sport?: string;
  eventType: string;
  format?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  entryFee: number;
  prizePool?: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  bannerImage?: string;
  rules?: string;
  contactEmail?: string;
  venueName?: string;
  venueCity?: string;
  venueArea?: string;
  publishedAt?: Date;
  registrations: ITournamentRegistration[];
  createdAt: Date;
  updatedAt: Date;
}

const TournamentRegistrationSchema = new Schema(
  {
    id: { type: String, required: true },
    tournamentId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String },
    teamName: { type: String },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'waitlisted', 'cancelled'], default: 'registered' },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
    entryFeePaid: { type: Number, default: 0 },
  },
  { _id: false }
);

const TournamentSchema: Schema = new Schema(
  {
    customId: { type: String, required: true, unique: true, index: true },
    venueId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    sport: { type: String },
    eventType: { type: String, default: 'tournament' },
    format: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    registrationDeadline: { type: String, required: true },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
      default: 'registration_open',
      index: true,
    },
    bannerImage: { type: String },
    rules: { type: String },
    contactEmail: { type: String },
    venueName: { type: String },
    venueCity: { type: String },
    venueArea: { type: String },
    publishedAt: { type: Date },
    registrations: { type: [TournamentRegistrationSchema], default: [] },
  },
  { timestamps: true }
);

TournamentSchema.index({ venueCity: 1, sport: 1 });

export const Tournament = mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);
