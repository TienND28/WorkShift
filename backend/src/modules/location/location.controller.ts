import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/response/response.util.js";
import { locationService } from "./location.service.js";

export const LocationController = {
  async listProvinces(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await locationService.listProvinces();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async listDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const provinceId = String(req.params.provinceId);
      const result = await locationService.listDistrictsByProvince(provinceId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async listWards(req: Request, res: Response, next: NextFunction) {
    try {
      const districtId = String(req.params.districtId);
      const result = await locationService.listWardsByDistrict(districtId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
