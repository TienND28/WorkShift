import { RegexPatterns } from '../constants';

/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    return RegexPatterns.EMAIL.test(email);
};

/**
 * Validate Vietnamese phone number
 * @param phone - Phone number to validate
 * @returns True if phone is valid, false otherwise
 */
export const isValidPhoneVN = (phone: string): boolean => {
    return RegexPatterns.PHONE_VN.test(phone);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns True if password meets requirements, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
    return RegexPatterns.PASSWORD.test(password);
};

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns True if URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
    return RegexPatterns.URL.test(url);
};

/**
 * Sanitize string input (remove extra whitespace)
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
};

