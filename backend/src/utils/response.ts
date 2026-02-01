import { type Response } from 'express';
import { HttpStatus } from '../constants/index.js';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HttpStatus.OK
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        ...(message && { message }),
        ...(data !== undefined && { data }),
        timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    error?: string
): Response => {
    const response: ApiResponse = {
        success: false,
        message,
        ...(error && { error }),
        timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): Response => {
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<T[]> = {
        success: true,
        ...(message && { message }),
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.OK).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
    res: Response,
    data?: T,
    message?: string
): Response => {
    return sendSuccess(res, data, message, HttpStatus.CREATED);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
    return res.status(HttpStatus.NO_CONTENT).send();
};
