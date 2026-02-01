import { z } from "zod";
import { UserRole } from "../user/user.schema.js";

/**
 * Register schema
 */
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required",
      })
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({
        message: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
    name: z
      .string({
        message: "Full name is required",
      })
      .min(2, "Full name must be at least 2 characters")
      .trim(),
    phone: z
      .string()
      .trim()
      .transform((val) => (val === "" ? undefined : val))
      .optional()
      .refine(
        (val) => !val || /^[0-9]{10,11}$/.test(val),
        "Phone number must be 10-11 digits"
      ),
    role: z
      .enum([UserRole.WORKER, UserRole.BUSINESS, UserRole.ADMIN] as const, {
        message: "Invalid role",
      })
      .default(UserRole.WORKER),
  }),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required",
      })
      .email("Invalid email format")
      .toLowerCase(),
    password: z.string({
      message: "Password is required",
    }),
  }),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      message: "Refresh token is required",
    }),
  }),
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/)
      .optional(),
    avatar: z.string().url().optional(),
  }),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      message: "Current password is required",
    }),
    newPassword: z
      .string({
        message: "New password is required",
      })
      .min(6, "New password must be at least 6 characters"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
