import mongoose, { Schema, Document } from "mongoose";
import { ShiftSlotStatus } from "../../../../common/enums/shiftSlotStatus.enum.js";

export interface IJobShiftSlot extends Document {
  shiftDateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  jobPostingId: mongoose.Types.ObjectId;
  slotNumber: number;
  status: ShiftSlotStatus;
  workerId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  assignedBy?: mongoose.Types.ObjectId;
  /** Optimistic locking — tăng mỗi lần cập nhật trạng thái */
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobShiftSlotSchema = new Schema<IJobShiftSlot>(
  {
    shiftDateId: {
      type: Schema.Types.ObjectId,
      ref: "JobShiftDate",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    slotNumber: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(ShiftSlotStatus),
      default: ShiftSlotStatus.AVAILABLE,
    },
    workerId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    version: { type: Number, default: 0 },
  },
  { timestamps: true },
);

JobShiftSlotSchema.index({ shiftDateId: 1, slotNumber: 1 }, { unique: true });
JobShiftSlotSchema.index({ shiftDateId: 1, status: 1 });
JobShiftSlotSchema.index(
  { shiftDateId: 1, workerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      workerId: { $type: "objectId" },
      status: { $in: ["ASSIGNED", "RESERVED"] },
    },
  },
);

export const JobShiftSlot = mongoose.model<IJobShiftSlot>(
  "JobShiftSlot",
  JobShiftSlotSchema,
);
