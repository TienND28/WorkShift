import { type DayOfWeekValue } from '../enums/dayOfWeek.enum.js';

export interface TimeSlot {
    day: DayOfWeekValue;
    from: string; // HH:mm format
    to: string; // HH:mm format
}