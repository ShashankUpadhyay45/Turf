import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMembership extends Document {
  userId: mongoose.Types.ObjectId | string;
  membershipId: mongoose.Types.ObjectId | string;
  startDate: Date;
  endDate: Date;
  status: string;
}

const UserMembershipSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    membershipId: { type: Schema.Types.Mixed, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserMembership = mongoose.models.UserMembership || mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);
