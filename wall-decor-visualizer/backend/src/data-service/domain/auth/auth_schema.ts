import mongoose, { Schema, Document } from 'mongoose';

// Domain TypeScript Interfaces
export interface IUser {
  id: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface IOTP {
  otp: string;
  phoneNumber: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
}

export interface IRateLimit {
  key: string;
  count: number;
  expiresAt: Date;
  createdAt: Date;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';
export type OTPStatus = 'valid' | 'expired' | 'used' | 'locked';

// Mongoose Document Interfaces
export interface IUserDocument extends Document {
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOTPDocument extends Document {
  otp: string;
  phoneNumber: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
}

export interface IRateLimitDocument extends Document {
  key: string;
  count: number;
  expiresAt: Date;
  createdAt: Date;
}

// Mongoose Schemas
const UserSchema = new Schema<IUserDocument>({
  phoneNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

// phoneNumber already has unique index from field definition

const OTPSchema = new Schema<IOTPDocument>({
  otp: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  used: { type: Boolean, required: true, default: false },
  failedAttempts: { type: Number, required: true, default: 0 },
  lockedUntil: { type: Date, default: null }
});

// TTL index for automatic expiration
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// phoneNumber already has unique index from field definition

const RateLimitSchema = new Schema<IRateLimitDocument>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 1 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true }
});

// TTL index for automatic expiration
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// key already has unique index from field definition

// Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const OTPModel = mongoose.models.OTP || mongoose.model<IOTPDocument>('OTP', OTPSchema);
export const RateLimitModel = mongoose.models.RateLimit || mongoose.model<IRateLimitDocument>('RateLimit', RateLimitSchema);
