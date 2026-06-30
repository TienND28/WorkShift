import type { Request, Response, NextFunction } from "express";
import { ProfileType } from "../common/enums/profileType.enum.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export const requireProfileType =
  (...types: ProfileType[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const hasType = types.some((t) => req.user!.profileTypes.includes(t));
    if (!hasType) {
      return next(
        new ForbiddenError(
          `This action requires one of: ${types.join(", ")} profile`,
        ),
      );
    }

    next();
  };
