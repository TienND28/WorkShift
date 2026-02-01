import mongoose, { Schema, Document } from "mongoose";

export interface IJobShiftTemplate extends Document {
  jobId: mongoose.Types.ObjectId;
  startHour: number;
  endHour: number;
  salary: number;
}

const JobShiftTemplateSchema = new Schema<IJobShiftTemplate>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    startHour: { type: Number, required: true },
    endHour: { type: Number, required: true },
    salary: { type: Number, required: true },
  },
  { timestamps: true }
);

export const JobShiftTemplate = mongoose.model<IJobShiftTemplate>(
  "JobShiftTemplate",
  JobShiftTemplateSchema
);
