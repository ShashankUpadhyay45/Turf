import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/playo_turf',
  JWT_SECRET: process.env.JWT_SECRET || 'playo_jwt_secret_production_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER || 'mock') as 'resend' | 'sendgrid' | 'smtp' | 'mock',
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
  WHATSAPP_PROVIDER: (process.env.WHATSAPP_PROVIDER || 'mock') as 'meta' | 'twilio' | 'mock',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
};
