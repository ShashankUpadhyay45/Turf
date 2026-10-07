import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  turfId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  sports?: string[];
  verifiedBooking: boolean;
  helpfulCount: number;
  ownerReply?: {
    comment: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    turfId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    sports: { type: [String], default: [] },
    verifiedBooking: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    ownerReply: {
      comment: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ turfId: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
