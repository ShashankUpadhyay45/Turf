import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async () => {
  try {
    if (!config.MONGODB_URI) {
      console.warn('⚠️ No MONGODB_URI provided. Skipping database connection.');
      return;
    }

    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️ Could not connect to MongoDB. Proceeding with in-memory/mock fallback if supported.');
    if (error instanceof Error) {
      console.warn(`Error details: ${error.message}`);
    }
  }
};
