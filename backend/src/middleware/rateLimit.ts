import rateLimit from "express-rate-limit";
import { isDevelopment } from "../config/env.js";

/** Brute-force protection — chỉ POST /auth/google */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment() ? 200 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many authentication attempts. Please try again later.",
    meta: { timestamp: new Date().toISOString() },
  },
});

/** Giới hạn gửi magic link — chống spam tạo tài khoản */
export const emailAuthRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment() ? 50 : 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Quá nhiều yêu cầu email. Vui lòng thử lại sau.",
    meta: { timestamp: new Date().toISOString() },
  },
});
