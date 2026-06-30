import mongoose, { Schema, Document } from "mongoose";
import { Gender } from "../../../../common/enums/gender.enum.js";

export interface IJobShiftTemplate extends Document {
  jobId: mongoose.Types.ObjectId;
  jobPostingId: mongoose.Types.ObjectId;
  name?: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  salary: number;
  slotsPerShift: number;
  genderRequirement: Gender;
  effectiveFrom: Date;
  effectiveTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobShiftTemplateSchema = new Schema<IJobShiftTemplate>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    name: { type: String, trim: true },
    weekdays: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) =>
          v.length > 0 && v.every((d) => d >= 0 && d <= 6),
        message: "weekdays must be 0-6 (Sun-Sat)",
      },
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },
    slotsPerShift: { type: Number, required: true, min: 1, default: 1 },
    genderRequirement: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.ANY,
    },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const JobShiftTemplate = mongoose.model<IJobShiftTemplate>(
  "JobShiftTemplate",
  JobShiftTemplateSchema,
);
