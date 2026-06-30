import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/index.js";
import type {
  ApiErrorResponse,
  ApiPaginatedResponse,
  ApiSuccessResponse,
  ResponseMeta,
} from "./api-response.types.js";

const buildMeta = (req?: Request): ResponseMeta => ({
  timestamp: new Date().toISOString(),
  ...(req?.id != null && { requestId: String(req.id) }),
  ...(req?.originalUrl && { path: req.originalUrl }),
});

export const buildSuccessResponse = <T>(
  data: T | undefined,
  options: {
    statusCode?: number;
    message?: string;
    req?: Request;
  } = {},
): ApiSuccessResponse<T> => ({
  success: true,
  statusCode: options.statusCode ?? HttpStatus.OK,
  ...(options.message && { message: options.message }),
  ...(data !== undefined && { data }),
  meta: buildMeta(options.req),
});

export const buildErrorResponse = (
  message: string,
  options: {
    statusCode?: number;
    errors?: unknown;
    stack?: string;
    req?: Request;
  } = {},
): ApiErrorResponse => ({
  success: false,
  statusCode: options.statusCode ?? HttpStatus.BAD_REQUEST,
  message,
  ...(options.errors !== undefined && { errors: options.errors }),
  meta: buildMeta(options.req),
  ...(options.stack && { stack: options.stack }),
});

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HttpStatus.OK,
): Response => {
  const body = buildSuccessResponse(data, {
    statusCode,
    ...(message ? { message } : {}),
    req: res.req,
  });
  return res.status(statusCode).json(body);
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message?: string,
): Response => sendSuccess(res, data, message, HttpStatus.CREATED);

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): Response => {
  const totalPages = Math.ceil(total / limit) || 1;
  const body: ApiPaginatedResponse<T> = {
    ...buildSuccessResponse(data, {
      ...(message ? { message } : {}),
      req: res.req,
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
  return res.status(HttpStatus.OK).json(body);
};

export const sendNoContent = (res: Response): Response =>
  res.status(HttpStatus.NO_CONTENT).send();

/** @deprecated Use buildErrorResponse via exception filter */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HttpStatus.BAD_REQUEST,
  error?: string,
): Response => {
  const body = buildErrorResponse(message, {
    statusCode,
    errors: error,
    req: res.req,
  });
  return res.status(statusCode).json(body);
};
