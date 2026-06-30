import { type Request, type Response, type NextFunction } from "express";
import { ApiMessages } from "../../../constants/index.js";
import {
  sendCreated,
  sendSuccess,
} from "../../../common/response/response.util.js";
import { BadRequestError } from "../../../utils/errors.js";
import { employerService } from "./employer.service.js";
import type {
  SendEmployerEmailOtpInput,
  UpdateEmployerProfileInput,
  VerifyEmployerEmailOtpInput,
} from "./employer.schema.js";

export const EmployerController = {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await employerService.createProfile(userId);
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await employerService.getProfile(userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: UpdateEmployerProfileInput = req.body;
      const result = await employerService.updateProfile(userId, data);
      return sendSuccess(res, result, ApiMessages.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async sendEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: SendEmployerEmailOtpInput = req.body;
      const result = await employerService.sendEmailOtp(userId, data);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: VerifyEmployerEmailOtpInput = req.body;
      const result = await employerService.verifyEmailOtp(userId, data);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Logo file is required (field name: "logo")');
      }

      const userId = req.user!.userId;
      const result = await employerService.uploadLogo(
        userId,
        req.file.filename,
      );
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },
};
