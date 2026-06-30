import { z } from "zod";
import { ProfileType } from "../../common/enums/profileType.enum.js";

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z
      .string({ message: "Google ID token is required" })
      .min(20, "Invalid Google token"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ message: "Refresh token is required" }),
  }),
});

export const logoutSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const selectProfileTypeSchema = z.object({
  body: z.object({
    profileType: z.enum([ProfileType.WORKER, ProfileType.EMPLOYER]),
  }),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type SelectProfileTypeInput = z.infer<
  typeof selectProfileTypeSchema
>["body"];
