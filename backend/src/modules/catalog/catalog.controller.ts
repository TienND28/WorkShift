import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/response/response.util.js";
import { catalogService } from "./catalog.service.js";

export const CatalogController = {
  async listIndustries(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await catalogService.listIndustries();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async listPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const industryId = req.query.industryId as string | undefined;
      const result = await catalogService.listPositions(industryId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
