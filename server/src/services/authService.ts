import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';

export const register = async (data: any) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const customId = `user-${Date.now()}`;

  const user = await User.create({
    customId,
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    passwordHash,
    role: data.role || 'player',
    membershipTier: 'free',
    rewardBalance: 500,
    city: data.city || 'Dehradun',
    isActive: true,
  });

  const token = jwt.sign(
    { id: user.customId, role: user.role, email: user.email },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const userObj = user.toObject();
  delete (userObj as any).passwordHash;

  return {
    user: {
      ...userObj,
      id: user.customId,
    },
    token,
  };
};

export const login = async (data: any) => {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign(
    { id: user.customId, role: user.role, email: user.email },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const userObj = user.toObject();
  delete (userObj as any).passwordHash;

  return {
    user: {
      ...userObj,
      id: user.customId,
    },
    token,
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findOne({
    $or: [{ customId: userId }, { _id: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null }],
  }).lean();

  if (!user) {
    throw new Error('User not found.');
  }

  const userObj: any = { ...user };
  delete userObj.passwordHash;

  return {
    ...userObj,
    id: (user as any).customId || (user as any)._id.toString(),
  };
};

export const updatePreferences = async (userId: string, prefs: any) => {
  const user = await User.findOneAndUpdate(
    { $or: [{ customId: userId }, { _id: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null }] },
    { $set: { notificationPreferences: prefs } },
    { new: true }
  ).lean();

  return user;
};
