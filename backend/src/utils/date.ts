/**
 * Date utility functions
 */

/**
 * Get current timestamp in ISO format
 * @returns ISO timestamp string
 */
export const getCurrentTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * Format date to ISO string
 * @param date - Date object or string
 * @returns ISO formatted date string
 */
export const formatToISO = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
};

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns True if date is valid, false otherwise
 */
export const isValidDate = (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Format time to HH:mm format
 * @param date - Date object
 * @returns Time string in HH:mm format
 */
export const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
};

