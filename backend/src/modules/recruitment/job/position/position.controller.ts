import type { Request, Response, NextFunction } from "express";
import { ApiMessages } from "../../../../constants/index.js";
import { sendCreated, sendSuccess } from "../../../../utils/index.js";
import type {
  CreatePositionInput,
  UpdatePositionInput,
} from "./position.schema.js";
import { PositionService } from "./position.service.js";

export const PositionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreatePositionInput = req.body;
      const result = await PositionService.create(data);
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const industryId = req.query.industryId as string | undefined;
      const result = await PositionService.getActive(industryId);
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const industryId = req.query.industryId as string | undefined;
      const result = await PositionService.getAll(industryId);
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await PositionService.getById(id);
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data: UpdatePositionInput = req.body;
      const result = await PositionService.update(id, data);
      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await PositionService.delete(id);
      return sendSuccess(res, ApiMessages.RESOURCE_DELETED);
    } catch (err) {
      next(err);
    }
  },
};
