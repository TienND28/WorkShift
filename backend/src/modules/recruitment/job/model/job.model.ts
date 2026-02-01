import mongoose, { Schema, Document } from "mongoose";


export interface IJob extends Document {
  jobPostingId: mongoose.Types.ObjectId;
  position: mongoose.Types.ObjectId;
  description?: string;
}

const JobSchema = new Schema<IJob>({
  jobPostingId: { type: Schema.Types.ObjectId, ref: "JobPosting" },
  position: {
    type: Schema.Types.ObjectId,
    ref: "Position",
    required: true,
  },
  description: { type: String },
});

export const Job = mongoose.model<IJob>("Job", JobSchema);
