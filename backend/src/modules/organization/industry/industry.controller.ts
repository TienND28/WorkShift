import type { Request, Response, NextFunction } from "express";
import { IndustryService } from "./industry.service.js";
import {
  CreateIndustryInput,
  UpdateIndustryInput,
} from "./industry.schema.js";
import { sendCreated, sendSuccess } from "../../../utils/index.js";
import { ApiMessages } from "../../../constants/index.js";

export const IndustryController = {
  /**
   * Create new Industry
   * POST /api/industries
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateIndustryInput = req.body;
      const result = await IndustryService.create(data);

      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get active industries
   * GET /api/industries
   */
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await IndustryService.getActive();
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all industries
   * GET /api/industries/admin/all
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await IndustryService.getAll();
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get industry by id
   * GET /api/industries/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userRole = req.user?.role;
      const result = await IndustryService.getById(id, userRole);

      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update industry
   * PUT /api/industries/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data: UpdateIndustryInput = req.body;
      const result = await IndustryService.update(id, data);

      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete industry
   * DELETE /api/industries/:id
   */

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await IndustryService.delete(id);

      return sendSuccess(res, ApiMessages.RESOURCE_DELETED);
    } catch (err) {
      next(err);
    }
  },
}

