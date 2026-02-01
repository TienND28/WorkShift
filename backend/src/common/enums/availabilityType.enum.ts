export const AvailabilityType = {
    WEEKLY_PATTERN: 'WEEKLY_PATTERN', // Lặp lại hàng tuần
    SPECIFIC_DATES: 'SPECIFIC_DATES', // Ngày cụ thể
} as const;

export type AvailabilityTypeValue = (typeof AvailabilityType)[keyof typeof AvailabilityType];
