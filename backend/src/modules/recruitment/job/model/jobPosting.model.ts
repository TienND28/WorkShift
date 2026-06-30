import mongoose, { Schema, Document } from "mongoose";
import { JobPostingStatus } from "../../../../common/enums/jobPostingStatus.enum.js";

export interface IJobPosting extends Document {
  organizationId: mongoose.Types.ObjectId;
  posterId: mongoose.Types.ObjectId;

  title: string;
  description?: string;

  location: {
    provinceId?: mongoose.Types.ObjectId;
    districtId?: mongoose.Types.ObjectId;
    wardId?: mongoose.Types.ObjectId;
    address?: string;
  };

  requirements?: string;
  benefits?: string;
  deadline?: Date;

  publishedAt?: Date;
  closedAt?: Date;

  status: JobPostingStatus;

  viewCount: number;
  applicationCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const JobPostingSchema = new Schema<IJobPosting>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    posterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    location: {
      provinceId: { type: Schema.Types.ObjectId, ref: "Province" },
      districtId: { type: Schema.Types.ObjectId, ref: "District" },
      wardId: { type: Schema.Types.ObjectId, ref: "Ward" },
      address: { type: String, trim: true },
    },

    requirements: { type: String, trim: true },
    benefits: { type: String, trim: true },
    deadline: { type: Date },

    publishedAt: { type: Date },
    closedAt: { type: Date },

    status: {
      type: String,
      enum: Object.values(JobPostingStatus),
      default: JobPostingStatus.DRAFT,
    },

    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

JobPostingSchema.index({ organizationId: 1, status: 1 });
JobPostingSchema.index({ status: 1, publishedAt: -1 });

export const JobPosting = mongoose.model<IJobPosting>(
  "JobPosting",
  JobPostingSchema,
);
