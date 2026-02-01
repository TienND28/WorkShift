import { type Request, type Response, type NextFunction } from 'express';
import { z, type ZodTypeAny } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate request using Zod schema
 */
export const validate = (schema: ZodTypeAny) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return next(new ValidationError('Validation failed', formattedErrors));
            }

            next(error);
        }
    };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodTypeAny) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return next(new ValidationError('Body validation failed', formattedErrors));
            }

            next(error);
        }
    };
};

/**
 * Validate only query parameters
 */
export const validateQuery = (schema: ZodTypeAny) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.query);
            req.query = validated as any; // Type assertion needed for Express types
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return next(new ValidationError('Query validation failed', formattedErrors));
            }

            next(error);
        }
    };
};

/**
 * Validate only route parameters
 */
export const validateParams = (schema: ZodTypeAny) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.params);
            req.params = validated as any; // Type assertion needed for Express types
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return next(new ValidationError('Params validation failed', formattedErrors));
            }

            next(error);
        }
    };
};
