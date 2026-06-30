import mongoose, { Schema, Document } from "mongoose";
import { AuthProvider } from "../../../common/enums/index.js";

export interface IUserAuthProvider extends Document {
  userId: mongoose.Types.ObjectId;
  provider: AuthProvider;
  providerUserId: string;
  providerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserAuthProviderSchema = new Schema<IUserAuthProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: { 
      type: String,
      enum: Object.values(AuthProvider),
      required: true,
    },
    providerUserId: { type: String, required: true },
    providerEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true },
);

UserAuthProviderSchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true },
);

export const UserAuthProvider = mongoose.model<IUserAuthProvider>(
  "UserAuthProvider",
  UserAuthProviderSchema,
);
