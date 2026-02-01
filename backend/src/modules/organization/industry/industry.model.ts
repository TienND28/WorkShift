import mongoose, { Schema, Document } from "mongoose";

export interface IIndustry extends Document {
  code: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
}

const IndustrySchema = new Schema<IIndustry>({
  code: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

export const Industry = mongoose.model<IIndustry>("Industry", IndustrySchema);
