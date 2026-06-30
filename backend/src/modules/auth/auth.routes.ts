import { Router } from "express";

import {
  googleAuthSchema,
  refreshTokenSchema,
  selectProfileTypeSchema,
} from "./auth.schema.js";

import { ValidationPipe } from "../../common/pipes/validation.pipe.js";
import { authenticate } from "../../middleware/auth.js";
import { authRateLimiter, emailAuthRateLimiter } from "../../middleware/rateLimit.js";
import { AuthController } from "./auth.controller.js";

/** /api/auth — xác thực & onboarding vai trò */
const router = Router();

// Đăng nhập Google OAuth (idToken từ client)
router.post(
  "/google",
  authRateLimiter,
  ValidationPipe(googleAuthSchema),
  AuthController.googleLogin,
);

// Làm mới access token bằng refresh token
router.post(
  "/refresh",
  ValidationPipe(refreshTokenSchema),
  AuthController.refreshToken,
);

// Thông tin user hiện tại + trạng thái onboarding
router.get("/me", authenticate, AuthController.getProfile);

// Chọn WORKER hoặc EMPLOYER sau khi đăng ký (bước chọn vai trò)
router.post(
  "/select-profile-type",
  authenticate,
  ValidationPipe(selectProfileTypeSchema),
  AuthController.selectProfileType,
);

// Thu hồi phiên đăng nhập (logout)
router.post("/logout", authenticate, AuthController.logout);

export default router;