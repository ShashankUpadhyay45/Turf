import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  profileImage?: string;
  membershipTier: 'free' | 'play' | 'pro';
  rewardBalance: number;
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'OWNER', 'ADMIN'], default: 'USER' },
    profileImage: { type: String },
    membershipTier: { type: String, enum: ['free', 'play', 'pro'], default: 'free' },
    rewardBalance: { type: Number, default: 100 },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
