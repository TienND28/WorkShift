import mongoose, { Schema, Document } from "mongoose";
import type { Availability } from "../../../common/interfaces/availability.interface.js";
import { AvailabilitySchema } from "../../../common/schemas/availability.schema.js";

export type profileStatus = "PUBLIC" | "PRIVATE" | "SUSPENDED";
export type IdentityType = "CITIZEN_ID" | "STUDENT_ID";

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;

  preferredPositions: mongoose.Types.ObjectId[];
  preferredLocations: string[];
  expectedSalary: number;
  availability: Availability[];
  status: profileStatus;

  isIdentityVerified: boolean;
  identityType?: IdentityType;
  identityImages: string[];
  identityRejectReason?: string;

  reliabilityScore: number;
  totalJobsCompleted: number;
  noShowCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema<IWorker>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    preferredPositions: {
      type: [{ type: Schema.Types.ObjectId, ref: "Position" }],
      default: [],
    },
    preferredLocations: { type: [String], default: [] },
    expectedSalary: { type: Number, default: 0 },
    availability: { type: [AvailabilitySchema], default: [] },
    status: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "SUSPENDED"],
      default: "PUBLIC",
      index: true,
    },

    //===== Identity Verification =====
    isIdentityVerified: { type: Boolean, default: false },
    identityType: { type: String, enum: ["CITIZEN_ID", "STUDENT_ID"] },
    identityImages: { type: [String], default: [] },
    identityRejectReason: { type: String },

    // ===== Reliability =====
    reliabilityScore: { type: Number, default: 100, min: 0, max: 200 },
    totalJobsCompleted: { type: Number, default: 0, min: 0 },
    noShowCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

WorkerSchema.index({ preferredPositions: 1, preferredLocations: 1, status: 1 });

export const Worker = mongoose.model<IWorker>("Worker", WorkerSchema);
