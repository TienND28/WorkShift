import mongoose, { Schema, Document } from "mongoose";

export enum EmailVerificationPurpose {
  EMPLOYER_CONTACT_EMAIL = "EMPLOYER_CONTACT_EMAIL",
}

export interface IEmailVerification extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  purpose: EmailVerificationPurpose;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: Object.values(EmailVerificationPurpose),
      required: true,
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailVerificationSchema.index({ userId: 1, purpose: 1, email: 1 });

export const EmailVerification = mongoose.model<IEmailVerification>(
  "EmailVerification",
  EmailVerificationSchema,
);
