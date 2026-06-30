import mongoose, { Schema, Document } from "mongoose";

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  expiredAt: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: { type: String, required: true, index: true },
    ipAddress: { type: String, maxlength: 100 },
    userAgent: { type: String },
    expiredAt: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserSession = mongoose.model<IUserSession>(
  "UserSession",
  UserSessionSchema,
);
