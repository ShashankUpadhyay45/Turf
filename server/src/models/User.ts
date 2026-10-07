import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  customId: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'player' | 'owner' | 'admin';
  profileImage?: string;
  membershipTier: 'free' | 'play' | 'pro';
  rewardBalance: number;
  city?: string;
  isActive: boolean;
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    customId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['player', 'owner', 'admin'], default: 'player', index: true },
    profileImage: { type: String },
    membershipTier: { type: String, default: 'free' },
    rewardBalance: { type: Number, default: 2450 },
    city: { type: String },
    isActive: { type: Boolean, default: true },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
