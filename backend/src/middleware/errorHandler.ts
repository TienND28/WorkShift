import { type Request, type Response, type NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/errors.js';
import { ENV, isDevelopment } from '../config/env.js';
import { HttpStatus, ApiMessages } from '../constants/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error
    console.error('❌ Error:', {
        message: err.message,
        stack: isDevelopment() ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Handle ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: isDevelopment() ? err.stack : undefined,
            ...(err instanceof ValidationError && { errors: err.errors }),
            timestamp: new Date().toISOString(),
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            message: ApiMessages.VALIDATION_ERROR,
            errors: err.message,
            timestamp: new Date().toISOString(),
        });
    }

    // Handle Mongoose duplicate key error
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        return res.status(HttpStatus.CONFLICT).json({
            success: false,
            message: 'Duplicate key error',
            error: 'Resource already exists',
            timestamp: new Date().toISOString(),
        });
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid ID format',
            timestamp: new Date().toISOString(),
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: ApiMessages.INVALID_TOKEN,
            timestamp: new Date().toISOString(),
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Token expired',
            timestamp: new Date().toISOString(),
        });
    }

    // Default error
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ApiMessages.INTERNAL_ERROR,
        error: isDevelopment() ? err.message : undefined,
        timestamp: new Date().toISOString(),
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: ApiMessages.NOT_FOUND,
        path: req.path,
        timestamp: new Date().toISOString(),
    });
};
