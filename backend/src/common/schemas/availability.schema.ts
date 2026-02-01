import { Schema } from "mongoose";
import { DayOfWeek } from "../enums/dayOfWeek.enum";
import { AvailabilityType } from "../enums/availabilityType.enum";

// Schema cho Weekly TimeSlot
export const WeeklyTimeSlotSchema = new Schema(
    {
        day: {
            type: String,
            enum: Object.values(DayOfWeek),
            required: true,
        },
        from: { type: String, required: true }, // HH:mm
        to: { type: String, required: true }, // HH:mm
    },
    { _id: false }
);

// Schema cho Specific Date TimeSlot
export const SpecificDateTimeSlotSchema = new Schema(
    {
        date: { type: Date, required: true },
        from: { type: String, required: true }, // HH:mm
        to: { type: String, required: true }, // HH:mm
    },
    { _id: false }
);

// Schema cho Availability
export const AvailabilitySchema = new Schema(
    {
        type: {
            type: String,
            enum: Object.values(AvailabilityType),
            required: true,
        },
        weeklyPattern: {
            type: [WeeklyTimeSlotSchema],
            default: undefined,
        },
        specificDates: {
            type: [SpecificDateTimeSlotSchema],
            default: undefined,
        },
    },
    { _id: false }
);

// Giữ lại TimeSlotSchema cũ để backward compatible
export const TimeSlotSchema = WeeklyTimeSlotSchema;
