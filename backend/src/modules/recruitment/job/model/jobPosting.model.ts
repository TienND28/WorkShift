import mongoose, { Schema, Document } from "mongoose";

export type JobPostingStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "EXPIRED";

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

  publishedAt?: Date;

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
      ref: "employer",
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

    requirements: { type: String, default: [] },
    benefits: { type: String, default: [] },
    publishedAt: { type: Date },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED", "EXPIRED"],
      default: "DRAFT",
    },

    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Indexes
JobPostingSchema.index({ organizationId: 1, status: 1 });
JobPostingSchema.index({ status: 1, publishedAt: -1 });
JobPostingSchema.index({ deadline: 1 });

export const JobPosting = mongoose.model<IJobPosting>(
  "JobPosting",
  JobPostingSchema,
);
