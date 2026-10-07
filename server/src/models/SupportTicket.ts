import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'player' | 'owner' | 'admin';
  message: string;
  createdAt: Date;
  attachmentUrl?: string;
}

export interface ISupportTicket extends Document {
  customId: string;
  userId: string;
  userName: string;
  userRole: 'player' | 'owner' | 'admin';
  category: 'booking' | 'payment' | 'venue' | 'account' | 'technical' | 'refund' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  bookingId?: string;
  venueId?: string;
  venueName?: string;
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  messages: ISupportMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    ticketId: { type: String, required: true },
    authorId: { type: String, default: 'admin-1' },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'admin' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    attachmentUrl: { type: String },
  },
  { _id: false }
);

const SupportTicketSchema: Schema = new Schema(
  {
    customId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['player', 'owner', 'admin'], required: true },
    category: {
      type: String,
      enum: ['booking', 'payment', 'venue', 'account', 'technical', 'refund', 'other'],
      default: 'booking',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    bookingId: { type: String },
    venueId: { type: String },
    venueName: { type: String },
    adminNotes: { type: String },
    assignedTo: { type: String },
    resolvedAt: { type: Date },
    messages: { type: [SupportMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
