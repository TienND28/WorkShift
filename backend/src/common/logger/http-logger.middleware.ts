import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./logger.js";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: Request, res: Response): string => {
    const existing = req.headers["x-request-id"];
    const raw = Array.isArray(existing) ? existing[0] : existing;
    const id = typeof raw === "string" && raw.length > 0 ? raw : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response, err: Error) => {
    return `${req.method} ${req.url} ${res.statusCode} — ${err.message}`;
  },
});
