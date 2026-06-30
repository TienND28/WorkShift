import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  jobPostingId: mongoose.Types.ObjectId;
  positionId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    positionId: {
      type: Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
