import mongoose, { Schema, Document } from "mongoose";
import { ProfileType } from "../../../common/enums/index.js";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  type: ProfileType;
  createdAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ProfileType),
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

UserProfileSchema.index({ userId: 1, type: 1 }, { unique: true });

export const UserProfile = mongoose.model<IUserProfile>(
  "UserProfile",
  UserProfileSchema,
);
