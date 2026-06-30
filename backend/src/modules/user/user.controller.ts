import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../common/response/response.util.js";
import { ApiMessages } from "../../constants/index.js";
import { BadRequestError } from "../../utils/errors.js";
import type { UpdateUserInput } from "./user.update.schema.js";
import { userService } from "./user.service.js";

export const UserController = {
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data: UpdateUserInput = req.body;
      const result = await userService.updateMe(req.user!.userId, data);
      return sendSuccess(res, result, ApiMessages.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next(new BadRequestError("No avatar file uploaded"));
      }
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const result = await userService.updateAvatar(
        req.user!.userId,
        avatarPath,
      );
      return sendSuccess(res, result, ApiMessages.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  },
};
