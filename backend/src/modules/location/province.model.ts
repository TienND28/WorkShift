import mongoose, { Schema, Document } from "mongoose";

export interface IProvince extends Document {
  code: string;
  name: string;
}

const ProvinceSchema = new Schema<IProvince>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Province = mongoose.model<IProvince>("Province", ProvinceSchema);
