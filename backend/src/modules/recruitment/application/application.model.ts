import mongoose, { Schema, Document } from "mongoose";

export type Status = "pending" | "accepted" | "rejected" | "cancel";

export interface IApplication extends Document {
  workerId: mongoose.Types.ObjectId;
  jobShiftDateId: mongoose.Types.ObjectId;
  status: Status;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "User" },
    jobShiftDateId: { type: Schema.Types.ObjectId, ref: "jobShiftDate" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancel"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);
