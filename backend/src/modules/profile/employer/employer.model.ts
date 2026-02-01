import mongoose, { Schema, Document } from "mongoose";

export type EmployerRole = "admin" | "staff";

export interface IEmployer extends Document {
  userId: mongoose.Types.ObjectId;
  role: EmployerRole;
}

const EmployerSchema = new Schema<IEmployer>({
  userId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ["admin", "staff"] },
});

export const Employer = mongoose.model<IEmployer>("Employer", EmployerSchema);
