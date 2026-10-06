import mongoose, { Document, Schema } from 'mongoose';

export interface IRewardTransaction extends Document {
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description?: string;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RewardTransactionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['earned', 'redeemed', 'expired', 'bonus'], required: true },
    points: { type: Number, required: true },
    description: { type: String },
    bookingId: { type: String },
  },
  { timestamps: true }
);

export const RewardTransaction = mongoose.models.RewardTransaction || mongoose.model<IRewardTransaction>('RewardTransaction', RewardTransactionSchema);
