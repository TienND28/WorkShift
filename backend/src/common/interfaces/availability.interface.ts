import { type DayOfWeekValue } from '../enums/dayOfWeek.enum';
import { type AvailabilityTypeValue } from '../enums/availabilityType.enum';

// TimeSlot cho mẫu hàng tuần (giữ nguyên như cũ)
export interface WeeklyTimeSlot {
    day: DayOfWeekValue;
    from: string; // HH:mm format (e.g., "09:00")
    to: string; // HH:mm format (e.g., "17:00")
}

// TimeSlot cho ngày cụ thể
export interface SpecificDateTimeSlot {
    date: Date; // Ngày cụ thể (e.g., 2026-01-20)
    from: string; // HH:mm format
    to: string; // HH:mm format
}

// Availability tổng hợp
export interface Availability {
    type: AvailabilityTypeValue;
    weeklyPattern?: WeeklyTimeSlot[]; // Sử dụng khi type = WEEKLY_PATTERN
    specificDates?: SpecificDateTimeSlot[]; // Sử dụng khi type = SPECIFIC_DATES
}

// Để backward compatible, giữ lại TimeSlot cũ
export type TimeSlot = WeeklyTimeSlot;
