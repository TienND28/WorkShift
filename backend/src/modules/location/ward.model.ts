import mongoose, { Schema, Document } from "mongoose";

export interface IWard extends Document {
  districtId: mongoose.Types.ObjectId;
  code: string;
  name: string;
}

const WardSchema = new Schema<IWard>({
  districtId: { type: Schema.Types.ObjectId, required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Ward = mongoose.model<IWard>("Ward", WardSchema);
