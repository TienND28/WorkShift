import mongoose, { Schema, Document } from "mongoose";
import { OrganizationMemberRole } from "../../common/enums/organizationMemberRole.enum.js";

export enum OrganizationMemberStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REMOVED = "REMOVED",
}

export interface IOrganizationMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  inviteEmail: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invitedBy: mongoose.Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    inviteEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(OrganizationMemberRole),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrganizationMemberStatus),
      default: OrganizationMemberStatus.ACTIVE,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: { type: Date },
  },
  { timestamps: true },
);

OrganizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $type: "objectId" } },
  },
);

OrganizationMemberSchema.index(
  { organizationId: 1, inviteEmail: 1 },
  { unique: true },
);

export const OrganizationMember = mongoose.model<IOrganizationMember>(
  "OrganizationMember",
  OrganizationMemberSchema,
);
