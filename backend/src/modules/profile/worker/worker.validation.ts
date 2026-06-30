import type { Request, Response, NextFunction } from "express";
import { ValidationPipe } from "../../../common/pipes/validation.pipe.js";
import { resolveWorkerMembershipTier } from "../../../config/workerProfileLimits.js";
import {
  createWorkerProfileSchemaForTier,
  updateWorkerProfileSchemaForTier,
} from "./worker.schema.js";

export const validateCreateWorkerProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tier = resolveWorkerMembershipTier(req.user?.userId);
  return ValidationPipe(createWorkerProfileSchemaForTier(tier))(
    req,
    res,
    next,
  );
};

export const validateUpdateWorkerProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tier = resolveWorkerMembershipTier(req.user?.userId);
  return ValidationPipe(updateWorkerProfileSchemaForTier(tier))(
    req,
    res,
    next,
  );
};
