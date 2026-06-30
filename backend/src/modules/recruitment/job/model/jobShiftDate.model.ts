import mongoose, { Schema, Document } from "mongoose";
import { Gender } from "../../../../common/enums/gender.enum.js";
import { ShiftDateStatus } from "../../../../common/enums/shiftDateStatus.enum.js";

export interface IJobShiftDate extends Document {
  jobShiftTemplateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  jobPostingId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalSlots: number;
  assignedCount: number;
  reservedCount: number;
  salary: number;
  genderRequirement: Gender;
  status: ShiftDateStatus;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobShiftDateSchema = new Schema<IJobShiftDate>(
  {
    jobShiftTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "JobShiftTemplate",
      required: true,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalSlots: { type: Number, required: true, min: 1, default: 1 },
    assignedCount: { type: Number, default: 0, min: 0 },
    reservedCount: { type: Number, default: 0, min: 0 },
    salary: { type: Number, required: true, min: 0 },
    genderRequirement: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.ANY,
    },
    status: {
      type: String,
      enum: Object.values(ShiftDateStatus),
      default: ShiftDateStatus.OPEN,
    },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true },
);

JobShiftDateSchema.index(
  { jobShiftTemplateId: 1, date: 1 },
  { unique: true },
);

export const JobShiftDate = mongoose.model<IJobShiftDate>(
  "JobShiftDate",
  JobShiftDateSchema,
);
