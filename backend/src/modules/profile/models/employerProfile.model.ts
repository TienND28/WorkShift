import mongoose, { Schema, Document } from "mongoose";
import { RecruiterTitle } from "../../../common/enums/recruiterTitle.enum.js";

export interface IEmployerProfile extends Document {
  profileId: mongoose.Types.ObjectId;
  businessName?: string;
  organizationType?: mongoose.Types.ObjectId;
  taxCode?: string;
  recruiterName?: string;
  recruiterTitle?: RecruiterTitle;
  recruiterTitleOther?: string;
  address?: string;
  provinceId?: mongoose.Types.ObjectId;
  districtId?: mongoose.Types.ObjectId;
  wardId?: mongoose.Types.ObjectId;
  coordinates?: { lat: number; lng: number };
  contactPhone?: string;
  contactEmail?: string;
  contactEmailVerified: boolean;
  contactEmailVerifiedAt?: Date;
  logo?: string;
  defaultOrganizationId?: mongoose.Types.ObjectId;
  setupCompletedAt?: Date;
  createdAt: Date;
}

const CoordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const EmployerProfileSchema = new Schema<IEmployerProfile>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      unique: true,
    },
    businessName: { type: String, trim: true, maxlength: 200 },
    organizationType: { type: Schema.Types.ObjectId, ref: "Industry" },
    taxCode: { type: String, trim: true, maxlength: 20 },
    recruiterName: { type: String, trim: true, maxlength: 120 },
    recruiterTitle: {
      type: String,
      enum: Object.values(RecruiterTitle),
    },
    recruiterTitleOther: { type: String, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 500 },
    provinceId: { type: Schema.Types.ObjectId, ref: "Province" },
    districtId: { type: Schema.Types.ObjectId, ref: "District" },
    wardId: { type: Schema.Types.ObjectId, ref: "Ward" },
    coordinates: { type: CoordinatesSchema },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    contactEmailVerified: { type: Boolean, default: false },
    contactEmailVerifiedAt: { type: Date },
    logo: { type: String },
    defaultOrganizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
    setupCompletedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const EmployerProfile = mongoose.model<IEmployerProfile>(
  "EmployerProfile",
  EmployerProfileSchema,
);
