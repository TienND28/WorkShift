import { Schema } from "mongoose";
import { DayOfWeek } from "../enums/dayOfWeek.enum";

export const TimeSlotSchema = new Schema(
  {
    day: {
      type: String,
      enum: Object.values(DayOfWeek),
      required: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false }
);
