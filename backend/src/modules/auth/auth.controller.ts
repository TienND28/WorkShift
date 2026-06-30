import { type Request, type Response, type NextFunction } from "express";
import {
  GoogleAuthInput,
  RefreshTokenInput,
  SelectProfileTypeInput,
} from "./auth.schema.js";
import { ApiMessages } from "../../constants/index.js";
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../common/response/response.util.js";

export const AuthController = {

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data: GoogleAuthInput = req.body;
      const result = await authService.loginWithGoogle(data, req);
      return sendSuccess(res, result, ApiMessages.LOGIN_SUCCESS);
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RefreshTokenInput = req.body;
      const result = await authService.refreshToken(data, req);
      return sendSuccess(res, result, ApiMessages.TOKEN_REFRESH_SUCCESS);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getProfile(userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async selectProfileType(req: Request, res: Response, next: NextFunction) {
    try {
      const data: SelectProfileTypeInput = req.body;
      const result = await authService.selectProfileType(
        req.user!.userId,
        data,
        req,
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body?.refreshToken as string | undefined;
      const result = await authService.logout(refreshToken);
      return sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  },
};
