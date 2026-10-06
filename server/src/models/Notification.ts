import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  bookingId?: string;
  channel: 'email' | 'whatsapp';
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  messageId?: string;
  templateName?: string;
  attempts: number;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    bookingId: { type: String, index: true },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    recipient: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'retrying'],
      default: 'pending',
    },
    messageId: { type: String },
    templateName: { type: String },
    attempts: { type: Number, default: 0 },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
