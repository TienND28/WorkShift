import mongoose, { Schema, Document } from "mongoose";

export interface IDistrict {
  provinceId: mongoose.Types.ObjectId;
  code: string;
  name: string;
}

const DistrictSchema = new Schema<IDistrict>(
  {
    provinceId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const District = mongoose.model<IDistrict>("District", DistrictSchema);
