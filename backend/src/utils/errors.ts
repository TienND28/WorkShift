import { HttpStatus, ApiMessages } from '../constants/index.js';

/**
 * Base API Error class
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad Request') {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = ApiMessages.UNAUTHORIZED) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
    constructor(message: string = ApiMessages.FORBIDDEN) {
        super(message, HttpStatus.FORBIDDEN);
    }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
    constructor(message: string = ApiMessages.NOT_FOUND) {
        super(message, HttpStatus.NOT_FOUND);
    }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
    constructor(message: string = 'Conflict') {
        super(message, HttpStatus.CONFLICT);
    }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends ApiError {
    public errors?: any;

    constructor(message: string = ApiMessages.VALIDATION_ERROR, errors?: any) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
        this.errors = errors;
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
    constructor(message: string = ApiMessages.INTERNAL_ERROR) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
