import { type Request, type Response, type NextFunction } from "express";
import {
  ChangePasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  UpdateProfileInput,
} from "./auth.schema.js";
import { ApiMessages } from "../../constants/index.js";
import { authService } from "./auth.service.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";

export const AuthController = {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterInput = req.body;
      const result = await authService.register(data);

      return sendCreated(res, result, ApiMessages.REGISTER_SUCCESS);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);

      return sendSuccess(res, result, ApiMessages.LOGIN_SUCCESS);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RefreshTokenInput = req.body;
      const result = await authService.refreshToken(data);

      return sendSuccess(res, result, ApiMessages.TOKEN_REFRESH_SUCCESS);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getProfile(userId);

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: UpdateProfileInput = req.body;
      const result = await authService.updateProfile(userId, data);

      return sendSuccess(res, result, ApiMessages.PROFILE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: ChangePasswordInput = req.body;
      const result = await authService.changePassword(userId, data);

      return sendSuccess(res, result, ApiMessages.PASSWORD_CHANGED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout (client-side token removal)
   * POST /api/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // This endpoint is here for consistency and future enhancements
      return sendSuccess(res, null, ApiMessages.LOGOUT_SUCCESS);
    } catch (err) {
      next(err);
    }
  },
};
