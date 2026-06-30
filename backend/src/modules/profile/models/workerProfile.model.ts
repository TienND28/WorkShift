import mongoose, { Schema, Document } from "mongoose";

export interface IWorkerAvailability {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface IWorkerProfile extends Document {
  profileId: mongoose.Types.ObjectId;
  bio?: string;
  expectedSalary?: number;
  experienceYears?: number;
  ratingAvg?: number;
  completedShifts: number;
  noShowCount: number;
  preferredIndustryIds: mongoose.Types.ObjectId[];
  preferredPositionIds: mongoose.Types.ObjectId[];
  preferredDistrictIds: mongoose.Types.ObjectId[];
  availabilities: IWorkerAvailability[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkerAvailabilitySchema = new Schema<IWorkerAvailability>(
  {
    weekday: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: true },
);

const WorkerProfileSchema = new Schema<IWorkerProfile>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      unique: true,
    },
    bio: { type: String },
    expectedSalary: { type: Number, min: 0 },
    experienceYears: { type: Number, min: 0, default: 0 },
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    completedShifts: { type: Number, default: 0, min: 0 },
    noShowCount: { type: Number, default: 0, min: 0 },
    preferredIndustryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Industry" }],
      default: [],
    },
    preferredPositionIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Position" }],
      default: [],
    },
    preferredDistrictIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "District" }],
      default: [],
    },
    availabilities: { type: [WorkerAvailabilitySchema], default: [] },
  },
  { timestamps: true },
);

export const WorkerProfile = mongoose.model<IWorkerProfile>(
  "WorkerProfile",
  WorkerProfileSchema,
);
