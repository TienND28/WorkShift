import mongoose, { Schema, Document } from "mongoose";

export const UserRole = {
  ADMIN: "admin",
  BUSINESS: "employer",
  WORKER: "worker",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface IUser extends Document {
  role: UserRole;
  name: string;
  phone?: string;
  email: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["admin", "employer", "worker"],
      default: "worker",
    },

    name: { type: String, trim: true, required: true },
    phone: {
      type: String,
      trim: true,
      required: false,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    avatar: { type: String, required: false },

    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
