import type { Request, Response, NextFunction } from "express";
import { ApiError, ValidationError } from "../../utils/errors.js";
import { HttpStatus, ApiMessages } from "../../constants/index.js";
import { isDevelopment } from "../../config/env.js";
import { logger } from "../logger/index.js";
import { buildErrorResponse } from "../response/response.util.js";

/**
 * Global exception filter — maps errors to unified API error response.
 */
export const exceptionFilter = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const logPayload = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    ...(isDevelopment() && { stack: err.stack }),
  };

  if (err instanceof ApiError && err.isOperational) {
    logger.warn(logPayload, "Operational error");
  } else {
    logger.error(logPayload, "Unhandled error");
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      buildErrorResponse(err.message, {
        statusCode: err.statusCode,
        ...(err instanceof ValidationError && err.errors !== undefined
          ? { errors: err.errors }
          : {}),
        ...(isDevelopment() && err.stack ? { stack: err.stack } : {}),
        req,
      }),
    );
  }

  if (err.name === "ValidationError") {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(
      buildErrorResponse(ApiMessages.VALIDATION_ERROR, {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: err.message,
        req,
      }),
    );
  }

  if (err.name === "MongoServerError" && (err as { code?: number }).code === 11000) {
    return res.status(HttpStatus.CONFLICT).json(
      buildErrorResponse("Resource already exists", {
        statusCode: HttpStatus.CONFLICT,
        errors: { code: "DUPLICATE_KEY" },
        req,
      }),
    );
  }

  if (err.name === "CastError") {
    return res.status(HttpStatus.BAD_REQUEST).json(
      buildErrorResponse("Invalid ID format", {
        statusCode: HttpStatus.BAD_REQUEST,
        req,
      }),
    );
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      buildErrorResponse(ApiMessages.INVALID_TOKEN, {
        statusCode: HttpStatus.UNAUTHORIZED,
        req,
      }),
    );
  }

  if (err.name === "TokenExpiredError") {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      buildErrorResponse("Token expired", {
        statusCode: HttpStatus.UNAUTHORIZED,
        req,
      }),
    );
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    buildErrorResponse(ApiMessages.INTERNAL_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ...(isDevelopment() ? { stack: err.message } : {}),
      req,
    }),
  );
};

export const notFoundFilter = (req: Request, res: Response): Response => {
  logger.warn(
    { requestId: req.id, path: req.originalUrl, method: req.method },
    "Route not found",
  );

  return res.status(HttpStatus.NOT_FOUND).json(
    buildErrorResponse(ApiMessages.NOT_FOUND, {
      statusCode: HttpStatus.NOT_FOUND,
      errors: { path: req.originalUrl },
      req,
    }),
  );
};
