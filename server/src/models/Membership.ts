import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  name: string;
  tier: 'free' | 'play' | 'pro';
  price: number;
  billingCycle: string;
  discountPercent: number;
  rewardMultiplier: number;
  benefits: string[];
  active: boolean;
}

const MembershipSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ['free', 'play', 'pro'], required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, required: true },
    discountPercent: { type: Number, required: true },
    rewardMultiplier: { type: Number, required: true },
    benefits: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Membership = mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);
