import mongoose, { Schema, Document } from "mongoose";

export interface IPosition extends Document {
  code: string;
  name: string;
  industryId: mongoose.Types.ObjectId;
  isActive: Boolean;
}

const PositionSchema = new Schema<IPosition>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  industryId: { type: Schema.Types.ObjectId, ref: "Industry", required: true },
  isActive: { type: Boolean, default: true },
});

export const Position = mongoose.model<IPosition>("Position", PositionSchema);
