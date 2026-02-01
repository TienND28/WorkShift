import mongoose, { Schema, Document } from "mongoose";

export type Gender = "MALE" | "FEMALE" | "ANY";

export interface IJobShiftDate extends Document {
  jobShiftTemplateId: mongoose.Types.ObjectId;
  date: Date;
  quantity: number;
  genderRequirement: Gender;
  salaryOverride?: number;
}

const JobShiftDateSchema = new Schema<IJobShiftDate>(
  {
    jobShiftTemplateId: { type: Schema.Types.ObjectId, ref: "jobShiftSchema" },
    date: { type: Date, required: true },
    quantity: { type: Number, default: 0 },
    genderRequirement: {
      type: String,
      enum: ["MALE", "FEMALE", "ANY"],
      default: "ANY",
    },
    salaryOverride: { type: Number },
  },
  { timestamps: true },
);

export const JobShiftDate = mongoose.model<IJobShiftDate>(
  "JobShiftDate",
  JobShiftDateSchema,
);
