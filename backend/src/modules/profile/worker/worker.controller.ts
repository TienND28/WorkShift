import { type Request, type Response, type NextFunction } from "express";
import { ApiMessages } from "../../../constants/index.js";
import { sendCreated, sendSuccess } from "../../../common/response/response.util.js";
import type {
  CreateWorkerProfileInput,
  UpdateWorkerProfileInput,
} from "./worker.schema.js";
import { workerService } from "./worker.service.js";

export const WorkerController = {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateWorkerProfileInput = req.body;
      const result = await workerService.createProfile(userId, data);
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await workerService.getProfile(userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getProfileLimits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = workerService.getProfileLimits(userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: UpdateWorkerProfileInput = req.body;
      const { profile, message } = await workerService.updateProfile(
        userId,
        data,
      );
      return sendSuccess(res, profile, message);
    } catch (err) {
      next(err);
    }
  },
};
