/**
 * HTTP Status Codes
 */
export const HttpStatus = {
    // Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common API Messages
 */
export const ApiMessages = {
    // Auth
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PROFILE_UPDATED: 'Profile updated successfully',

     // Resource (generic)
    RESOURCE_CREATED: 'Resource created successfully',
    RESOURCE_UPDATED: 'Resource updated successfully',
    RESOURCE_DELETED: 'Resource deleted successfully',
    RESOURCE_FETCHED: 'Resource fetched successfully',
    RESOURCE_TOGGLE: 'Resource toogled successfully',

    // Errors
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    INVALID_TOKEN: 'Invalid or expired token',

    // General
    SUCCESS: 'Operation successful',
    FAILED: 'Operation failed',
} as const;

/**
 * Pagination defaults
 */
export const Pagination = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * Token expiration times (in seconds or string format)
 */
export const TokenExpiration = {
    ACCESS_TOKEN: '15m',  // 15 minutes
    REFRESH_TOKEN: '7d',  // 7 days
    RESET_PASSWORD: '1h', // 1 hour
    EMAIL_VERIFICATION: '24h', // 24 hours
} as const;

/**
 * Regex patterns
 */
export const RegexPatterns = {
    EMAIL: /^\S+@\S+\.\S+$/,
    PHONE_VN: /^(0|\+84)[0-9]{9,10}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    URL: /^https?:\/\/.+/,
} as const;
