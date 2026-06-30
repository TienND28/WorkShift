import mongoose, { Schema, Document } from "mongoose";
import { Gender, UserStatus } from "../../../common/enums/index.js";

export interface IUser extends Document {
  username: string;
  fullName: string;
  phone?: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  status: UserStatus;
  isSystemAdmin: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 30,
      index: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    isSystemAdmin: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1, status: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
