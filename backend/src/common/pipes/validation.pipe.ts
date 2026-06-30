import type { Request, Response, NextFunction } from "express";
import { z, type ZodTypeAny } from "zod";
import { ValidationError } from "../../utils/errors.js";

const formatZodErrors = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

/** Express 5 exposes query/params as read-only getters — mutate in place instead of reassignment. */
const replaceReqRecord = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
) => {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, source);
};

/**
 * Validation pipe — parse & assign body, query, params (NestJS-style for Express).
 */
export const ValidationPipe = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as {
        body?: unknown;
        query?: Request["query"];
        params?: Request["params"];
      };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) {
        replaceReqRecord(
          req.query as Record<string, unknown>,
          parsed.query as Record<string, unknown>,
        );
      }
      if (parsed.params !== undefined) {
        replaceReqRecord(
          req.params as Record<string, unknown>,
          parsed.params as Record<string, unknown>,
        );
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError("Validation failed", formatZodErrors(error)),
        );
      }
      next(error);
    }
  };
};

export const ValidateBodyPipe = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError("Body validation failed", formatZodErrors(error)),
        );
      }
      next(error);
    }
  };
};

export const ValidateQueryPipe = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync(req.query)) as Record<string, unknown>;
      replaceReqRecord(req.query as Record<string, unknown>, parsed);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            "Query validation failed",
            formatZodErrors(error),
          ),
        );
      }
      next(error);
    }
  };
};

export const ValidateParamsPipe = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync(req.params)) as Record<string, unknown>;
      replaceReqRecord(req.params as Record<string, unknown>, parsed);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            "Params validation failed",
            formatZodErrors(error),
          ),
        );
      }
      next(error);
    }
  };
};

/** @deprecated Use ValidationPipe */
export const validate = ValidationPipe;
export const validateBody = ValidateBodyPipe;
export const validateQuery = ValidateQueryPipe;
export const validateParams = ValidateParamsPipe;
